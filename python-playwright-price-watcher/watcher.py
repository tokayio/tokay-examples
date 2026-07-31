import json
import os
import re
import shutil
import sqlite3
import subprocess
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from urllib.request import Request, urlopen

from playwright.sync_api import sync_playwright


def parse_price(text):
    match = re.search(r"(?:[$£€]\s*)?([0-9]+(?:[,.][0-9]{1,2})?)", text.replace(",", ""))
    if not match:
        raise ValueError(f"No price was found in selector text {text!r}")
    return Decimal(match.group(1).replace(",", "."))


def send_alert(message):
    webhook = os.getenv("ALERT_WEBHOOK_URL", "").strip()
    if not webhook:
        return "log"
    request = Request(
        webhook,
        data=json.dumps({"content": message, "text": message}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=10) as response:
            response.read(64)
        return "webhook"
    except Exception as problem:
        print(f"Alert delivery failed. {problem}")
        return "log"


def main():
    watch_url = os.getenv("WATCH_URL", "https://tokay.io/pricing").strip()
    selector = os.getenv("WATCH_SELECTOR", "h1").strip()
    target_text = os.getenv("TARGET_PRICE", "").strip()
    target_price = Decimal(target_text) if target_text else None
    data_dir = Path(os.getenv("TOKAY_DATA_DIR", "./data"))
    data_dir.mkdir(parents=True, exist_ok=True)

    chromium = shutil.which("chromium")
    if not chromium:
        raise RuntimeError("The chromium system tool was not found on PATH")
    chromium_version = subprocess.run(
        ["chromium", "--version"], check=True, capture_output=True, text=True
    ).stdout.strip()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=chromium, args=["--no-sandbox"])
        try:
            page = browser.new_page(viewport={"width": 1280, "height": 900})
            page.goto(watch_url, wait_until="domcontentloaded", timeout=30000)
            locator = page.locator(selector).first
            if locator.count() == 0:
                raise RuntimeError(f"WATCH_SELECTOR {selector!r} did not match anything at {watch_url}")
            raw_text = locator.inner_text(timeout=5000).strip()
            price = parse_price(raw_text)
            page.screenshot(path=str(data_dir / "last-price.png"), full_page=True)
        finally:
            browser.close()

    database = data_dir / "price-history.sqlite3"
    connection = sqlite3.connect(database)
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS prices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          observed_at TEXT NOT NULL,
          url TEXT NOT NULL,
          selector TEXT NOT NULL,
          raw_text TEXT NOT NULL,
          price TEXT NOT NULL,
          chromium_version TEXT NOT NULL
        )
        """
    )
    previous = connection.execute(
        "SELECT price FROM prices WHERE url = ? AND selector = ? ORDER BY id DESC LIMIT 1",
        (watch_url, selector),
    ).fetchone()
    observed_at = datetime.now(timezone.utc).isoformat()
    connection.execute(
        "INSERT INTO prices (observed_at, url, selector, raw_text, price, chromium_version) VALUES (?, ?, ?, ?, ?, ?)",
        (observed_at, watch_url, selector, raw_text, str(price), chromium_version),
    )
    connection.commit()
    history_count = connection.execute("SELECT count(*) FROM prices").fetchone()[0]
    connection.close()

    previous_price = Decimal(previous[0]) if previous else None
    reasons = []
    if previous_price is not None and price != previous_price:
        reasons.append(f"price changed from {previous_price} to {price}")
    if target_price is not None and previous_price is not None and previous_price > target_price >= price:
        reasons.append(f"target {target_price} reached")
    if reasons:
        message = f"PRICE ALERT at {watch_url}. {' and '.join(reasons)}"
        print(f"{message} via {send_alert(message)}")

    print(json.dumps({
        "event": "price_watch",
        "url": watch_url,
        "selector": selector,
        "price": str(price),
        "previous_price": str(previous_price) if previous_price is not None else None,
        "history_count": history_count,
        "chromium": chromium_version,
        "screenshot": str(data_dir / "last-price.png"),
    }))


if __name__ == "__main__":
    main()

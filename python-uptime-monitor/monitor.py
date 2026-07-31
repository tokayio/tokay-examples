import json
import os
import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def normalized_urls():
    configured = os.getenv("MONITOR_URLS", "https://www.google.com,https://example.com")
    urls = []
    for value in configured.split(","):
        value = value.strip()
        if not value:
            continue
        urls.append(value if "://" in value else f"https://{value}")
    if not urls:
        raise ValueError("MONITOR_URLS did not contain any URLs")
    return urls


def check(url):
    started = time.perf_counter()
    request = Request(url, headers={"User-Agent": "Tokay uptime monitor example"})
    try:
        with urlopen(request, timeout=12) as response:
            status_code = response.status
            response.read(64)
        status = "up" if 200 <= status_code < 400 else "down"
        error = None
    except HTTPError as problem:
        status_code = problem.code
        status = "down"
        error = str(problem)
    except (URLError, TimeoutError, OSError) as problem:
        status_code = None
        status = "down"
        error = str(problem)
    latency_ms = round((time.perf_counter() - started) * 1000)
    return status, status_code, latency_ms, error


def deliver_alert(message):
    webhook = os.getenv("ALERT_WEBHOOK_URL", "").strip()
    if not webhook:
        return "log"
    payload = json.dumps({"content": message, "text": message}).encode()
    request = Request(webhook, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(request, timeout=10) as response:
            response.read(64)
        return "webhook"
    except Exception as problem:
        print(f"Alert delivery failed. {problem}")
        return "log"


def main():
    data_dir = Path(os.getenv("TOKAY_DATA_DIR", "./data"))
    data_dir.mkdir(parents=True, exist_ok=True)
    database = data_dir / "uptime.sqlite3"
    connection = sqlite3.connect(database)
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS checks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          checked_at TEXT NOT NULL,
          url TEXT NOT NULL,
          status TEXT NOT NULL,
          status_code INTEGER,
          latency_ms INTEGER NOT NULL,
          error TEXT
        )
        """
    )
    checked_at = datetime.now(timezone.utc).isoformat()
    results = []
    alerts = 0
    for url in normalized_urls():
        previous = connection.execute(
            "SELECT status FROM checks WHERE url = ? ORDER BY id DESC LIMIT 1", (url,)
        ).fetchone()
        status, status_code, latency_ms, error = check(url)
        connection.execute(
            "INSERT INTO checks (checked_at, url, status, status_code, latency_ms, error) VALUES (?, ?, ?, ?, ?, ?)",
            (checked_at, url, status, status_code, latency_ms, error),
        )
        if previous and previous[0] != status:
            message = f"ALERT {url} changed from {previous[0]} to {status} after {latency_ms} ms"
            delivery = deliver_alert(message)
            print(f"{message} via {delivery}")
            alerts += 1
        results.append({"url": url, "status": status, "status_code": status_code, "latency_ms": latency_ms})
    connection.commit()
    total_checks = connection.execute("SELECT count(*) FROM checks").fetchone()[0]
    connection.close()
    print(json.dumps({"event": "uptime_pass", "checked_at": checked_at, "alerts": alerts, "total_checks": total_checks, "results": results}))


if __name__ == "__main__":
    main()

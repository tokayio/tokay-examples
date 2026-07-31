import html
import os
import re
import sqlite3
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from starlette.concurrency import run_in_threadpool
from weasyprint import HTML


app = FastAPI()
data_dir = Path(os.environ.get("TOKAY_DATA_DIR", Path.cwd() / "data"))
invoice_dir = data_dir / "invoices"
database_path = data_dir / "invoices.sqlite"
invoice_dir.mkdir(parents=True, exist_ok=True)


def connection():
    database = sqlite3.connect(database_path, timeout=30)
    database.row_factory = sqlite3.Row
    return database


def initialize():
    with connection() as database:
        database.executescript(
            """
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS counters (
              name TEXT PRIMARY KEY,
              value INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS invoices (
              number INTEGER PRIMARY KEY,
              client TEXT NOT NULL,
              issued_on TEXT NOT NULL,
              total_cents INTEGER NOT NULL,
              pdf_filename TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            INSERT OR IGNORE INTO counters (name, value) VALUES ('invoice', 0);
            """
        )


def money(cents):
    return f"${cents / 100:,.2f}"


def invoice_html(number, client, issued_on, items):
    total_cents = sum(item["amount_cents"] for item in items)
    rows = "".join(
        f"""
        <tr><td>{html.escape(item['description'])}</td><td>{item['quantity']}</td>
        <td>{money(item['rate_cents'])}</td><td>{money(item['amount_cents'])}</td></tr>
        """
        for item in items
    )
    return f"""<!doctype html>
    <html><head><meta charset="utf-8"><style>
      @page {{ size: Letter; margin: 0; }}
      * {{ box-sizing: border-box; }}
      body {{ margin: 0; color: #202820; font-family: sans-serif; font-size: 11pt; }}
      .page {{ min-height: 11in; padding: .7in; border-top: 18px solid #d77959; }}
      header {{ display: flex; justify-content: space-between; align-items: start; }}
      .brand {{ color: #31594d; font-family: serif; font-size: 27pt; }}
      .invoice {{ text-align: right; }}
      .invoice strong {{ display: block; font-family: serif; font-size: 25pt; }}
      .client {{ margin: .75in 0 .5in; }}
      .label {{ color: #7c7c72; font-size: 8pt; font-weight: bold; letter-spacing: 1.4px; text-transform: uppercase; }}
      .client p {{ margin: 8px 0; font-family: serif; font-size: 19pt; }}
      table {{ width: 100%; border-collapse: collapse; }}
      th {{ padding: 12px 8px; border-bottom: 2px solid #31594d; color: #31594d; font-size: 8pt; letter-spacing: 1px; text-align: left; text-transform: uppercase; }}
      td {{ padding: 16px 8px; border-bottom: 1px solid #ddd8cc; }}
      th:not(:first-child), td:not(:first-child) {{ text-align: right; }}
      .total {{ margin-top: 28px; text-align: right; }}
      .total strong {{ margin-left: 25px; font-family: serif; font-size: 24pt; }}
      footer {{ margin-top: 1.1in; padding-top: 18px; border-top: 1px solid #ddd8cc; color: #696d66; }}
    </style></head><body><div class="page">
      <header><div><div class="brand">June Finch Illustration</div><p>Editorial art and cover work</p></div>
      <div class="invoice"><span class="label">Invoice</span><strong>JFI {number:04d}</strong><p>{issued_on}</p></div></header>
      <section class="client"><span class="label">Prepared for</span><p>{html.escape(client)}</p></section>
      <table><thead><tr><th>Work</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{rows}</tbody></table>
      <div class="total"><span class="label">Total due</span><strong>{money(total_cents)}</strong></div>
      <footer>Thank you. Payment is due within 30 days.</footer>
    </div></body></html>"""


def create_invoice(client, issued_on, items):
    total_cents = sum(item["amount_cents"] for item in items)
    database = connection()
    temporary_path = None
    final_path = None
    try:
        database.execute("BEGIN IMMEDIATE")
        number = database.execute("SELECT value + 1 FROM counters WHERE name = 'invoice'").fetchone()[0]
        filename = f"JFI-{number:04d}.pdf"
        final_path = invoice_dir / filename
        temporary_path = invoice_dir / f".{filename}.tmp"
        HTML(string=invoice_html(number, client, issued_on, items)).write_pdf(temporary_path)
        os.replace(temporary_path, final_path)
        database.execute("UPDATE counters SET value = ? WHERE name = 'invoice'", (number,))
        database.execute(
            "INSERT INTO invoices (number, client, issued_on, total_cents, pdf_filename, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (number, client, issued_on, total_cents, filename, datetime.now(timezone.utc).isoformat()),
        )
        database.commit()
        return number
    except Exception:
        if temporary_path and temporary_path.exists():
            temporary_path.unlink()
        if final_path and final_path.exists():
            final_path.unlink()
        database.rollback()
        raise
    finally:
        database.close()


def seed_invoice():
    with connection() as database:
        exists = database.execute("SELECT 1 FROM invoices LIMIT 1").fetchone()
    if not exists:
        create_invoice(
            "Marrowlight Studio",
            date.today().isoformat(),
            [
                {"description": "Cover illustration", "quantity": 1, "rate_cents": 140000, "amount_cents": 140000},
                {"description": "Color revision round", "quantity": 2, "rate_cents": 17500, "amount_cents": 35000},
            ],
        )


initialize()
seed_invoice()


def page(invoices):
    recent = "".join(
        f"""<a class="invoice-row" href="/invoices/{row['number']}.pdf">
        <span><b>JFI {row['number']:04d}</b><small>{html.escape(row['client'])} · {row['issued_on']}</small></span>
        <strong>{money(row['total_cents'])}</strong></a>"""
        for row in invoices
    )
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>June Finch billing desk</title>
    <style>
      :root{{font-family:ui-sans-serif,system-ui,sans-serif;background:#f0e9df;color:#222a24}}*{{box-sizing:border-box}}body{{margin:0}}header,main{{width:min(1050px,calc(100% - 36px));margin:auto}}header{{padding:25px 0;border-bottom:1px solid #cabfb0;display:flex;justify-content:space-between}}header b{{font:500 1.4rem Georgia,serif}}.hero{{display:grid;grid-template-columns:1.2fr .8fr;gap:50px;align-items:end;padding:75px 0 50px}}.eyebrow{{color:#a24f39;font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}}h1{{margin:10px 0 0;font:500 clamp(3.5rem,8vw,7rem)/.88 Georgia,serif;letter-spacing:-.055em}}.hero>p{{font:1.1rem/1.65 Georgia,serif;color:#66695f}}.desk{{display:grid;grid-template-columns:1.15fr .85fr;gap:25px;padding-bottom:80px}}.panel{{padding:26px;border-radius:18px;background:#fffdf8;box-shadow:0 18px 45px #5a493514}}h2{{font:500 1.8rem Georgia,serif}}label{{display:block;margin:15px 0 6px;font-size:.78rem;font-weight:800}}input,button{{width:100%;padding:12px;border:1px solid #d1c5b4;border-radius:8px;background:white;font:inherit}}.item{{display:grid;grid-template-columns:1fr 75px 105px;gap:8px}}button{{margin-top:20px;border:0;background:#31594d;color:white;font-weight:800;cursor:pointer}}.invoice-row{{display:flex;justify-content:space-between;align-items:center;padding:15px 0;border-bottom:1px solid #e0d8cc;color:inherit;text-decoration:none}}.invoice-row span,.invoice-row small{{display:block}}.invoice-row small{{margin-top:5px;color:#73756d}}.invoice-row>strong{{font:500 1.2rem Georgia,serif}}@media(max-width:760px){{.hero,.desk{{grid-template-columns:1fr}}.item{{grid-template-columns:1fr 65px 90px}}}}
    </style></head><body><header><b>June Finch Illustration</b><span>Billing desk</span></header><main>
      <section class="hero"><div><p class="eyebrow">Make the work official</p><h1>An invoice worth sending.</h1></div><p>Turn illustration work into a clean PDF, keep every copy close, and let the invoice number remember where you left off.</p></section>
      <section class="desk"><form class="panel" action="/invoices" method="post"><h2>New invoice</h2>
        <label for="client">Client studio</label><input id="client" name="client" value="Marrowlight Studio" maxlength="100" required>
        <label for="issued_on">Issue date</label><input id="issued_on" name="issued_on" type="date" value="{date.today().isoformat()}" required>
        <label>Line items</label>
        <div class="item"><input aria-label="First item" name="description" value="Cover illustration" maxlength="100" required><input aria-label="First quantity" name="quantity" type="number" value="1" min="1" max="100" required><input aria-label="First rate" name="rate" value="1400.00" inputmode="decimal" required></div>
        <div class="item"><input aria-label="Second item" name="description" value="Color revisions" maxlength="100"><input aria-label="Second quantity" name="quantity" type="number" value="2" min="1" max="100"><input aria-label="Second rate" name="rate" value="175.00" inputmode="decimal"></div>
        <div class="item"><input aria-label="Third item" name="description" placeholder="Optional third item" maxlength="100"><input aria-label="Third quantity" name="quantity" type="number" min="1" max="100"><input aria-label="Third rate" name="rate" inputmode="decimal"></div>
        <button>Create PDF invoice</button></form>
        <div class="panel"><h2>Recent invoices</h2>{recent}</div></section>
    </main></body></html>"""


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/", response_class=HTMLResponse)
def index():
    with connection() as database:
        invoices = database.execute("SELECT * FROM invoices ORDER BY number DESC LIMIT 12").fetchall()
    return page(invoices)


@app.post("/invoices")
async def add_invoice(request: Request):
    form = await request.form()
    client = str(form.get("client", "")).strip()
    issued_on = str(form.get("issued_on", ""))
    descriptions = [str(value).strip() for value in form.getlist("description")]
    quantities = [str(value).strip() for value in form.getlist("quantity")]
    rates = [str(value).strip() for value in form.getlist("rate")]
    if not client or len(client) > 100:
        raise HTTPException(400, "Enter a client name under 100 characters.")
    try:
        if date.fromisoformat(issued_on).isoformat() != issued_on:
            raise ValueError
    except ValueError as error:
        raise HTTPException(400, "Enter a valid issue date.") from error
    if not len(descriptions) == len(quantities) == len(rates):
        raise HTTPException(400, "Every line needs a description, quantity, and rate.")
    items = []
    for description, quantity_text, rate_text in zip(descriptions, quantities, rates):
        if not description and not quantity_text and not rate_text:
            continue
        if not re.fullmatch(r"\d{1,7}(?:\.\d{1,2})?", rate_text):
            raise HTTPException(400, "Every rate must be a positive decimal amount.")
        try:
            quantity = int(quantity_text)
            rate = Decimal(rate_text)
            rate_cents = int(rate * 100)
        except (ValueError, InvalidOperation, OverflowError):
            raise HTTPException(400, "Every line needs a description, whole quantity, and decimal rate.")
        if not description or len(description) > 100 or not 1 <= quantity <= 100 or rate != Decimal(rate_cents) / 100 or not 1 <= rate_cents <= 100_000_000:
            raise HTTPException(400, "Check each description, quantity, and rate.")
        items.append({"description": description, "quantity": quantity, "rate_cents": rate_cents, "amount_cents": quantity * rate_cents})
    if not items or len(items) > 5:
        raise HTTPException(400, "Include between one and five line items.")
    number = await run_in_threadpool(create_invoice, client, issued_on, items)
    return RedirectResponse(f"/invoices/{number}.pdf", status_code=303)


@app.get("/invoices/{number}.pdf")
def download_invoice(number: int):
    with connection() as database:
        invoice = database.execute("SELECT pdf_filename FROM invoices WHERE number = ?", (number,)).fetchone()
    if not invoice:
        raise HTTPException(404, "Invoice not found.")
    path = invoice_dir / invoice["pdf_filename"]
    if not path.is_file():
        raise HTTPException(404, "Invoice file not found.")
    return FileResponse(path, media_type="application/pdf", filename=invoice["pdf_filename"])

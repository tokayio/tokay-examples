# Python PDF invoice generator

A billing desk turns client and line item details into a polished PDF, assigns the next invoice number, and keeps recent files ready to download. Tokay runs the FastAPI app as one Web Service with persistent SQLite and document storage.

Use it when a browser action needs native document rendering and a durable local record. You declare normal Python packages while Tokay supplies the system libraries WeasyPrint needs.

## Guide and download

Read the full guide at
https://tokay.io/examples/python-pdf-invoice-generator. You can also download the
complete project at
https://tokay.io/examples/downloads/python-pdf-invoice-generator.zip.

## What it does

The page opens with a sample invoice for Marrowlight Studio and a form ready for a new client.

Enter up to three line items with quantities and rates, then press **Create PDF invoice**. The browser downloads a letter sized invoice with calculated totals and the next `JFI` number.

**Recent invoices** keeps the latest 12 files available by client, issue date, and total.

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the invoice app, create one PDF, verify its file signature, and confirm that it is still available after another deployment.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, click the live URL in the top section to open the invoice desk.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, click the live URL in the top section to open the invoice desk.

## Try it

1. Change the client or line items and press **Create PDF invoice**.
2. Open the PDF and note its number, then deploy the app again.
3. Find that file under **Recent invoices** and create another. Its number continues the sequence.

## How it works

You keep control of the document design because the app builds an HTML invoice and WeasyPrint turns that exact markup into the PDF. Tokay includes the native Pango and Cairo libraries around your declared Python package.

SQLite locks the counter while a PDF is created, then records the number only after the file is safely in place. Tokay preserves and replicates both the database and invoice directory. Read [Files and persistent storage](https://tokay.io/docs/persistent-storage) for the protection model.

## Secrets

You do not need a secret. Invoice files and numbering stay in Tokay's persistent storage.

## Grow from here

Try the [receipt box](../node-sqlite-uploads-receipt-box) when the app starts with an uploaded image instead of a generated PDF.

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

## Deploy with your agent

If your client supports remote MCP, connect it to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the browser sign in,
and ask your agent to deploy this folder without pasting a token. Otherwise,
follow the API token steps below.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **You**, then **API & MCP tokens**, and choose **New token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this folder or the example's GitHub URL.
4. Point your agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask your agent to deploy the invoice app, create one PDF, verify its file signature, and confirm that it is still available after another deployment.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Continue the deployment and choose **Go Live** if prompted.
5. When the Service status says **Live**, click the live URL in the top section to open the invoice desk.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Continue the deployment and choose **Go Live** if prompted.
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

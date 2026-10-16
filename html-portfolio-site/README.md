# HTML portfolio site

A responsive type designer portfolio gives visitors a home page, two detailed specimen pages, and an about page. Tokay serves the plain HTML and CSS as one Web Service.

Use this example when your site is already a folder of pages and styles. The fictional designer's site relies on system fonts and CSS shapes, so you can publish it immediately and replace the content at your own pace.

## Guide and download

Read the full guide at https://tokay.io/examples/html-portfolio-site. You can also
download the complete project at
https://tokay.io/examples/downloads/html-portfolio-site.zip.

## What it does

The home page introduces Mara Vale, a fictional type designer, and links to the **Field Note Serif** and **Relay Sans** specimens.

Each specimen gets its own page with sample text, character details, and layouts that adapt to a narrow screen.

The **About** page introduces the designer and keeps the same navigation across the site.

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
5. Ask your agent to deploy the portfolio and check every page link.

Never put the Tokay API token in this folder or in the deployed site.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload this whole folder and choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, click the live URL in the top section to visit the portfolio.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, click the live URL in the top section to visit the portfolio.

## Try it

1. Open both specimen pages and resize your browser until the layout becomes a single column.
2. Change the designer's name or a color in the source, then deploy again.
3. Follow the navigation on the live site and confirm your update appears on every page you changed.

## How it works

You can work on the site without a build tool or JavaScript framework. Tokay detects the static entry page and serves these four HTML files with their shared stylesheet directly.

## Secrets

The portfolio needs no secrets. Every font and visual comes from the browser or this folder.

## Grow from here

Browse the [Tokay examples catalog](..) when your site needs forms, saved data, or server code.

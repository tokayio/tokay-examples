# Ruby Sinatra API

A Sinatra API serves a small todo list with routes for health, runtime details, reads, and writes. Tokay runs the Ruby app with Puma as one Web Service.

Choose this example when you want the shortest route from a Ruby file and Gemfile to a public API. Your app stays ordinary Sinatra code while Tokay handles its service setup.

## Guide and download

Read the full guide at https://tokay.io/examples/ruby-sinatra-api. You can also
download the complete project at
https://tokay.io/examples/downloads/ruby-sinatra-api.zip.

## What it does

Visit the root route to see the Ruby version behind your live service.

The `/todos` route lists three starting items. Post a JSON title to add another. Bad JSON or an empty title returns a `400` response instead of changing the list.

The `/health` route confirms that Puma and the app are responding.

## Deploy with your agent

The fastest path is MCP. Connect your client to the
[Tokay MCP server](https://tokay.io/docs/platform-mcp), approve the sign in
when your browser opens, then ask the agent to deploy this folder. There is
no token to paste.

No MCP support? Use an API token instead.

If your agent already has a Tokay API token, start at step 3.

1. In Tokay, open **Account**, then **API**, and choose **New Token**.
2. Copy the token when it appears and save it in your agent's secret store.
3. Give your agent this folder or its GitHub URL.
4. Point the agent to [Tokay's agent instructions](https://app.tokay.io/llms.txt).
5. Ask the agent to deploy the API and confirm that `/health` returns `{"ok":true}`.

Never put the Tokay API token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `app.rb` and `Gemfile`, then choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, copy the live URL from the top section.

## Push with Git

1. Open Tokay and choose **Add code**, then **Push with Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose the detected Web Service and a Project. Choose **Deploy**.
4. Wait for the deployment to finish. If **Go Live** appears, choose it.
5. When the Service status says **Live**, copy the live URL from the top section.

## Try it

Use your live URL to add a todo and read it back.

```sh
export APP_URL="https://your-app.tokay.app"
curl -X POST "$APP_URL/todos" \
  -H 'Content-Type: application/json' \
  -d '{"title":"ship the next thing"}'
curl "$APP_URL/todos"
```

You will find the new item in the second response. Deploy once more and the original three return because the example keeps its list in memory.

## How it works

You can keep Sinatra's small route based structure. Tokay installs the gems, provides `PORT`, and starts Puma with the same `app.rb` you run locally.

## Secrets

No private values are needed. The full API works as soon as the service is live.

## Grow from here

Browse the [Tokay examples catalog](..) when you want saved data or scheduled work.

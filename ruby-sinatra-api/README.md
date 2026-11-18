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

## Deploy with your AI assistant

[Connect your assistant to Tokay](https://tokay.io/getting-started/use-your-ai-assistant) once if you haven't yet. Then give it this folder or the example's GitHub URL, and ask it to deploy the API and confirm that `/health` returns `{"ok":true}`.

Working from a script instead? Use the [Tokay API](https://tokay.io/docs/api) with [our agent instructions](https://app.tokay.io/llms.txt). Never put a Tokay token in this folder or in the deployed app.

## Paste or upload

1. Open Tokay and choose **Add code**, then **Paste or upload**.
2. Upload `app.rb` and `Gemfile`, then choose **Analyze**.
3. Tokay detects one Web Service. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
5. When the Service status says **Live**, copy the live URL from the top section.

## Push with Git

1. Open Tokay and choose **Add code**, then **Git**.
2. Create a repository and follow the Git setup commands shown by Tokay.
3. Push this folder, then choose **Configure service**. Choose a Project, then choose **Go live**.
4. Continue the deployment and choose **Go live** if prompted.
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

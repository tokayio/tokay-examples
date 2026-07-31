require "json"
require "sinatra"

set :bind, "0.0.0.0"
set :port, ENV.fetch("PORT", "3000")
set :server, :puma

TODOS = [
  { id: 1, title: "deploy this ✓" },
  { id: 2, title: "add a database" },
  { id: 3, title: "tell a friend" }
]

before do
  content_type :json
end

get "/" do
  {
    message: "Hello from Sinatra",
    runtime: "Ruby #{RUBY_VERSION}"
  }.to_json
end

get "/health" do
  { ok: true }.to_json
end

get "/todos" do
  TODOS.to_json
end

post "/todos" do
  input = JSON.parse(request.body.read)
  title = input.is_a?(Hash) ? input.fetch("title", "").to_s.strip : ""
  halt 400, { error: "title is required" }.to_json if title.empty?

  todo = { id: (TODOS.last&.fetch(:id, 0) || 0) + 1, title: title }
  TODOS << todo
  status 201
  todo.to_json
rescue JSON::ParserError
  halt 400, { error: "send a JSON title" }.to_json
end

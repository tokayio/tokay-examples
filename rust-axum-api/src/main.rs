use std::{env, sync::Arc};

use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    routing::get,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use tokio::{net::TcpListener, sync::Mutex};

#[derive(Clone, Serialize)]
struct Todo {
    id: usize,
    title: String,
}

#[derive(Deserialize)]
struct TodoInput {
    title: String,
}

type Todos = Arc<Mutex<Vec<Todo>>>;

async fn hello() -> Json<Value> {
    Json(json!({
        "message": "Hello from Axum",
        "runtime": "Rust",
    }))
}

async fn health() -> Json<Value> {
    Json(json!({ "ok": true }))
}

async fn list_todos(State(todos): State<Todos>) -> Json<Vec<Todo>> {
    Json(todos.lock().await.clone())
}

async fn create_todo(
    State(todos): State<Todos>,
    Json(input): Json<TodoInput>,
) -> Result<(StatusCode, Json<Todo>), (StatusCode, Json<Value>)> {
    let title = input.title.trim();
    if title.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "title is required" })),
        ));
    }

    let mut todos = todos.lock().await;
    let todo = Todo {
        id: todos.last().map_or(1, |item| item.id + 1),
        title: title.to_owned(),
    };
    todos.push(todo.clone());
    Ok((StatusCode::CREATED, Json(todo)))
}

#[tokio::main]
async fn main() {
    let todos = Arc::new(Mutex::new(vec![
        Todo { id: 1, title: "deploy this ✓".into() },
        Todo { id: 2, title: "add a database".into() },
        Todo { id: 3, title: "tell a friend".into() },
    ]));

    let app = Router::new()
        .route("/", get(hello))
        .route("/health", get(health))
        .route("/todos", get(list_todos).post(create_todo))
        .with_state(todos);

    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_owned());
    let listener = TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("bind listener");
    println!("Axum API listening on port {port}");
    axum::serve(listener, app).await.expect("serve API");
}

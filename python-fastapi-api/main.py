import platform
from typing import Annotated

from fastapi import FastAPI
from pydantic import BaseModel, StringConstraints


app = FastAPI(title="Tiny Todo API")
todos = [
    {"id": 1, "title": "deploy this ✓"},
    {"id": 2, "title": "add a database"},
    {"id": 3, "title": "tell a friend"},
]


class TodoInput(BaseModel):
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]


@app.get("/")
def hello():
    return {
        "message": "Hello from FastAPI",
        "runtime": f"Python {platform.python_version()}",
    }


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/todos")
def list_todos():
    return todos


@app.post("/todos", status_code=201)
def create_todo(todo_input: TodoInput):
    todo = {"id": todos[-1]["id"] + 1 if todos else 1, "title": todo_input.title}
    todos.append(todo)
    return todo

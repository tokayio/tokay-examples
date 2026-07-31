package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"runtime"
	"strings"
	"sync"
)

type todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
}

var (
	todos = []todo{
		{ID: 1, Title: "deploy this ✓"},
		{ID: 2, Title: "add a database"},
		{ID: 3, Title: "tell a friend"},
	}
	todosMu sync.Mutex
)

func writeJSON(response http.ResponseWriter, status int, value any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	if err := json.NewEncoder(response).Encode(value); err != nil {
		log.Printf("write response: %v", err)
	}
}

func hello(response http.ResponseWriter, _ *http.Request) {
	writeJSON(response, http.StatusOK, map[string]string{
		"message": "Hello from net/http",
		"runtime": runtime.Version(),
	})
}

func health(response http.ResponseWriter, _ *http.Request) {
	writeJSON(response, http.StatusOK, map[string]bool{"ok": true})
}

func listTodos(response http.ResponseWriter, _ *http.Request) {
	todosMu.Lock()
	defer todosMu.Unlock()
	writeJSON(response, http.StatusOK, todos)
}

func createTodo(response http.ResponseWriter, request *http.Request) {
	var input struct {
		Title string `json:"title"`
	}
	decoder := json.NewDecoder(http.MaxBytesReader(response, request.Body, 1<<20))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil {
		writeJSON(response, http.StatusBadRequest, map[string]string{"error": "send a JSON title"})
		return
	}

	input.Title = strings.TrimSpace(input.Title)
	if input.Title == "" {
		writeJSON(response, http.StatusBadRequest, map[string]string{"error": "title is required"})
		return
	}

	todosMu.Lock()
	created := todo{ID: len(todos) + 1, Title: input.Title}
	todos = append(todos, created)
	todosMu.Unlock()
	writeJSON(response, http.StatusCreated, created)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", hello)
	mux.HandleFunc("GET /health", health)
	mux.HandleFunc("GET /todos", listTodos)
	mux.HandleFunc("POST /todos", createTodo)

	server := &http.Server{Addr: "0.0.0.0:" + port, Handler: mux}
	log.Printf("Go API listening on port %s", port)
	log.Fatal(server.ListenAndServe())
}

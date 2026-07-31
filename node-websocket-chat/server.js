const crypto = require("node:crypto");
const http = require("node:http");
const path = require("node:path");
const express = require("express");
const { WebSocketServer, WebSocket } = require("ws");

const allowedRooms = new Set(["general", "music", "games"]);
const clients = new Map();
const history = new Map([...allowedRooms].map(room => [room, []]));
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_request, response) => response.json({ ok: true }));

const server = http.createServer(app);
const sockets = new WebSocketServer({ server, path: "/ws" });

function clean(value, fallback, maxLength) {
  const text = String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
  return text || fallback;
}

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function broadcast(room, message) {
  for (const [socket, person] of clients) {
    if (person.room === room) send(socket, message);
  }
}

function peopleIn(room) {
  return [...clients.values()]
    .filter(person => person.room === room)
    .map(person => ({ id: person.id, name: person.name, connectedAt: person.connectedAt }))
    .sort((left, right) => left.connectedAt - right.connectedAt);
}

function updatePresence(room) {
  broadcast(room, { type: "presence", people: peopleIn(room) });
}

function addHistory(room, message) {
  const messages = history.get(room);
  messages.push(message);
  if (messages.length > 50) messages.shift();
}

sockets.on("connection", (socket, request) => {
  const url = new URL(request.url, "http://localhost");
  const requestedRoom = clean(url.searchParams.get("room"), "general", 20).toLowerCase();
  const room = allowedRooms.has(requestedRoom) ? requestedRoom : "general";
  const person = {
    id: crypto.randomUUID(),
    name: clean(url.searchParams.get("name"), `Guest ${Math.floor(Math.random() * 900 + 100)}`, 30),
    room,
    connectedAt: Date.now(),
    isAlive: true,
  };
  clients.set(socket, person);
  send(socket, { type: "welcome", person, room, history: history.get(room), people: peopleIn(room) });
  const joined = { type: "notice", id: crypto.randomUUID(), text: `${person.name} joined #${room}`, sentAt: Date.now() };
  addHistory(room, joined);
  broadcast(room, joined);
  updatePresence(room);

  socket.on("pong", () => { person.isAlive = true; });
  socket.on("message", raw => {
    let input;
    try { input = JSON.parse(raw.toString()); } catch { return; }
    if (input.type !== "message") return;
    const text = clean(input.text, "", 500);
    if (!text) return;
    const message = { type: "message", id: crypto.randomUUID(), name: person.name, text, sentAt: Date.now() };
    addHistory(room, message);
    broadcast(room, message);
  });
  socket.on("close", () => {
    if (!clients.delete(socket)) return;
    const left = { type: "notice", id: crypto.randomUUID(), text: `${person.name} left #${room}`, sentAt: Date.now() };
    addHistory(room, left);
    broadcast(room, left);
    updatePresence(room);
  });
});

const heartbeat = setInterval(() => {
  for (const [socket, person] of clients) {
    if (!person.isAlive) {
      socket.terminate();
      continue;
    }
    person.isAlive = false;
    socket.ping();
  }
}, 30000);

const port = Number(process.env.PORT || 3000);
server.listen(port, "0.0.0.0", () => console.log(`WebSocket rooms ready on port ${port}`));

process.on("SIGTERM", () => {
  clearInterval(heartbeat);
  for (const socket of clients.keys()) socket.close(1012, "Service restarting");
  server.close(() => process.exit(0));
});

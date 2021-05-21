const express = require("express");
const morgan = require("morgan");
const http = require("http");
const bus = require("./lib/message-bus");
const { Server: WebSocketServer } = require("ws");

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Long polling routes
app.get("/messages", (req, res) => {
  bus.longPoll((data) => void res.json(data));
});
app.post("/messages", (req, res) => {
  bus.send(req.body);
  res.end();
});

// Http Server
const server = http.createServer(app);
server.listen(3000);

// WebSocket Server
const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    bus.send(data);
  });

  const dispose = bus.addListener((data) => void ws.send(data));
  ws.on("close", () => void dispose());
});

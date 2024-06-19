// Observer pattern
const EventEmitter = require("events");
const http = require("http");

// better to use the class
class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sales();

//set up listener
myEmitter.on("newSale", () => {
  console.log("There is a new sale");
});

myEmitter.on("newSale", () => {
  console.log("Costumer name: Jane");
});

myEmitter.on("newSale", (stock) => {
  console.log("There are now ${stock} items left");
});

myEmitter.emit("newSale", 9);

// --------------listen to events app---------------
// only need to "listen" to event if built in events
const server = http.createServer();

server.on("request", (req, res) => {
  console.log("Request received");
  res.end("Request received");
});

server.on("request", (req, res) => {
  res.end("Another request received");
});

server.on("close", (req, res) => {
  console.log("Server closed");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Waiting for requests...");
});

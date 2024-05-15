const fs = require("fs");
const server = require("http").createServer();

server.on("request", (req, res) => {
  // method 1 - load entire file to memory
  fs.readFile("test-file.txt", (err, data) => {
    if (err) console.log(err);
    res.end(data);
  });

  // method 2 - streams wtih readability, read and send piece by piece -> has backpressure!
  const readable = fs.createReadStream("test-file.txt");
  readable.on("data", (chunk) => {
    res.write(chunk);
  });
  readable.on("end", () => {
    res.end();
  });
  // can also read an error message~
  readable.on("error", (err) => {
    console.log(err);
    res.statusCode(500);
    res.end("File not found");
  });

  // method 3 - solve backpressure
  const readable2 = fs.createReadStream("test-file.txt");
  // struc: readableSource.pipe(writeableDestination)
  readable2.pipe(res);
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening...");
});

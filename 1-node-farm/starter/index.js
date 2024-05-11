const fs = require("fs"); // require file system module
const http = require("http"); // for server
const url = require("url"); // routing

// -------------------------
//FILES
// synchroizing file reading, blocking way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);
// // write to files
// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written!");

//asynchroizing file reading, non-blocking way
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   if (err) return console.log("ERROR");
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.writeFile("./txt/final.txt", `${data2}`, "utf-8", (err) => {
//       console.log("Your file has been written");
//     });
//   });
// });
// console.log("Reading file...");

// -------------------------
//SERVER
const server = http.createServer((req, res) => {
  const pathName = req.url;

  if (pathName === "/" || pathName === "/overview") {
    res.end("This is the OVERVIEW");
  } else if (pathName === "/product") {
    res.end("This is the PRODUCT");
  } else {
    res.writeHead(404, {
      "Contetn-type": "text/html",
    });
    res.end("<h1>Page not found</h1>");
  }
}); // create server using the callback function

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to request on port 8000");
}); // start up the server, in browser: 127.0.0.1:8000

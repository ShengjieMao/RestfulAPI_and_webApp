// File for understanding event loop processing sequence
const fs = require("fs");
const crypto = require("crypto");

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 1;

setTimeout(() => console.log("Timer 1 finished"), 0);
setImmediate(() => console.log("Immediate 1 finished"));

fs.readFile("test-file.txt", () => {
  console.log("I/O finished");
  console.log("--------------------");

  setTimeout(() => console.log("Timer 2 finished"), 0);
  setTimeout(() => console.log("Timer 3 finished"), 3000);
  setImmediate(() => console.log("Immediate 2 finished")); // executed before the timer 3

  // executed even before the immediate 2, immediately happens before next loop phase
  process.nextTick(() => console.log("Process.nextTick"));

  // if encrypt > UV_THREADPOOL_SIZE, will take longer time for the parts more than size to encrypt
  crypto.pbkdf2("password", "salk", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
  // if use Sync, even if the number < UV_THREADPOOL_SIZE, still will take longer and longer time to encrypt
  crypto.pbkdf2Sync("password", "salk", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
  });
});

console.log("hello from the top-level code");

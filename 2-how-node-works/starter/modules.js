console.log(arguments);

// module.exports
const C = require("./test-module-1");
const calc1 = new C();
console.log(calc1.add(2, 5));

// exports
//const calc2 = require("./test-module-2");
const { add, multiply } = require("./test-module-2");
console.log(add(2, 5));

// caching
require("./test-module-3")();
require("./test-module-3")(); // the 2nd and 3rd times, the console.log will not be rendered
require("./test-module-3")();

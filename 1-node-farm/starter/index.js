// Core
const fs = require('fs'); // require file system module
const http = require('http'); // for server
const url = require('url'); // routing

// 3rd parties
const slugify = require('slugify'); // having url more readable

// User created
const replaceTemplate = require('./modules/replaceTemplate');

// -------------------------
//--FILES
//-- synchroizing file reading, blocking way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);
//--  write to files
// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written!");

//--asynchroizing file reading, non-blocking way
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   if (err) return console.log("ERROR");
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//--     console.log(data2);
//     fs.writeFile("./txt/final.txt", `${data2}`, "utf-8", (err) => {
//       console.log("Your file has been written");
//     });
//   });
// });
// console.log("Reading file...");

// -------------------------
//SERVER
// can use sync version since the json and template only need to load once
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');
    //console.log(cardsHtml);
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);
  }

  // Product page
  else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  }

  // API
  else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    //console.log(productData);
    res.end(data);
  }

  // Not found
  else {
    res.writeHead(404, {
      'Contetn-type': 'text/html',
    });
    res.end('<h1>Page not found</h1>');
  }
}); // create server using the callback function

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to request on port 8000');
}); // start up the server, in browser: 127.0.0.1:8000

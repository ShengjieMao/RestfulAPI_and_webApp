const fs = require('fs');
const superagent = require('superagent');

const readFilePro = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('Cannot find the file');
      resolve(data); // the value returned by the promise
    });
  });
};

const writeFilePro = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject('Cannot write to the file');
      resolve('Success');
    });
  });
};

fs.readFile(`${__dirname}/dog.txt`, (err, data) => {
  console.log(`Breed: ${data}`);

  // http request uisng the callback function
  // this might result in the "callback hell" --> resolve using promises
  superagent.get(`https://dog.ceo/api/breed/${data}/images/random`).end((err, res) => {
    // error handling
    if (err) return console.log(err.message);
    console.log(res.body.message);

    fs.writeFile('dog-img.txt', res.body.message, (err) => {
      // error handling
      if (err) return console.log(err.message);
      console.log('Random dog image save to the file');
    });
  });

  // -------improvement---------
  // http request using promises - the "then" keyword
  superagent
    .get(`https://dog.ceo/api/breed/${data}/images/random`)
    .then((res) => {
      console.log(res.body.message);

      fs.writeFile('dog-img.txt', res.body.message, (err) => {
        if (err) return console.log(err.message);
        console.log('Random dog image save to the file');
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// Using promises to escape the "callback hell"
//By chaining the handlers with return for each 'then' promise
readFilePro(`${__dirname}/dog.txt`)
  .then((data) => {
    console.log(`Breed: ${data}`);
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
  })
  .then((res) => {
    console.log(res.body.message);
    return writeFilePro('dog-img.txt', res.body.message);
  })
  .then(() => {
    console.log('Random dog image saved to the file');
  })
  .catch((err) => {
    console.log(err);
  });

// -------async/await---------
// Using async function returns a promise, and try/catch block for error handling
const getDogPic = async () => {
  try {
    // await - stop running the code until the readFilePro promise is resolved
    const data = await readFilePro(`${__dirname}/dog.txt`);
    console.log(`Breed: ${data}`);

    // get data from API
    const res = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);

    // --------------------------
    // if wants to await several promises simultaneously
    const res1Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    const res2Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    const res3Pro = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    const all = await Promise.all([res1Pro, res2Pro, res3Pro]);
    const imgs = all.map((el) => el.body.message);
    console.log(imgs);
    // --------------------------

    console.log(res.body.message);

    // write to the file
    await writeFilePro('dog-img.txt', imgs.join('\n'));
    console.log('Random dog image saved to the file');
  } catch (err) {
    console.log(err);
    throw err; // to pass the error to the next catch block
  }
  return '2: Ready'; // if want output the value in the console...(*)
};
getDogPic(); // calling the async function (*)

// "then" and "catch" block to handle the returns -- needs improvement
console.log('1: Will get dog pics!'); // this will be printed first
// rewrite (*) as below:
getDogPic()
  .then((x) => {
    console.log(x);
    console.log('3: Done getting dog pics!'); // this will be printed last
  })
  .catch((err) => {
    console.log('ERROR! 🤯');
  });

// improvement: using IIFE
(async () => {
  try {
    console.log('1: Will get dog pics!');
    const x = await getDogPic();
    console.log(x);
    console.log('3: Done getting dog pics!');
  } catch (err) {
    console.log('ERROR! 🤯');
  }
})(); // <-- define this function then call it immediately

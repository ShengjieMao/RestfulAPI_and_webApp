// Use a higher level function call to handle the try catch block
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // next is the error handling middleware
  };
};

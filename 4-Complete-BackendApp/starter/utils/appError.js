class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // call the Error constructor

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // for operational errors

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

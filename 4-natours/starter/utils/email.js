const nodemailer = require('nodemailer');

// Automatically send emails
const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    // If normal gmail, only up to ~500 emails per day
    // Need to set to 'less secure app' in gmail
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Shengjie <hello@test.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: '<h1>Hello world</h1>',
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // 1) Create a transporter

  //   const transporter = nodemailer.createTransport({
  //     host: process.env.EMAIL_HOST,
  //     port: process.env.EMAIL_PORT,
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //   });
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'osvaldo.denesik@ethereal.email',
      pass: 'yXtNwRYpxnxXdAG1aM',
    },
  });

  //  2) Define the email options
  const mailOptions = {
    from: 'deepak <deepak@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email
  const res = await transporter.sendMail(mailOptions);
  console.log('yes');
};

module.exports = sendMail;

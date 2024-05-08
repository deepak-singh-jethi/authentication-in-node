const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // 1) Create a transporter

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'nikolas.thiel@ethereal.email',
      pass: 'Y3XszTFhRs78MqpDMp',
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

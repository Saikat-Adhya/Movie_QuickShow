import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, body) => {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html: body,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully', mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendEmail;

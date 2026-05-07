const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.mailtrap.io",
  port: Number(process.env.MAIL_PORT) || 2525,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

const sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    from: '"BildyApp" <no-reply@bildyapp.com>',
    to: email,
    subject: "Verifica tu email",
    html: `<p>Tu codigo de verificacion es: <strong>${code}</strong></p>`
  });
};

module.exports = { sendVerificationEmail };

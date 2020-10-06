const nodeMailer = require("nodemailer");

const defaultEmailData = { from: "noreply@node-react.com" };

exports.sendEmail = (emailData) => {
   const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
         user: "your email",
         pass: "your password",
      },
   });
   return transporter
      .sendMail(emailData)
      .then((info) => console.log(`Message send: ${info.response}`))
      .catch((err) => console.log(`Problem sending mail: ${err}`));
};

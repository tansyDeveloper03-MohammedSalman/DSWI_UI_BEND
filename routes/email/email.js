const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
function Email(data) {
  // console.log(data);
  // const output =
  //   data.email + `<a href="http://localhost:3000/resetPassword"></a>`;
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.mailtrap.io",
  //   port: 2525,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: "168a2efbd226bb", // generated ethereal user
  //     pass: "5f7cc53882d415" // generated ethereal password
  //   }
  // });

  // // setup email data with unicode symbols
  // let mailOptions = {
  //   from: '"Node Mailer Contact 👻" <aruninfo333@gmail.com>', // sender address
  //   to: data.email, // list of receivers
  //   subject: "Node Contact Request", // Subject line
  //   text: "Hello world?", // plain text body
  //   html: output // html body
  // };

  // // send mail with defined transport object
  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     return console.log(error);
  //   } else {
  //     console.log("Email sent: " + info.response);
  //   }
  //   console.log("Message sent: %s", info.messageId);
  //   // Preview only available when sending through an Ethereal account
  //   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  //   res.send(output);
  // });
  SENDGRID_API_KEY =
    "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";
  sgMail.setApiKey(SENDGRID_API_KEY);
  resetPasswordLink =
    "http://localhost:3000/user/" +
    encodeURIComponent(data._id) +
    "/resetPassword/";
  const msg = {
    to: data.email,
    from: "dasari.arun@tansycloud.com",
    subject: "Sending with SendGrid is Fun",
    text:
      "Hello " +
      data.first_name +
      " " +
      data.last_name +
      "; please click on this link to reset your password: " +
      resetPasswordLink
    // html: "<strong>and easy to do anywhere, even with Node.js</strong>"
  };
  sgMail.send(msg);
  return data;
}

exports.Email = Email;

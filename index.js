const User = require("./routes/user");
const mongoose = require("mongoose");
const express = require("express");
const config = require("config");
const app = express();
const profile = require("./routes/profile");
const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

config["jwtPrivateKey"] = "mySecureKey";

if (!config.get("jwtPrivateKey")) {
  // dswa_jwtPrivateKey = "mySecureKey";
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
} else {
}

app.use(express.json());

mongoose
  .connect(
    "mongodb://usr_admin_read_write_devDSWA.clsdevdswa-shard-00-02-xn0wu.mongodb.net:27017,clsdevdswa-shard-00-01-xn0wu.mongodb.net:27017,clsdevdswa-shard-00-00-xn0wu.mongodb.net:27017/dbDevDSWA?ssl=true&replicaSet=clsDevDSWA-shard-0&authSource=admin&retryWrites=true",
    {
      auth: {
        user: "usr_admin_read_write_devDSWA",
        password: "shankerTansy01#"
      }
    }
  )
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error(err));

// mongoose
//   .connect("mongodb://localhost/ArunDB")
//   .then(() => console.log("Connected to MongoDB..."))
//   .catch(err => console.error("Could not connect to MongoDB..."));
// export dswa_jwtPrivateKey=mySecureKey

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
app.post("/send", async (req, res) => {
  // const output = req.body.name;
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.mailtrap.io",
  //   port: 2525,
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: "8797f9a2b1ba7d", // generated ethereal user
  //     pass: "3f4ad32d28b0fc" // generated ethereal password
  //   }
  // });
  // console.log(transporter);
  // // setup email data with unicode symbols
  // let mailOptions = {
  //   from: '"Node Mailer Contact 👻" <aruninfo333@gmail.com>', // sender address
  //   to: "dasari.arun@tansycloud.com", // list of receivers
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
  //   res.send(output);
  // });

  SENDGRID_API_KEY =
    "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";
  sgMail.setApiKey(SENDGRID_API_KEY);
  const msg = {
    to: "aruninfo333@gmail.com",
    from: "dasari.arun@tansycloud.com",
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>"
  };
  console.log(sgMail);
  sgMail.send(msg);
});

app.use("/api/dswa", User);
// app.use("/feeds", feed);
app.use("/api/profile", profile);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

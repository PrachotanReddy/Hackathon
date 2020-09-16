const fs = require("fs");
const Logger = (exports.Logger = {});

const registerStream = fs.createWriteStream("logs/register.txt", {
  flags: "a",
  encoding: null,
  mode: 0666,
});
const signinStream = fs.createWriteStream("logs/signin.txt", {
  flags: "a",
  encoding: null,
  mode: 0666,
});
const emailStream = fs.createWriteStream("logs/email.txt", {
  flags: "a",
  encoding: null,
  mode: 0666,
});
const emailResendStream = fs.createWriteStream("logs/emailResend.txt", {
  flags: "a",
  encoding: null,
  mode: 0666,
});

const deleteStream = fs.createWriteStream("logs/deletelogs.txt", {
  flags: "a",
  encoding: null,
  mode: 0666,
});

function getDateData() {
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date + " " + time;
  return dateTime;
}
Logger.register = function (msg) {
  let datelog = getDateData();
  var message = datelog + " : " + msg + "\n";
  registerStream.write(message);
};

Logger.signin = function (msg) {
  let datelog = getDateData();
  var message = datelog + " : " + msg + "\n";
  signinStream.write(message);
};

Logger.emailregister = function (msg) {
  let datelog = getDateData();
  var message = datelog + " : " + msg + "\n";
  emailStream.write(message);
};

Logger.emailresend = function (msg) {
  let datelog = getDateData();
  var message = datelog + " : " + msg + "\n";
  emailResendStream.write(message);
};

Logger.deleteStream = function (msg) {
  let datelog = getDateData();
  var message = datelog + " : " + msg + "\n";
  emailResendStream.write(message);
};

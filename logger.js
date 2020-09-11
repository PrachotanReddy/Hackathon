var fs = require('fs')
var Logger = (exports.Logger = {})

var registerStream = fs.createWriteStream('logs/register.txt', {
  flags: 'a',
  encoding: null,
  mode: 0666,
})
var signinStream = fs.createWriteStream('logs/signin.txt', {
  flags: 'a',
  encoding: null,
  mode: 0666,
})

function getDateData() {
  var today = new Date()
  var date =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
  var time =
    today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
  let dateTime = date + ' ' + time
  return dateTime
}
Logger.register = function (msg) {
  let datelog = getDateData()
  var message = datelog + ' : ' + msg + '\n'
  registerStream.write(message)
}

Logger.signin = function (msg) {
  let datelog = getDateData()
  var message = datelog + ' : ' + msg + '\n'
  signinStream.write(message)
}

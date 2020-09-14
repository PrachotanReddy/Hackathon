const { query } = require('express')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const router = express.Router()
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'yandex',
  auth: {
    user: 'userverification@winnovations.in',
    pass: 'ktipajbkaidvyjmu',
  },
})

function generatePassword() {
  var length = 30,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    retVal = ''
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n))
  }
  return retVal
}

//delete the reset link if it has been active for more than an hour. Runs every 5 minutes
async function removeExpired() {
  await collectionReset.find().forEach((item) => {
    let timerecieved = item.reviewTime.split(':')
    let timeVariable = new Date()
    let difference = timeVariable.getHours() - timerecieved[0];
    if(difference >= 1 || difference <= -1) {
      collectionReset.deleteOne({email: item.email}, (err, doc) => {
        if (err) throw err;
      })
    }
  })
}

router.get('/forgot', async (req, res) => {
  res.render('forgot')
})

router.post('/reset', async (req, res) => {
  let code = generatePassword()
  let pin = Math.floor(100000000 + Math.random() * 900000000)
  var mailOptions = {
    from: 'userverification@winnovations.in',
    to: req.body.checkforget,
    subject: 'Reset password wInnovations',
    html: `<h1>Reset password</h1>
            <p>We got a password recovery request for ${req.body.checkforget}. If this was not initiated by you, you can safely ignore this mail. If you did initiate the recovery, <a href="${req.hostname}/3000/passwordreset/resettinglink?key=${pin}&secret=${code}&user=${req.body.checkforget}">here</a> is the link.</p><br />
            <p style="font-weight: bold">This link is valid for one hour.</p>`,
  }
  await collectionLogin.findOne(
    { email: req.body.checkforget },
    async (err, doc) => {
      if (err) {
        res.render('mailsentornot', {
          msgCode: 0,
        })
      } else if (!doc) {
        res.render('mailsentornot', {
          msgCode: 1,
        })
      } else {
        if (doc.oAuthMethod === 'local') {
          await collectionReset.findOne(
            { email: req.body.checkforget },
            async (error, item) => {
              if (error) {
                res.render('mailsentornot', {
                  msgCode: 0,
                })
              } else if (item) {
                res.render('mailsentornot', {
                  msgCode: 2,
                })
              } else {
                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    res.render('mailsentornot', {
                      msgCode: 1,
                    })
                  } else {
                    console.log('Email sent: ' + info.response)
                    // adding the details to the database
                    let timeVariable = new Date()
                    let dateFormatforTimestamp =
                      timeVariable.getHours() + ':' + timeVariable.getMinutes()
                    collectionReset.insertOne({
                      email: req.body.checkforget,
                      resetcode: pin,
                      secret: code,
                      timestamp: Date.now(),
                      reviewTime: dateFormatforTimestamp,
                    })
                    res.render('mailsentornot', {
                      msgCode: 1,
                    })
                  }
                })
              }
            }
          )
        } else {
          res.render('mailsentornot', {
            msgCode: 3,
          })
        }
      }
    }
  )
})

router.get('/resettinglink', async (req, res) => {
  let credentialKey = req.query.key
  let credentialSecret = req.query.secret
  let credentialUser = req.query.user
  await collectionReset.findOne({ email: credentialUser }, (err, item) => {
    if (
      credentialKey == item.resetcode &&
      credentialSecret == item.secret &&
      credentialUser == item.email
    ) {
      res.render('resetcredential', {
        secret: credentialSecret,
        key: credentialKey,
        user: credentialUser,
      })
    } else {
      res.send('Invalid link')
    }
  })
})

router.post('/reset/newcredentials', async (req, res) => {
  if (req.body.newpassword === req.body.confirmpassword) {
    await collectionReset.findOne({ email: req.body.user }, (err, item) => {
      if (err) {
        res.render('error')
      } else if (!item) {
        res.send('<h1>404</h1><p>Bad request</p>')
      } else if (item) {
        let hashedPassword = bcrypt.hashSync(req.body.newpassword, 10)
        collectionLogin.updateOne(
          { email: req.body.user },
          { $set: { password: hashedPassword } },
          (err, value) => {
            if (err) {
              res.render(error)
            } else {
              res.render('successreset')
            }
          }
        )
      }
      collectionReset.deleteOne({email: req.body.user}, (err, doc) => {
        if(err) throw err;
      })
    })
  }
})

setInterval(removeExpired, 300000)

module.exports = router

const express = require('express')
const app = express()
const router = express.Router()


router.post('/verify', (req, res) => {
      console.log(req.session.passport.user)
      collectionOTP.findOne({email: req.session.passport.user}, (err, doc) => {
            if(doc) {
                  if(req.body.sixpin == doc.code) {
                        console.log('verified')
                        collectionOTP.deleteOne({email: req.session.passport.user}, (err, obj) => {
                              collectionLogin.updateOne({ email: req.session.passport.user }, { $set: { verified: true } }, (err, updateDoc) => {
                                    console.log('Done Verification')
                                    res.redirect('/dashboard')
                              })
                        })
                  }
                  else {
                        console.log('wrong email was entered')
                        res.render('verifyotp', {
                              error: true
                        })
                  }
            }
            else {
                  console.log('There was an error')
                  res.render('error')
            }
      })
})


module.exports = router;
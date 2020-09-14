const express = require('express')
ObjectId = require('mongodb').ObjectID;
const app = express()
const router = express.Router()

router.post('/set', async(req, res) => {
      console.log(req.body)
      collectionProblem.insertOne({heading: req.body.title, description: req.body.description})
      res.redirect('/admindashboard')
})

router.delete('/delete', async(req, res) => {
      await collectionProblem.deleteOne({_id: ObjectId(req.query.id)}, (err, obj) => {
            if(err) {
                  res.status(400).json({msg: 'There was an error'})
            }
            else if(obj) {
                  res.status(200).json({msg: 'Deleted'})
            }
            else {
                  res.status(504).json({msg: 'Bad request'})
            }
      })
})

module.exports = router
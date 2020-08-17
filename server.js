if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const MongoClient = require("mongodb").MongoClient;
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const CONNECTION_URL = process.env.DATABASE_URL;
let port = process.env.PORT || 4000;
const initializePassport = require('./auth-routes/passport-config');
const {
  query
} = require('express');
const {
  ObjectID
} = require('mongodb');
initializePassport(
  passport,
  email => collectionLogin.findOne({
    'email': email
  }).then(function (docs) {
    return docs
  }),
  id => collectionLogin.findOne({
    '_id': id
  }).then(function (docs) {
    return docs
  })
)

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    console.log('Not logged in')
    res.render('admin');
  } else {
    console.log('Logged in')
    next();
  }
}

app.set('view engine', 'ejs')
app.use(express.urlencoded({
  extended: false
}))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.static(__dirname + "/public"));


app.get('/', (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
})

app.get('/dashboard', checkAuthenticated, async (req, res) => {
  let announcement;
  let eventDetails = await collectionEvent.findOne({
    'search': "queryRound"
  }).then(function (docs) {
    return docs
  })
  collectionLogin.findOne({
    "email": `${req.session.passport.user}`
  }, function (err, doc) {
    if (eventDetails.round == 1) {
      res.render('index', {
        name: doc.teamName,
        email: doc.email,
        participation: doc.participationMode,
        problemStatement: doc.problemStatement,
        scoring: doc.score,
        submission: doc.submission,
        teamMembers: doc.teamMembers
      })
    } else if (eventDetails.round == 2) {
      res.render('index1')
    } else if (eventDetails.round == 3) {
      res.render('index2')
    }
  })
})

app.post("/submissionRound_one", checkAuthenticated, (req, res) => {
  collectionLogin.findOne({
    "email": `${req.session.passport.user}`
  }, function (err, doc) {
    if (doc.submission == "") {
      let query = {
        email: req.session.passport.user
      }
      let newValues = {
        $set: {
          problemStatement: req.body.problemSelect,
          submission: req.body.solutionLink
        }
      }
      collectionLogin.updateOne(query, newValues, (err, res) => {
        if (err) throw err;
      })
    }
    res.redirect("/dashboard")
  })
})
app.post("/updateTeamMembers", checkAuthenticated, (req, res) => {
  let teamMateNames = []
  for (let i = 1; i <= 4; i++) {
    teamMateNames.push(eval(`req.body.teammate${i}`))
  }
  collectionLogin.findOne({
    "email": `${req.session.passport.user}`
  }, function (err, doc) {
    if (doc.participationMode === "team" && doc.teamMembers.member1 == null) {
      let query = {
        email: req.session.passport.user
      }
      let newValues = {
        $set: {
          teamMembers: teamMateNames
        }
      }
      collectionLogin.updateOne(query, newValues, (err, res) => {
        if (err) throw err;
      })
    }
    res.redirect("/dashboard")
  })
})

app.get("/getNews", checkAuthenticated, async (req, res) => {
  collectionAnnouncement.find().toArray(async (err, announcements) => {
    let car = ["bugatti", "lotus", "chevorlet"]
    res.send(announcements)
  })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login')
})

app.get('/admindashboard', checkAuth, (req, res) => {
  res.render('admindashboard')
})

app.get('/adminLoginPage', checkAuth, (req, res) => {
  res.render('admin')
})

app.post('/adminLoginPage', (req, res) => {
  var post = req.body;
  if (post.email === 'john@keat' && post.password === 'johnspassword') {
    req.session.user_id = '5ras223avbbas77fabskjbfa9';
    res.redirect('/admindashboard');
  } else {
    res.redirect('/adminLoginPage');
  }
});

app.delete('/logoutadmin', checkAuth, function (req, res) {
  delete req.session.user_id;
  res.redirect('/adminLoginPage');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    collectionLogin.findOne({
        $or: [{
          'email': req.body.email
        }, {
          'teamName': req.body.name
        }]
      })
      .then(function (doc) {
        if (!doc) {
          let hashedPassword = bcrypt.hashSync(req.body.password, 10)
          collectionLogin.insertOne({
            email: req.body.email,
            password: hashedPassword,
            teamName: req.body.name,
            participationMode: req.body.participation,
            teamMembers: [
              {0: ""},
              {1: ""},
              {2: ""},
              {3: ""}
            ],
            problemStatement: '',
            score: 0,
            submission: ''
          });
          res.redirect('/login')
        } else {
          res.render('alreadyExists')
        }
      })
  } catch (e) {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard')
  }
  next()
}

app.listen(port, () => {
  console.log("server listening on port 3000");
  MongoClient.connect(
    CONNECTION_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    async (error, client) => {
      if (error) {
        throw error;
      }
      database = client.db("hackathon");
      collectionLogin = await database.collection("user_details");
      collectionEvent = await database.collection("event_details");
      collectionAnnouncement = await database.collection("announcements");
      console.log("Connected to mongoDB Atlas");
    }
  );
})
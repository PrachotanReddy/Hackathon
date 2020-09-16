if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const CONNECTION_URL = process.env.DATABASE_URL;
let port = process.env.PORT || 3000;
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.yandex.com",
  port: 465,
  auth: {
    user: "userverification@winnovations.in",
    pass: "ktipajbkaidvyjmu",
  },
  secure: true,
  dkim: {
    domainName: "winnovations.in",
    keySelector: "mail  ",
    privateKey:
      "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDMNUYwoLIaAPe0m27WXmIuLxVWCGY1EySGNzPQcXy41pP57RL9zNF6drqM+iKgw9l+5l6qNxVYoRSnD+VkQLwUZZN5/tmw75pX/kV92qiXtaTbk47OvAY1izXHTaxcbffZZ+SX7NZJMqhdCyH4P4bzrJht5Y9/zf1CjASWKDL8hwIDAQAB",
  },
});

//importing logging route
const logger = require("./routes/logger").Logger;

//configuration for passport local
const initializePassport = require("./auth-routes/passport-config");
const { ObjectId } = require("mongodb");
const { render } = require("ejs");
initializePassport(
  passport,
  (email) =>
    collectionLogin.findOne({ email: email }).then(function (docs) {
      return docs;
    }),
  (id) =>
    collectionLogin.findOne({ _id: id }).then(function (docs) {
      return docs;
    })
);

// configuration for passport google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      collectionLogin
        .findOne({ email: profile.email })
        .then(async function (user) {
          if (user) {
            logger.signin(`${profile.email} signed in`);
            done(null, user);
          } else {
            await collectionLogin.insertOne({
              email: profile.email,
              password: "DoesNotApply",
              teamName: "remaining-submission-oauth",
              participationMode: "remaining-submission-oauth",
              phone: "remaining-submission-oauth",
              teamMembers: [],
              problemStatement: "",
              score: 0,
              submission: "",
              oAuthMethod: "google",
              verified: true,
            });
            await collectionLogin
              .findOne({ email: profile.email })
              .then(function (user) {
                logger.register(
                  `${profile.email} resistered in the database as a Google signin`
                );
                logger.signin(`${profile.email} signed in`);
                if (user) {
                  done(null, user);
                }
              });
          }
        });
    }
  )
);

// configuration for passport github
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      await collectionLogin
        .findOne({ email: profile.emails[0].value })
        .then(async function (user) {
          if (user) {
            logger.signin(`${profile.emails[0].value} signed in`);
            done(null, user);
          } else {
            await collectionLogin.insertOne({
              email: profile.emails[0].value,
              password: "DoesNotApply",
              teamName: "remaining-submission-oauth",
              participationMode: "remaining-submission-oauth",
              teamMembers: [],
              problemStatement: "",
              phone: "remaining-submission-oauth",
              score: 0,
              submission: "",
              oAuthMethod: "github",
              verified: true,
            });
            await collectionLogin
              .findOne({ email: profile.emails[0].value })
              .then(function (user) {
                logger.register(
                  `${profile.emails[0].value} resistered in the database as a Github signin`
                );
                logger.signin(`${profile.emails[0].value} signed in`);
                if (user) {
                  done(null, user);
                }
              });
          }
        });
    }
  )
);

// configuration for linkedin
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_KEY,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL: "http://localhost:3000/auth/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"],
      state: true,
    },
    (accessToken, refreshToken, profile, done) => {
      // asynchronous verification, for effect...
      process.nextTick(async () => {
        await collectionLogin
          .findOne({ email: profile.emails[0].value })
          .then(async (user) => {
            if (user) {
              logger.signin(`${profile.emails[0].value} signed in`);
              done(null, user);
            } else {
              await collectionLogin.insertOne({
                email: profile.emails[0].value,
                password: "DoesNotApply",
                teamName: "remaining-submission-oauth",
                participationMode: "remaining-submission-oauth",
                phone: "remaining-submission-oauth",
                teamMembers: [],
                problemStatement: "",
                score: 0,
                submission: "",
                oAuthMethod: "linkedin",
                verified: true,
              });
              await collectionLogin
                .findOne({ email: profile.emails[0].value })
                .then(function (user) {
                  logger.register(
                    `${profile.emails[0].value} resistered in the database as a Linkedin signin`
                  );
                  logger.signin(`${profile.emails[0].value} signed in`);
                  if (user) {
                    done(null, user);
                  }
                });
            }
            return done(null, profile);
          });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
  done(null, user);
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/getstarted");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
}

// for admin login
function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.redirect("/adminLoginPage");
  } else {
    next();
  }
}

function checkNotAuth(req, res, next) {
  if (req.session.key === process.env.ADMIN_SESSION) {
    return res.redirect("/admindashboard");
  }
  next();
}

app.set("view engine", "ejs");
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));

function checkverification(req, res, next) {
  console.log(req.session.passport.user);
  collectionLogin.findOne(
    { email: req.session.passport.user },
    async (err, obj) => {
      if (obj.verified) {
        console.log("Verification complete");
        next();
      } else {
        console.log("Verification incomplete");
        res.render("verifyotp", {
          error: false,
          msg: "",
        });
      }
    }
  );
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/deletemyaccount", checkAuthenticated, (req, res) => {
  res.render("deleteaccount");
});

app.get("/finallydelete", checkAuthenticated, (req, res) => {
  let query = {
    email: req.session.passport.user,
  };
  logger.deleteStream(`${req.session.passport.user} deleted thier profile`);
  collectionLogin.deleteOne(query, function (err, obj) {
    if (err) {
      res.send("error");
    }
    req.session.destroy();
    res.send("Your account has been deleted");
  });
});
//create a route to send OTP mails and update the database for the same

app.use("/verifiyotp", checkAuthenticated, require("./routes/verification"));

app.get(
  "/dashboard",
  [checkAuthenticated, checkverification],
  async (req, res) => {
    collectionLogin
      .findOne({ email: req.session.passport.user })
      .then(async function (user) {
        if (user.teamName == "remaining-submission-oauth") {
          res.render("registerteam");
        } else {
          let announcement;
          let eventDetails = await collectionEvent
            .findOne({
              search: "queryRound",
            })
            .then(function (docs) {
              return docs;
            });
          collectionLogin.findOne(
            {
              email: `${req.session.passport.user}`,
            },
            function (err, doc) {
              collectionProblem.find().toArray((error, item) => {
                if (eventDetails.round == 1) {
                  res.render("index", {
                    name: doc.teamName,
                    email: doc.email,
                    participation: doc.participationMode,
                    problemStatement: doc.problemStatement,
                    scoring: doc.score,
                    submission: doc.submission,
                    teamMembers: doc.teamMembers,
                    statements: item,
                  });
                } else if (eventDetails.round == 2) {
                  res.render("index1");
                } else if (eventDetails.round == 3) {
                  res.render("index2");
                }
              });
            }
          );
        }
      });
  }
);

app.post("/submissionRound_one", checkAuthenticated, (req, res) => {
  collectionLogin.findOne(
    {
      email: `${req.session.passport.user}`,
    },
    function (err, doc) {
      if (doc.submission == "") {
        let query = {
          email: req.session.passport.user,
        };
        let newValues = {
          $set: {
            problemStatement: req.body.problemSelect,
            submission: req.body.solutionLink,
          },
        };
        collectionLogin.updateOne(query, newValues, (err, res) => {
          if (err) throw err;
        });
      }
      res.redirect("/dashboard");
    }
  );
});

app.use("/passwordreset", require("./routes/forgot"));

app.use("/problemstatement", checkAuth, require("./routes/problem"));

app.get("/problems", async (req, res) => {
  await collectionProblem.find().toArray(async (err, doc) => {
    if (err) throw err;
    res.send(doc);
  });
});

app.get("/newsletter/:email", (req, res) => {
  collectionNewsletter.findOne({ email: req.params.email }, (err, doc) => {
    if (doc) {
      res.json({ msg: "already_subscribed" });
    } else {
      collectionNewsletter.insertOne({ email: req.params.email });
      res.status(200).send("success");
    }
  });
});

app.get("/termsandcondition", (req, res) => {
  res.render("tnc");
});

app.get("/privacypolicy", (req, res) => {
  res.render("privacy");
});

app.get("/contactus", (req, res) => {
  res.render("contact");
});

app.post("/updateTeamMembers", checkAuthenticated, (req, res) => {
  let teamMateNames = [];
  for (let i = 1; i <= 4; i++) {
    teamMateNames.push(eval(`req.body.teammate${i}`));
  }
  collectionLogin.findOne(
    {
      email: `${req.session.passport.user}`,
    },
    function (err, doc) {
      if (doc.participationMode === "team" && doc.teamMembers.member1 == null) {
        let query = {
          email: req.session.passport.user,
        };
        let newValues = {
          $set: {
            teamMembers: teamMateNames,
          },
        };
        collectionLogin.updateOne(query, newValues, (err, res) => {
          if (err) throw err;
        });
      }
      res.redirect("/dashboard");
    }
  );
});

app.get("/getNews", checkAuthenticated, (req, res) => {
  collectionAnnouncement.find().toArray((err, announcements) => {
    res.send(announcements);
  });
});

app.post("/addAdminNews", checkAuth, (req, res) => {
  collectionAnnouncement.insertOne({
    announcementTitle: req.body.title,
    dateText: req.body.date,
    para: req.body.description,
  });
  res.redirect("/admindashboard");
});

app.get("/deleteParticipant", checkAuth, (req, res) => {
  let query = {
    email: req.query.user,
  };
  collectionLogin.deleteOne(query, function (err, obj) {
    if (err) {
      res.send("error");
    }
    console.log("1 document deleted");
    res.send("done");
  });
});

app.get("/giveScores", checkAuth, (req, res) => {
  collectionLogin.findOne(
    {
      email: req.query.user,
    },
    (err, doc) => {
      let newScore = Number(doc.score) + Number(req.query.scoreadd);
      let query = {
        email: req.query.user,
      };
      let newValues = {
        $set: {
          score: newScore,
        },
      };
      collectionLogin.updateOne(query, newValues, (err, res) => {
        if (err) {
          throw err;
        } else {
          console.log("Added");
        }
      });
    }
  );
});

app.get("/getAdminNews", checkAuth, async (req, res) => {
  let data = {};
  await collectionAnnouncement.find({}).toArray(async (err, announcements) => {
    data = await announcements;
    console.log("THis is data ", data);
    res.send(data);
  });
});

app.delete("/deleteAdminNews/:id", checkAuth, async (req, res) => {
  console.log(req.params);
  await collectionAnnouncement.deleteOne(
    { _id: ObjectId(req.params.id) },
    (err, db) => {
      if (err) throw err;
      console.log("Deleted the news");
      res.send("Success");
    }
  );
});

app.get("/getAdminParticipants", checkAuth, (req, res) => {
  collectionLogin.find().toArray(async (err, participants) => {
    res.send(participants);
  });
});

app.get("/getstarted", checkNotAuthenticated, (req, res) => {
  res.render("getstarted");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/getstarted",
    failureFlash: true,
  })
);

app.get("/admindashboard", checkAuth, (req, res) => {
  collectionLogin.find().toArray(async (err, participants) => {
    await collectionProblem.find().toArray((err, doc) => {
      res.render("admindashboard", {
        data: participants,
        problemstatements: doc,
      });
    });
  });
});

app.get("/adminLoginPage", checkNotAuth, (req, res) => {
  res.render("admin");
});

app.post("/adminLoginPage", (req, res) => {
  var post = req.body;
  if (
    post.email === process.env.ADMIN_ID &&
    post.password === process.env.ADMIN_PASSWORD
  ) {
    req.session.user_id = process.env.ADMIN_SESSION;
    req.session.key = process.env.ADMIN_SESSION;
    res.redirect("/admindashboard");
  } else {
    res.redirect("/adminLoginPage");
  }
});

app.delete("/logoutadmin", checkAuth, function (req, res) {
  delete req.session.user_id;
  delete req.session.key;
  res.redirect("/adminLoginPage");
});

//Login with linkedIN
app.get(
  "/auth/linkedin",
  passport.authenticate("linkedin", {
    scope: ["r_emailaddress", "r_liteprofile"],
  })
);

app.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: "/dashboard",
    failureRedirect: "/getstarted",
  })
);

//login with google
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      ,
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/dashboard",
    failureRedirect: "/getstarted",
  }),
  function (req, res) {
    console.log("Reached here");
    // Successful authentication, redirect home.
    res.redirect("/dashboard");
  }
);

//login with github
app.get("/auth/github", passport.authenticate("github"));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/getstarted",
    successRedirect: "/dashboard",
  }),
  function (req, res) {
    console.log("Reached here");
    // Successful authentication, redirect home.
    res.redirect("/dashboard");
  }
);

//registering team after first login
app.get("/registerteam", checkAuthenticated, (req, res) => {
  console.log("reached here");
  collectionLogin
    .findOne({ email: req.session.passport.user })
    .then(async (user) => {
      if ((await user.teamName) == "remaining-submission-oauth") {
        res.render("registerteam");
      } else {
        res.redirect("dashboard");
      }
    });
});

app.post("/oauthadditional", (req, res) => {
  collectionLogin
    .findOne({ email: req.session.passport.user })
    .then(function (user) {
      if (user.teamName == "remaining-submission-oauth") {
        let query = {
          email: req.session.passport.user,
        };
        let newValues = {
          $set: {
            teamName: req.body.teamname,
            participationMode: req.body.participation,
            phone: req.body.mobile,
          },
        };
        collectionLogin.updateOne(query, newValues, (err, res) => {
          if (err) throw err;
        });
        res.redirect("/dashboard");
      } else {
        res.redirect("/dashboard");
      }
    });
});

app.get("/getstarted", checkNotAuthenticated, (req, res) => {
  res.render("getstarted");
});

async function sendOTP(email) {
  let pin = Math.floor(100000 + Math.random() * 900000);
  let mailingOptions = {
    from: "userverification@winnovations.in",
    to: email,
    subject: "Account verification",
    html: `<h1>Verify your account</h1>
    <p>You signed in with the email address ${email} on our website www.winnovations.in just now. Enter the OTP to complete the process. If it was not you, you can safely ignore this mail.</p>
    <h4>${pin}</h4>
    
    <p style="font-style: italic">-team Winnovations</p>`,
  };
  transporter.sendMail(mailingOptions, function (error, info) {
    if (error) {
      throw error;
    }
    logger.emailregister(
      `Email sent to ${mailingOptions.to} after registration for the first time ${info.response}`
    );
    console.log(info);
  });
  collectionOTP.insertOne({
    email: email,
    code: pin,
    date: Date.now(),
  });
  return "done";
}

async function resendOTP(email) {
  let pin = Math.floor(100000 + Math.random() * 900000);
  let mailingOptions = {
    from: "userverification@winnovations.in",
    to: email,
    subject: "Account verification",
    html: `<h1>OTP</h1>
              <p>You asked for a new OTP, and here it is.</p>
              <h4 style:"font-weight: bold">${pin}</h4>
    `,
  };
  transporter.sendMail(mailingOptions, function (error, info) {
    if (error) {
      throw error;
    }
    logger.emailresend(
      `OTP sent to ${mailingOptions.to} again ${info.response}`
    );
    console.log(info);
  });
  collectionOTP.updateOne(
    { email: email },
    { $set: { code: pin, date: Date.now() } },
    (error, doc) => {
      return "done";
    }
  );
}

app.get("/resendOTP", checkAuthenticated, async (req, res) => {
  try {
    console.log("Resending OTP");
    let responseOTP = resendOTP(req.session.passport.user);
    res.render("verifyotp", {
      msg: `The OTP was sent to ${req.session.passport.user}`,
      error: "",
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    collectionLogin
      .findOne({
        $or: [
          {
            email: req.body.email,
          },
          {
            teamName: req.body.name,
          },
        ],
      })
      .then(function (doc) {
        if (!doc) {
          sendOTP(req.body.email);
          let hashedPassword = bcrypt.hashSync(req.body.password, 10);
          collectionLogin.insertOne({
            email: req.body.email,
            phone: req.body.mobile,
            password: hashedPassword,
            teamName: req.body.name,
            participationMode: req.body.participation,
            teamMembers: [],
            problemStatement: "",
            score: 0,
            submission: "",
            oAuthMethod: "local",
            verified: false,
          });
          res.redirect("/getstarted");
        } else {
          res.render("alreadyExists");
        }
      });
  } catch (e) {
    res.redirect("/getstarted");
  }
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/getstarted");
});

app.get("*", (req, res) => {
  res.render("error");
});

app.listen(port, () => {
  console.log("server listening on port 3000");
  MongoClient.connect(
    CONNECTION_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    async (error, client) => {
      if (error) {
        throw error;
      }
      database = client.db("hackathon");
      collectionLogin = await database.collection("user_details");
      collectionEvent = await database.collection("event_details");
      collectionAnnouncement = await database.collection("announcements");
      collectionNewsletter = await database.collection("newsletter");
      collectionReset = await database.collection("resetdatabase");
      collectionProblem = await database.collection("problem_statement");
      collectionOTP = await database.collection("otp_verification");
      console.log("Connected to mongoDB Atlas");
    }
  );
});

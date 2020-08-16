const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
let user;
async function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    user = await getUserByEmail(email)
    if (user == null) {
      return done(null, false, {
        message: "We couldn't find that email"
      })
    }
    let hashedPassword = await bcrypt.hash(user.password, 10, function (err, hash) {
      return hash
    })
    bcrypt.compare(password, user.password, (err, match) => {
      if (match) {
        return done(null, user)
      } else {
        return done(null, false, {
          message: 'Incorrect password'
        })
      }
    })
  }

  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.email))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize
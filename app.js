require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('assets'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', async function(req, res) {
  try {
    res.render('home');
  } catch (e) {
    res.send(e);
  }
});

app.get('/login', async function(req, res) {
  try {
    res.render('login');
  } catch (e) {
    res.send(e);
  }
});

app.get('/register', async function(req, res) {
  try {
    res.render('register');
  } catch (e) {
    res.send(e);
  }
});

app.get('/secrets', function(req, res) {

  if (req.isAuthenticated()) {
    res.render('secrets');
  } else {
    res.redirect('/login');
  }

});

app.get('/logout', function(req, res) {
  req.logout(function (err){
    if (err){
      return next(err);
    }
  });
  res.redirect('/');
})

app.post('/register', async function(req, res) {
  try {
    User.register({
      username: req.body.username
    }, req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        res.redirect('/register');
      } else {
        passport.authenticate('local')(req, res, function() {
          res.redirect('/secrets');
        });
      }
    });
  } catch (e) {
    console.log(e);
    res.redirect('/register');
  }
});

app.post('/login', async function(req, res) {
  try {

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function(err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate('local')(req, res, function() {
          res.redirect('/secrets');
        })
      }
    });

  } catch (e) {
    res.send(e);
  }
});

app.listen(3000, function() {
  console.log('Server started on port 3000.');
});

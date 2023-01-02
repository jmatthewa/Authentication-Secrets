require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const md5 = require('md5');

const app = express();

app.use(express.static('assets'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = new mongoose.model('User', userSchema);

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

app.post('/register', async function(req, res) {
  try {
    const newUser = new User({
      email: req.body.username,
      password: md5(req.body.password)
    });
    await newUser.save();
    console.log('Sucessfully Added new User');
    res.render('secrets');
  } catch (e) {
    res.send(e);
  }
});

app.post('/login', async function(req, res) {
  try {
    const username = req.body.username;
    const password = md5(req.body.password);

    const foundUser = await User.findOne({
      email: username
    });
    if (foundUser) {
      if (foundUser.password === password) {
        res.render('secrets');
        console.log('Sucessfully login');
      } else {
        console.log('password is incorrect!');
        res.render('login');
      }
    } else {
      console.log('No user find');
      res.render('login');
    }

  } catch (e) {
    res.send(e);
  }
});

app.listen(3000, function() {
  console.log('Server started on port 3000.');
});

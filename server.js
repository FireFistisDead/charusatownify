const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();

// connect to MongoDB (clean, no deprecated options)
mongoose.connect('mongodb://127.0.0.1:27017/charusatownify')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('DB connection error:', err));

// built-in body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

// home page
app.get('/', (req, res) => {
  res.render('home');
});

// signup form
app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// signup submit with validation
app.post('/signup', async (req, res) => {
  let { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.render('signup', { error: 'Name, Email and Password are required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('signup', { error: 'Please enter a valid email.' });
  }
  if (password.length < 4) {
    return res.render('signup', { error: 'Password must be at least 4 characters.' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.render('signup', { error: 'Email already registered. Please login.' });
    }

    const user = new User({ name, email, phone, password });
    await user.save();
    res.send('User registered successfully! <a href="/login">Login here</a>');
  } catch (err) {
    res.status(500).send('Error registering user');
  }
});

// login form
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// login submit with validation
app.post('/login', async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { error: 'Email and Password are required.' });
  }

  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.send(`Welcome ${user.name}!`);
    } else {
      const userExists = await User.findOne({ email });
      if (!userExists) {
        return res.render('login', { error: 'No account found. You have to first sign up.' });
      } else {
        return res.render('login', { error: 'Invalid password.' });
      }
    }
  } catch (err) {
    res.status(500).send('Error logging in');
  }
});

// start server
app.listen(3000, () => {
  console.log('Charusat Ownify running at http://localhost:3000');
});

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');

const app = express();

// MongoDB connect
mongoose.connect('mongodb://127.0.0.1:27017/charusat_ownify');

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
const User = mongoose.model('User', userSchema);

const lostItemSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  location: String,
  dateLost: Date,
  image: String,
  status: { type: String, default: 'active' }
});
const LostItem = mongoose.model('LostItem', lostItemSchema);

const foundItemSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  location: String,
  dateFound: Date,
  image: String,
  status: { type: String, default: 'active' }
});
const FoundItem = mongoose.model('FoundItem', foundItemSchema);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sessions
app.use(session({
  secret: 'charusatOwnifySecretKey',
  resave: false,
  saveUninitialized: false
}));

// Auth middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Routes
app.get('/', async (req, res) => {
  let loggedIn = false;
  let name = '';
  let user = null;
  if (req.session.userId) {
    user = await User.findById(req.session.userId);
    loggedIn = !!user;
    name = user ? user.name : '';
  }
  const lostItems = await LostItem.find().sort({ dateLost: -1 }).limit(5);
  const foundItems = await FoundItem.find().sort({ dateFound: -1 }).limit(5);
  if (!loggedIn) {
    return res.redirect('/login');
  }
  res.render('home', {
    lostItems,
    foundItems,
    loggedIn,
    name,
  });
});

app.get('/signup', (req, res) => {
  res.render('signup', { error: '' });
});

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.render('signup', { error: 'All fields are required' });
  }
  const exists = await User.findOne({ email });
  if (exists) {
    return res.render('signup', { error: 'Email already registered' });
  }
  const user = await User.create({ name, email, password });
  req.session.userId = user._id;
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.render('login', { error: '' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login', { error: 'Email and password required' });
  }
  const user = await User.findOne({ email, password });
  if (!user) {
    return res.render('login', { error: 'User not found. Please signup first.' });
  }
  req.session.userId = user._id;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Example of a protected page
app.get('/dashboard', requireLogin, (req, res) => {
  res.send('This is the dashboard, only for logged in users.');
});
app.get('/report-found', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('report-found', { 
    user: user,
    error: '',
    success: ''
  });
});

app.post('/report-found', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const { title, category, description, location, dateFound } = req.body;
  
  if (!title || !category || !description || !location || !dateFound) {
    return res.render('report-found', { 
      user: user,
      error: 'All fields are required',
      success: ''
    });
  }
  
  try {
    await FoundItem.create({
      title,
      category,
      description,
      location,
      dateFound: new Date(dateFound)
    });
    
    res.render('report-found', { 
      user: user,
      error: '',
      success: 'Found item reported successfully!'
    });
  } catch (error) {
    res.render('report-found', { 
      user: user,
      error: 'Error reporting item. Please try again.',
      success: ''
    });
  }
});
// Start server
app.listen(3000, () => {
  console.log('Charusat Ownify running at http://localhost:3000');
});

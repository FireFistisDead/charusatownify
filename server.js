const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');

const app = express();

// ✅ MongoDB connect (removed deprecated options)
mongoose.connect('mongodb://127.0.0.1:27017/charusat_ownify')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

const lostItemSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  location: String,
  dateLost: Date,
  image: String,
  status: { type: String, default: 'active' }, // active, accepted, rejected
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
const LostItem = mongoose.model('LostItem', lostItemSchema);

const foundItemSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  location: String,
  dateFound: Date,
  image: String,
  status: { type: String, default: 'active' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
const FoundItem = mongoose.model('FoundItem', foundItemSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  session({
    secret: 'charusatOwnifySecretKey',
    resave: false,
    saveUninitialized: false,
  })
);

// Auth middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) return res.redirect('/admin/login');
  next();
}

// Home page (only accepted items)
app.get('/', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const user = await User.findById(req.session.userId);
  const lostItems = await LostItem.find({ status: 'accepted' })
    .sort({ dateLost: -1 })
    .limit(5);
  const foundItems = await FoundItem.find({ status: 'accepted' })
    .sort({ dateFound: -1 })
    .limit(5);

  res.render('home', {
    lostItems,
    foundItems,
    loggedIn: true,
    name: user.name,
  });
});

// Signup & Login
app.get('/signup', (req, res) => res.render('signup', { error: '' }));

app.post('/signup', async (req, res) => {
  let { name, email, password } = req.body;

  // ✅ Validate name (letters and spaces only)
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return res.render('signup', { error: 'Name can contain only letters and spaces' });
  }

  // ✅ Validate password length
  if (!password || password.length < 6) {
    return res.render('signup', { error: 'Password must be at least 6 characters' });
  }

  if (!email)
    return res.render('signup', { error: 'Email is required' });

  const exists = await User.findOne({ email });
  if (exists) return res.render('signup', { error: 'Email already registered' });

  const user = await User.create({ name, email, password });
  req.session.userId = user._id;
  res.redirect('/');
});

app.get('/login', (req, res) => res.render('login', { error: '' }));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.render('login', { error: 'Email and password required' });

  const user = await User.findOne({ email, password });
  if (!user) return res.render('login', { error: 'Invalid credentials' });

  req.session.userId = user._id;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Admin login/logout
app.get('/admin/login', (req, res) => res.render('admin-login', { error: '' }));

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin-login', { error: 'Invalid admin credentials' });
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// Admin dashboard
app.get('/admin/dashboard', requireAdmin, async (req, res) => {
  const lostItems = await LostItem.find().sort({ dateLost: -1 }).populate('reportedBy');
  const foundItems = await FoundItem.find().sort({ dateFound: -1 }).populate('reportedBy');
  res.render('admin-dashboard', { lostItems, foundItems });
});

// Admin accept/reject (Lost)
app.post('/admin/lost/:id/status', requireAdmin, async (req, res) => {
  const status = req.body.status; // accepted or rejected
  await LostItem.findByIdAndUpdate(req.params.id, { status });
  res.redirect('/admin/dashboard');
});

// Admin accept/reject (Found)
app.post('/admin/found/:id/status', requireAdmin, async (req, res) => {
  const status = req.body.status;
  await FoundItem.findByIdAndUpdate(req.params.id, { status });
  res.redirect('/admin/dashboard');
});

// Report Found/Lost
app.get('/report-found', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('report-found', { user, error: '', success: '' });
});

app.post('/report-found', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const { title, category, description, location, dateFound } = req.body;
  if (!title || !category || !description || !location || !dateFound)
    return res.render('report-found', { user, error: 'All fields required', success: '' });

  await FoundItem.create({
    title,
    category,
    description,
    location,
    dateFound: new Date(dateFound),
    reportedBy: user._id,
  });
  res.render('report-found', { user, error: '', success: 'Found item reported successfully!' });
});

app.get('/report-lost', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('report-lost', { user, error: '', success: '' });
});

app.post('/report-lost', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const { title, category, description, location, dateLost } = req.body;
  if (!title || !category || !description || !location || !dateLost)
    return res.render('report-lost', { user, error: 'All fields required', success: '' });

  await LostItem.create({
    title,
    category,
    description,
    location,
    dateLost: new Date(dateLost),
    reportedBy: user._id,
  });
  res.render('report-lost', { user, error: '', success: 'Lost item reported successfully!' });
});

// View individual items
app.get('/found/:id', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const item = await FoundItem.findById(req.params.id).populate('reportedBy');
  if (!item) return res.redirect('/');
  res.render('item-details', { user, item, type: 'found' });
});

app.get('/lost/:id', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const item = await LostItem.findById(req.params.id).populate('reportedBy');
  if (!item) return res.redirect('/');
  res.render('item-details', { user, item, type: 'lost' });
});

// Start server
app.listen(3000, () =>
  console.log('Charusat Ownify running at http://localhost:3000')
);

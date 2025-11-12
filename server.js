const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const session = require('express-session');

const app = express();

//  MongoDB connect (removed deprecated options)
mongoose.connect('mongodb://127.0.0.1:27017/charusat_ownify')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  points: { type: Number, default: 0 }, // leaderboard points
});
const User = mongoose.model('User', userSchema);

const lostItemSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  location: String,
  dateLost: Date,
  image: String,
  status: { type: String, default: 'pending' }, // pending, accepted, rejected
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
  status: { type: String, default: 'pending' },
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

// Make admin flag available to all views
app.use((req, res, next) => {
  res.locals.isAdmin = !!req.session.isAdmin;
  next();
});

// File upload setup (store in memory, we'll save as base64 into DB)
const upload = multer({ storage: multer.memoryStorage() });

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
// Default route -> Login page
app.get('/', (req, res) => {
  // If already logged in, send to dashboard
  if (req.session.userId) return res.redirect('/dashboard');
  return res.redirect('/login');
});

// User Dashboard (Home)
app.get('/dashboard', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const user = await User.findById(req.session.userId);
  const lostItems = await LostItem.find({ status: 'accepted' })
    .populate('reportedBy', 'name email')
    .sort({ dateLost: -1 })
    .limit(5);
  const foundItems = await FoundItem.find({ status: 'accepted' })
    .populate('reportedBy', 'name email')
    .sort({ dateFound: -1 })
    .limit(5);

  res.render('home', {
    user,
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

  //  Validate name (letters and spaces only)
  if (!/^[A-Za-z\s]+$/.test(name)) {
    return res.render('signup', { error: 'Name can contain only letters and spaces' });
  }

  //  Validate password length
  if (!password || password.length < 6) {
    return res.render('signup', { error: 'Password must be at least 6 characters' });
  }

  if (!email)
    return res.render('signup', { error: 'Email is required' });

  const exists = await User.findOne({ email });
  if (exists) return res.render('signup', { error: 'Email already registered' });

  const user = await User.create({ name, email, password });
  req.session.userId = user._id;
  res.redirect('/dashboard');
});

app.get('/login', (req, res) => res.render('login', { error: '' }));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.render('login', { error: 'Email and password required' });

  const user = await User.findOne({ email, password });
  if (!user) return res.render('login', { error: 'Invalid credentials' });

  req.session.userId = user._id;
  res.redirect('/dashboard');
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

// Admin dashboard - only show pending items
app.get('/admin/dashboard', requireAdmin, async (req, res) => {
  // Support status filter via query (?status=pending|accepted|rejected)
  const currentStatus = ['pending', 'accepted', 'rejected'].includes(req.query.status)
    ? req.query.status
    : 'pending';

  const lostItems = await LostItem.find({ status: currentStatus })
    .populate('reportedBy', 'name email')
    .sort({ dateLost: -1 });
  const foundItems = await FoundItem.find({ status: currentStatus })
    .populate('reportedBy', 'name email')
    .sort({ dateFound: -1 });
  res.render('admin-dashboard', { lostItems, foundItems, currentStatus });
});

// Admin accept/reject (Lost)
app.post('/admin/lost/:id/status', requireAdmin, async (req, res) => {
  const status = req.body.status; // accepted or rejected
  const item = await LostItem.findById(req.params.id);
  if (!item) return res.redirect('/admin/dashboard');
  
  if (status === 'rejected') {
    // Delete the item from database if rejected
    await LostItem.findByIdAndDelete(req.params.id);
    console.log(` Lost item ${req.params.id} deleted from database`);
  } else if (status === 'accepted') {
    // Update status to accepted and award 10 points to user
    item.status = status;
    await item.save();
    
    // Award 10 points to user who reported the item
    if (item.reportedBy) {
      await User.findByIdAndUpdate(item.reportedBy, { $inc: { points: 10 } });
      console.log(`Lost item ${req.params.id} accepted. 10 points awarded to user`);
    }
  }
  
  res.redirect('/admin/dashboard');
});

// Admin accept/reject (Found)
app.post('/admin/found/:id/status', requireAdmin, async (req, res) => {
  const status = req.body.status; // 'accepted' or 'rejected'
  const item = await FoundItem.findById(req.params.id);
  if (!item) return res.redirect('/admin/dashboard');

  if (status === 'rejected') {
    // Delete the item from database if rejected
    await FoundItem.findByIdAndDelete(req.params.id);
    console.log(`Found item ${req.params.id} deleted from database`);
  } else if (status === 'accepted') {
    // Update status to accepted and award 10 points to user
    item.status = status;
    await item.save();

    // Award 10 points to user who reported the item
    if (item.reportedBy) {
      await User.findByIdAndUpdate(item.reportedBy, { $inc: { points: 10 } });
      console.log(`Found item ${req.params.id} accepted. 10 points awarded to user`);
    }
  }

  res.redirect('/admin/dashboard');
});

// Report Found/Lost
app.get('/report-found', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('report-found', { user, error: '', success: '' });
});

app.post('/report-found', requireLogin, upload.single('image'), async (req, res) => {
  const user = await User.findById(req.session.userId);
  const { title, category, description, location, dateFound } = req.body;
  if (!title || !category || !description || !location || !dateFound)
    return res.render('report-found', { user, error: 'All fields required', success: '' });

  // Validate optional image
  let imageData = '';
  if (req.file) {
    const file = req.file;
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!isImage) {
      return res.render('report-found', { user, error: 'Only image files are allowed (all image formats supported).', success: '' });
    }
    if (file.size > maxSize) {
      return res.render('report-found', { user, error: 'Image too large. Maximum size is 5 MB.', success: '' });
    }
    imageData = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  await FoundItem.create({
    title,
    category,
    description,
    location,
    dateFound: new Date(dateFound),
    image: imageData,
    reportedBy: user._id,
  });
  res.render('report-found', { user, error: '', success: 'Found item reported successfully! Awaiting admin approval.' });
});

app.get('/report-lost', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('report-lost', { user, error: '', success: '' });
});

app.post('/report-lost', requireLogin, upload.single('image'), async (req, res) => {
  const user = await User.findById(req.session.userId);
  const { title, category, description, location, dateLost } = req.body;
  if (!title || !category || !description || !location || !dateLost)
    return res.render('report-lost', { user, error: 'All fields required', success: '' });

  // Validate optional image
  let imageData = '';
  if (req.file) {
    const file = req.file;
    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!isImage) {
      return res.render('report-lost', { user, error: 'Only image files are allowed (all image formats supported).', success: '' });
    }
    if (file.size > maxSize) {
      return res.render('report-lost', { user, error: 'Image too large. Maximum size is 5 MB.', success: '' });
    }
    imageData = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  await LostItem.create({
    title,
    category,
    description,
    location,
    dateLost: new Date(dateLost),
    image: imageData,
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

// Leaderboard
app.get('/leaderboard', async (req, res) => {
  const currentUser = req.session.userId ? await User.findById(req.session.userId) : null;
  const topUsers = await User.find({}, 'name email points')
    .sort({ points: -1, name: 1 })
    .limit(10)
    .lean();

  res.render('leaderboard', {
    user: currentUser,
    topUsers,
    isAdmin: !!req.session.isAdmin,
  });
});

// Start server
app.listen(3000, () =>
  console.log('Charusat Ownify running at http://localhost:3000')
);

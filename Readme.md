# 🏫 Charusat Ownify - Lost & Found Portal

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white">
  <img alt="Express.js" src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white">
  <img alt="Bootstrap" src="https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white">
  <img alt="EJS" src="https://img.shields.io/badge/EJS-8BC34A?style=for-the-badge&logo=ejs&logoColor=white">
</p>

## 📋 Table of Contents
- [About](#about)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Admin Panel](#admin-panel)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

**Charusat Ownify** is a comprehensive lost and found portal designed specifically for educational institutions and campus environments. It provides a centralized platform where students, faculty, and staff can report lost items and help others by reporting items they've found.

The application features a user-friendly interface with role-based access control, ensuring that all reported items are moderated by administrators before being displayed publicly, maintaining the integrity and reliability of the platform.

## ✨ Features

### 🔐 User Authentication
- **Secure Registration**: User signup with email validation and password requirements
- **Login System**: Secure login with session management
- **Input Validation**: Name validation (letters and spaces only) and minimum password length
- **Session Management**: Persistent login sessions with automatic logout functionality

### 📝 Item Reporting
- **Lost Item Reports**: Users can report items they have lost with detailed information
- **Found Item Reports**: Users can report items they have found to help others
- **Detailed Forms**: Comprehensive forms including:
  - Item title and category
  - Detailed description
  - Location where item was lost/found
  - Date of incident
  - Category selection (Phone, Wallet, Keys, ID Card, Other)

### 👥 User Management
- **User Profiles**: Basic user information storage
- **Activity Tracking**: Track items reported by each user
- **Secure Sessions**: Session-based authentication with logout functionality

### 🛡️ Admin Panel
- **Administrator Dashboard**: Dedicated admin interface for content moderation
- **Item Approval System**: Admin can accept or reject reported items
- **Status Management**: Three-tier status system (active, accepted, rejected)
- **Content Moderation**: Only approved items appear on the public homepage
- **Admin Authentication**: Separate admin login system

### 🏠 Public Interface
- **Home Dashboard**: Display of recent lost and found items (approved only)
- **Item Details**: Detailed view of individual items with reporter information
- **Responsive Design**: Mobile-friendly Bootstrap-based interface
- **Search & Browse**: Easy navigation through lost and found items

### 🎨 UI/UX Features
- **Responsive Design**: Mobile-first design using Bootstrap 5
- **Consistent Branding**: Custom color scheme with Charusat university colors
- **Intuitive Navigation**: Clear navigation with role-based menu items
- **Visual Cards**: Card-based layout for easy item browsing
- **Form Validation**: Client-side and server-side validation with error messages

## 📷 Screenshots

*Add screenshots of your application here*

## 🛠️ Tech Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **Express-Session**: Session middleware for user authentication

### Frontend
- **EJS**: Embedded JavaScript templating engine
- **Bootstrap 5**: CSS framework for responsive design
- **HTML5 & CSS3**: Modern web standards
- **JavaScript**: Client-side scripting

### Development Tools
- **npm**: Package manager
- **MongoDB Compass**: Database management (recommended)
- **VS Code**: Recommended IDE

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB** (v4.0.0 or higher)

You can verify your installations with:
```bash
node --version
npm --version
mongod --version
```

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/charusatownify-main.git
cd charusatownify-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up MongoDB
Make sure MongoDB is running on your system:

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

The application will automatically connect to MongoDB at `mongodb://127.0.0.1:27017/charusat_ownify`

### 4. Start the Application
```bash
node server.js
```

The application will start running at `http://localhost:3000`

## 📖 Usage

### For Regular Users

1. **Registration**: 
   - Navigate to `/signup`
   - Fill in your name (letters and spaces only), email, and password (minimum 6 characters)
   - Click "Sign Up"

2. **Login**:
   - Navigate to `/login`
   - Enter your email and password
   - Click "Login"

3. **Report Lost Item**:
   - After logging in, click "Report Lost" in the navigation
   - Fill in all required fields (title, category, description, location, date)
   - Submit the report (will be pending admin approval)

4. **Report Found Item**:
   - After logging in, click "Report Found" in the navigation
   - Fill in all required fields
   - Submit the report (will be pending admin approval)

5. **Browse Items**:
   - View recent lost and found items on the homepage
   - Click "View Details" to see complete item information and reporter contact

### For Administrators

1. **Admin Login**:
   - Navigate to `/admin/login`
   - Username: `admin`
   - Password: `admin`

2. **Manage Items**:
   - Access admin dashboard at `/admin/dashboard`
   - Review reported lost and found items
   - Click "Accept" to approve items for public display
   - Click "Reject" to remove items from consideration

## 🛣️ API Routes

### Authentication Routes
| Method | Route | Description | Access |
|--------|-------|-------------|---------|
| GET | `/login` | Display login form | Public |
| POST | `/login` | Process login | Public |
| GET | `/signup` | Display registration form | Public |
| POST | `/signup` | Process registration | Public |
| GET | `/logout` | User logout | Authenticated |

### User Routes
| Method | Route | Description | Access |
|--------|-------|-------------|---------|
| GET | `/` | Home dashboard | Authenticated |
| GET | `/report-lost` | Display lost item form | Authenticated |
| POST | `/report-lost` | Submit lost item report | Authenticated |
| GET | `/report-found` | Display found item form | Authenticated |
| POST | `/report-found` | Submit found item report | Authenticated |
| GET | `/lost/:id` | View lost item details | Authenticated |
| GET | `/found/:id` | View found item details | Authenticated |

### Admin Routes
| Method | Route | Description | Access |
|--------|-------|-------------|---------|
| GET | `/admin/login` | Admin login form | Public |
| POST | `/admin/login` | Process admin login | Public |
| GET | `/admin/dashboard` | Admin dashboard | Admin |
| POST | `/admin/lost/:id/status` | Update lost item status | Admin |
| POST | `/admin/found/:id/status` | Update found item status | Admin |
| GET | `/admin/logout` | Admin logout | Admin |

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,        // User's full name (letters and spaces only)
  email: String,       // Unique email address
  password: String,    // Plain text password (consider hashing for production)
  phone: String,       // Optional phone number
  role: String         // Default: "user"
}
```

### Lost Items Collection
```javascript
{
  title: String,           // Item title
  category: String,        // Category (Phone, Wallet, Keys, ID Card, Other)
  description: String,     // Detailed description
  location: String,        // Location where item was lost
  dateLost: Date,         // Date item was lost
  image: String,          // Optional image URL
  status: String,         // "active" | "accepted" | "rejected"
  reportedBy: ObjectId    // Reference to User who reported
}
```

### Found Items Collection
```javascript
{
  title: String,           // Item title
  category: String,        // Category (Phone, Wallet, Keys, ID Card, Other)
  description: String,     // Detailed description
  location: String,        // Location where item was found
  dateFound: Date,        // Date item was found
  image: String,          // Optional image URL
  status: String,         // "active" | "accepted" | "rejected"
  reportedBy: ObjectId    // Reference to User who reported
}
```

## 📁 Project Structure

```
charusatownify-main/
├── 📄 server.js              # Main application file with routes and logic
├── 📄 package.json           # Dependencies and project configuration
├── 📄 README.md             # Project documentation
├── 📁 models/
│   └── 📄 User.js           # User model (alternative to inline schemas)
├── 📁 views/                # EJS templates
│   ├── 📄 home.ejs          # Homepage with recent items
│   ├── 📄 login.ejs         # User login form
│   ├── 📄 signup.ejs        # User registration form
│   ├── 📄 admin-login.ejs   # Admin login form
│   ├── 📄 admin-dashboard.ejs # Admin dashboard
│   ├── 📄 report-lost.ejs   # Lost item reporting form
│   ├── 📄 report-found.ejs  # Found item reporting form
│   ├── 📄 item-details.ejs  # Individual item details
│   └── 📁 partials/         # Reusable template components
│       ├── 📄 header.ejs    # Common header with navigation
│       └── 📄 footer.ejs    # Common footer
└── 📁 public/               # Static assets
    └── 📁 css/
        └── 📄 style.css     # Custom styles and theme
```

## 👨‍💼 Admin Panel

The admin panel provides comprehensive content moderation capabilities:

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin`

> ⚠️ **Security Note**: Change these default credentials before deploying to production!

### Admin Features
- **Dashboard Overview**: View all reported items (lost and found)
- **Status Management**: Accept or reject reported items
- **User Information**: View reporter details for each item
- **Content Moderation**: Only accepted items appear on public pages

### Admin Workflow
1. Users report lost/found items (status: "active")
2. Admin reviews items in dashboard
3. Admin accepts (status: "accepted") or rejects (status: "rejected") items
4. Only accepted items display on public homepage

## 🔒 Security Considerations

### Current Implementation
- Session-based authentication
- Input validation for user registration
- Admin authentication for content moderation
- Basic XSS protection through EJS templating

### Recommended Improvements for Production
- **Password Hashing**: Implement bcrypt for password security
- **Environment Variables**: Use `.env` file for sensitive data
- **CSRF Protection**: Add CSRF tokens to forms
- **Rate Limiting**: Implement rate limiting for login attempts
- **Input Sanitization**: Add more robust input validation
- **HTTPS**: Use HTTPS in production
- **Database Security**: Add MongoDB authentication

## 🚀 Deployment

### Environment Variables
Create a `.env` file for production:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/charusat_ownify
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=production
```

### Production Setup
1. Set up MongoDB on cloud service (MongoDB Atlas recommended)
2. Update connection string in `server.js`
3. Change default admin credentials
4. Implement HTTPS
5. Use process manager like PM2
6. Set up reverse proxy with Nginx

## 🤝 Contributing

We welcome contributions to improve Charusat Ownify! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed
- Ensure all existing tests pass

### Areas for Improvement
- Add image upload functionality for items
- Implement email notifications
- Add search and filter capabilities
- Create mobile app version
- Add real-time notifications
- Implement password hashing
- Add unit and integration tests

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/charusatownify-main/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## 🙏 Acknowledgments

- Built for Charusat University community
- Bootstrap for responsive design components
- MongoDB for robust data storage
- Express.js for web framework
- EJS for templating engine

---

<p align="center">
  Made with ❤️ for the Charusat University community
</p>

<p align="center">
  <sub>Remember to ⭐ this repository if you found it helpful!</sub>
</p>

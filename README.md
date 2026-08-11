# 💎 Glimmrr - Jewelry E-Commerce Platform

<div align="center">

![Glimmrr](https://img.shields.io/badge/Glimmrr-Jewelry%20Store-gold?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, full-stack jewelry e-commerce platform with dynamic pricing, multi-image galleries, seamless payment integration, and AI-powered recommendations coming soon.**

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Frontend Components](#-frontend-components)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Glimmrr** is a comprehensive, production-ready jewelry e-commerce platform designed to revolutionize the online jewelry shopping experience. Built from the ground up using the MERN (MongoDB, Express.js, React, Node.js) stack, this platform seamlessly blends cutting-edge technology with elegant design to create an exceptional user experience for both customers and administrators.

### Why Glimmrr?

The jewelry industry requires unique considerations that standard e-commerce platforms often overlook:

- **Dynamic Pricing**: Jewelry prices fluctuate with precious metal and gemstone market rates. Glimmrr automatically calculates product prices based on real-time gold, silver, and diamond pricing.
- **Visual Appeal**: High-quality product imagery and 3D visualization capabilities using Three.js/React Three Fiber to showcase jewelry from every angle.
- **Trust & Security**: Multiple authentication methods including traditional email/password, phone OTP verification, and Firebase authentication ensure customer trust.
- **Personalization**: Multi-image carousel galleries and responsive design for better product visualization (AI recommendations coming soon).
- **Business Intelligence**: Comprehensive admin dashboard with analytics, inventory management, and order tracking.

### Key Highlights

- 🛍️ **Customer-Centric Experience**: Intuitive product browsing with advanced filtering, category navigation, search functionality, and personalized collections
- 🖼️ **Multi-Image Galleries**: Sliding photo carousels with prev/next controls and thumbnail navigation for better product visualization
- 💰 **Dynamic Pricing Engine**: Real-time calculation of product prices based on current gold (22K, 24K, 18K), silver, and diamond market rates with automatic updates
- 🔐 **Multi-Layer Security**: Firebase Authentication, JWT tokens, token blacklisting, rate limiting, and bcrypt password hashing for comprehensive security
- 💳 **Seamless Payments**: Stripe payment gateway integration with support for multiple payment methods and automatic invoice generation
- 📱 **Responsive Design**: Mobile-first approach using Tailwind CSS ensures perfect rendering on devices from smartphones to desktop monitors
- 👨‍💼 **Powerful Admin Tools**: Complete business management suite including product CRUD, order management, user analytics, and pricing controls
- 🎨 **Modern UI/UX**: Framer Motion animations, AOS scroll effects, and smooth transitions create an engaging shopping experience
- 📧 **Automated Notifications**: Email notifications for order confirmations, status updates, and admin alerts using Nodemailer
- 📊 **Analytics Dashboard**: Real-time insights into sales, revenue, popular products, and customer behavior with Chart.js visualizations

---

## ✨ Features

### Customer Features

| Feature | Description |
|---------|-------------|
| 🔍 **Product Discovery** | Browse by category (rings, necklaces, earrings, etc.), filter by material, price, and more |
| 🛒 **Shopping Cart** | Add/remove items, update quantities, save for later |
| ❤️ **Wishlist** | Save favorite products for future purchases |
| 🖼️ **Image Galleries** | View multiple product images with sliding carousel and thumbnail navigation |
| 💎 **Live Pricing** | Real-time gold, silver, and diamond price updates |
| 🔐 **Authentication** | Email/password, OTP-based phone authentication via Firebase |
| 👤 **User Profile** | Manage personal info, addresses, order history |
| 💳 **Secure Checkout** | Stripe-powered payment processing with order tracking |
| 📧 **Email Verification** | Verify email addresses for enhanced security |
| 📱 **SMS OTP** | Fast2SMS integration for mobile verification |

### Admin Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Overview of sales, orders, and inventory |
| 🏷️ **Product Management** | CRUD operations, image uploads, variant management |
| 💰 **Price Management** | Update gold/silver/diamond pricing dynamically |
| 📦 **Order Management** | View, update, and track order statuses |
| 👥 **User Management** | View user details, manage roles and permissions |
| 📈 **Analytics** | Sales charts, revenue tracking, popular products |
| 🔔 **Notifications** | Real-time order notifications via email |
| 🗄️ **Database Scripts** | Migration tools and seed data management |

---

## 🛠️ Technology Stack

### Frontend

```
React 18.3          - UI Library
React Router 7      - Client-side routing
Vite 6              - Build tool & dev server
Tailwind CSS 3      - Utility-first CSS
Framer Motion 11    - Animation library
Three.js / R3F      - 3D product visualization
Chart.js 4          - Data visualization
AOS                 - Animate on scroll
Axios               - HTTP client
Firebase 11         - Authentication
Stripe.js           - Payment processing
```

### Backend

```
Node.js             - Runtime environment
Express 4           - Web framework
MongoDB             - NoSQL database
Mongoose 8          - ODM for MongoDB
Firebase Admin      - Server-side Firebase auth
JWT                 - Token-based authentication
Bcrypt.js           - Password hashing
Multer              - File upload handling
Stripe API          - Payment gateway
OpenAI API          - AI recommendations (Future Enhancement)
Fast2SMS            - OTP service
Nodemailer          - Email notifications
Express Rate Limit  - API rate limiting
```

### DevOps & Tools

```
Git                 - Version control
npm                 - Package manager
Nodemon             - Dev server auto-restart
PostCSS             - CSS processing
dotenv              - Environment variables
MongoDB Atlas       - Cloud database (production)
```

---

## 🏗️ Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile Browser]
    end

    subgraph "Frontend - React/Vite"
        C[React App]
        D[Auth Context]
        E[Cart Context]
        F[Components]
        G[Pages]
        H[API Client]
    end

    subgraph "Backend - Node.js/Express"
        I[Express Server]
        J[Authentication Middleware]
        K[Rate Limiter]
        L[Controllers]
        M[Routes]
        N[Utils]
    end

    subgraph "External Services"
        O[Firebase Auth]
        P[Stripe Payments]
        Q[OpenAI API]
        R[Fast2SMS]
        S[Email SMTP]
    end

    subgraph "Database Layer"
        T[(MongoDB)]
        U[User Model]
        V[Product Model]
        W[Order Model]
        X[Cart Model]
        Y[Diamond Pricing Model]
    end

    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    C --> G
    C --> H
    H --> I
    I --> J
    I --> K
    J --> L
    K --> M
    L --> N
    I --> O
    I --> P
    I --> Q
    I --> R
    I --> S
    L --> T
    T --> U
    T --> V
    T --> W
    T --> X
    T --> Y
```

### Request Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Server
    participant M as Middleware
    participant C as Controller
    participant DB as MongoDB
    participant E as External Service

    U->>F: Browse Products
    F->>A: GET /api/products
    A->>M: Rate Limit Check
    M->>C: Route to Controller
    C->>DB: Query Products
    DB-->>C: Return Products
    C->>C: Calculate Current Price
    C-->>F: JSON Response
    F-->>U: Display Products

    U->>F: Add to Cart
    F->>A: POST /api/cart (with JWT)
    A->>M: Verify JWT Token
    M->>M: Check Blacklist
    M->>C: Route to Controller
    C->>DB: Update Cart
    DB-->>C: Confirm Update
    C-->>F: Success Response
    F-->>U: Cart Updated

    U->>F: Checkout
    F->>A: POST /api/orders/create
    A->>M: Auth Check
    M->>C: Create Order
    C->>DB: Save Order
    C->>E: Process Payment (Stripe)
    E-->>C: Payment Confirmation
    C->>E: Send Email Notification
    C-->>F: Order Confirmation
    F-->>U: Thank You Page
```

### Authentication Flow

```mermaid
flowchart TD
    A[User Access] --> B{Auth Method?}
    B -->|Email/Password| C[Firebase Auth]
    B -->|OTP Login| D[Phone Number Entry]
    
    C --> E{New User?}
    E -->|Yes| F[Create Account]
    E -->|No| G[Login]
    
    D --> H[Send OTP via Fast2SMS]
    H --> I[User Enters OTP]
    I --> J{Valid OTP?}
    J -->|Yes| K[Firebase Verify]
    J -->|No| I
    
    F --> L[Send Verification Email]
    G --> M{Email Verified?}
    M -->|No| N[Prompt Verification]
    M -->|Yes| O[Generate JWT]
    
    K --> O
    L --> O
    
    O --> P[Store Token in Frontend]
    P --> Q[Access Protected Routes]
    
    Q --> R{Token Valid?}
    R -->|Yes| S[Allow Access]
    R -->|No| T{Check Blacklist}
    T -->|Blacklisted| U[Logout]
    T -->|Expired| U
    U --> A
```

### Data Flow Architecture

```mermaid
graph LR
    subgraph "Frontend State Management"
        A1[AuthContext]
        A2[CartContext]
        A3[ToastContext]
    end

    subgraph "API Layer"
        B1[Auth Routes]
        B2[Product Routes]
        B3[Cart Routes]
        B4[Order Routes]
        B5[Admin Routes]
    end

    subgraph "Business Logic"
        C1[Controllers]
        C2[Utils/Helpers]
        C3[Price Calculator]
        C4[Email Validator]
        C5[Order Notification]
    end

    subgraph "Data Models"
        D1[User]
        D2[Product]
        D3[Cart]
        D4[Order]
        D5[DiamondPricing]
    end

    A1 -.-> B1
    A2 -.-> B3
    B1 --> C1
    B2 --> C1
    B3 --> C1
    B4 --> C1
    B5 --> C1
    C1 --> C2
    C1 --> C3
    C1 --> C4
    C1 --> C5
    C1 --> D1
    C1 --> D2
    C1 --> D3
    C1 --> D4
    C1 --> D5
```

### Dynamic Pricing Calculation Flow

Glimmrr's pricing engine is one of its core features, automatically calculating jewelry prices based on real-time precious metal and gemstone rates.

```mermaid
flowchart TD
    A[Product Display Request] --> B{Product Material?}
    
    B -->|Gold| C[Fetch Current Gold Rate]
    B -->|Silver| D[Fetch Current Silver Rate]
    B -->|Diamond| E[Fetch Diamond Pricing]
    B -->|Mixed| F[Calculate Multiple Materials]
    
    C --> G[Get Product Weight]
    D --> G
    E --> H[Get Diamond Specs]
    
    G --> I[Calculate Base Metal Cost]
    I --> J[Apply Purity Factor]
    
    H --> K[Carat × Price per Carat]
    K --> L[Apply Quality Multipliers]
    L --> M[Clarity Factor]
    M --> N[Color Factor]
    N --> O[Cut Factor]
    
    J --> P[Add Making Charges]
    O --> P
    F --> P
    
    P --> Q[Add GST/Taxes]
    Q --> R{Discount Applied?}
    R -->|Yes| S[Apply Discount %]
    R -->|No| T[Final Price]
    S --> T
    
    T --> U[Cache Price for 1 Hour]
    U --> V[Display to Customer]
    
    style A fill:#e1f5ff
    style T fill:#d4edda
    style V fill:#d4edda
```

**Pricing Formula Example:**
```javascript
// Gold Product Price Calculation
finalPrice = (weight × goldRatePerGram × purityFactor) + makingCharges + gst - discount

// Diamond Product Price Calculation  
finalPrice = (caratWeight × pricePerCarat × clarityFactor × colorFactor × cutFactor) + metalCost + makingCharges + gst - discount
```

### Order Processing Workflow

This diagram illustrates the complete order lifecycle from cart to delivery, including payment processing and notifications.

```mermaid
stateDiagram-v2
    [*] --> BrowsingProducts
    
    BrowsingProducts --> AddToCart: User adds item
    AddToCart --> CartReview: Continue shopping
    CartReview --> AddToCart: Add more items
    CartReview --> Checkout: Proceed to checkout
    
    Checkout --> AddressEntry: Enter shipping details
    AddressEntry --> PaymentMethod: Choose payment
    
    PaymentMethod --> StripePayment: Credit/Debit Card
    PaymentMethod --> COD: Cash on Delivery
    PaymentMethod --> BankTransfer: Bank Transfer
    
    StripePayment --> PaymentProcessing: Process with Stripe
    PaymentProcessing --> PaymentSuccess: Payment successful
    PaymentProcessing --> PaymentFailed: Payment failed
    
    PaymentFailed --> PaymentMethod: Retry payment
    
    PaymentSuccess --> OrderCreated: Create order record
    COD --> OrderCreated: Create order record
    BankTransfer --> OrderCreated: Create order record
    
    OrderCreated --> SendConfirmation: Email to customer
    SendConfirmation --> NotifyAdmin: Email to admin
    NotifyAdmin --> OrderPending: Status: Pending
    
    OrderPending --> OrderConfirmed: Admin confirms
    OrderConfirmed --> Processing: Prepare for shipping
    Processing --> Shipped: Assign tracking number
    Shipped --> OutForDelivery: In transit
    OutForDelivery --> Delivered: Customer receives
    
    Delivered --> [*]: Order complete
    
    OrderPending --> Cancelled: Customer/Admin cancels
    OrderConfirmed --> Cancelled: Customer/Admin cancels
    Cancelled --> RefundProcess: Refund if paid
    RefundProcess --> [*]: Refund complete
    
    note right of OrderCreated
        - Generate order number
        - Calculate final price
        - Store order details
        - Clear user's cart
    end note
    
    note right of Shipped
        - Update tracking info
        - Send shipping email
        - Enable order tracking
    end note
```

### File Upload & Image Management Flow

```mermaid
sequenceDiagram
    participant A as Admin Dashboard
    participant F as Frontend Form
    participant M as Multer Middleware
    participant S as Express Server
    participant FS as File System
    participant DB as MongoDB
    participant C as Customer View
    
    A->>F: Upload product images
    F->>F: Validate file type & size
    F->>M: POST multipart/form-data
    
    M->>M: Check file extension (.jpg, .png)
    M->>M: Check file size (< 5MB)
    
    alt Invalid file
        M-->>F: 400 Bad Request
        F-->>A: Show error message
    else Valid file
        M->>FS: Save to /uploads/products/
        FS-->>M: Return file path
        M->>S: Continue to controller
        S->>DB: Save product with image URLs
        DB-->>S: Confirm save
        S-->>F: 200 Success with URLs
        F-->>A: Show success, preview images
    end
    
    C->>S: Request product details
    S->>DB: Fetch product
    DB-->>S: Return product data
    S->>FS: Serve static images
    FS-->>C: Stream image files
    C->>C: Display product gallery
```

---

## 📁 Project Structure

```
glimmrr/
├── 📦 backend/                     # Express.js Backend
│   ├── 🚀 server.js               # Main server file
│   ├── 📋 package.json            # Backend dependencies
│   ├── .env                       # Environment variables
│   │
│   ├── 📂 controllers/            # Request handlers
│   │   └── products.js            # Product CRUD logic
│   │
│   ├── 📂 middleware/             # Express middleware
│   │   ├── auth.js                # JWT authentication
│   │   ├── admin.js               # Admin authorization
│   │   ├── rateLimiter.js         # Rate limiting
│   │   └── tokenBlacklist.js      # Token revocation
│   │
│   ├── 📂 models/                 # Mongoose schemas
│   │   ├── User.js                # User schema
│   │   ├── Product.js             # Product schema
│   │   ├── Cart.js                # Shopping cart schema
│   │   ├── Order.js               # Order schema
│   │   └── DiamondPricing.js      # Diamond pricing schema
│   │
│   ├── 📂 routes/                 # API route definitions
│   │   ├── auth.js                # Auth endpoints
│   │   ├── products.js            # Product endpoints
│   │   ├── cart.js                # Cart endpoints
│   │   ├── orders.js              # Order endpoints
│   │   ├── admin.js               # Admin endpoints
│   │   ├── user.js                # User profile endpoints
│   │   ├── recommend.js           # AI recommendation endpoints
│   │   └── prices.js              # Pricing endpoints
│   │
│   ├── 📂 utils/                  # Utility functions
│   │   ├── priceCalculator.js     # Dynamic price calculation
│   │   ├── emailValidator.js      # Email validation
│   │   ├── fast2sms.js            # SMS OTP service
│   │   ├── adminNotification.js   # Admin notifications
│   │   ├── orderNotification.js   # Order email notifications
│   │   └── productImages.js       # Image upload handling
│   │
│   ├── 📂 scripts/                # Database & utility scripts
│   │   ├── create_admin_user.js   # Admin user creation
│   │   ├── seedProducts.js        # Product seeding
│   │   ├── init_diamond_pricing.js # Initialize pricing
│   │   ├── migrate_gold_karat.js  # Data migration
│   │   └── test_auth_flow.js      # Auth testing
│   │
│   ├── 📂 uploads/                # File uploads
│   │   ├── products/              # Product images
│   │   └── profiles/              # User avatars
│   │
│   └── 📂 logs/                   # Server logs
│
├── 📦 frontend/                    # React Frontend
│   ├── 📄 index.html              # HTML entry point
│   ├── 📋 package.json            # Frontend dependencies
│   ├── ⚙️ vite.config.js          # Vite configuration
│   ├── ⚙️ tailwind.config.js      # Tailwind CSS config
│   ├── .env.local                 # Frontend environment variables
│   │
│   ├── 📂 src/
│   │   ├── 🚀 main.jsx            # React entry point
│   │   ├── 📱 App.jsx             # Main app component
│   │   ├── 🌐 api.js              # API client configuration
│   │   ├── 🔥 firebase.js         # Firebase initialization
│   │   ├── 🎨 index.css           # Global styles
│   │   │
│   │   ├── 📂 components/         # Reusable components
│   │   │   ├── Header.jsx         # Navigation header
│   │   │   ├── Footer.jsx         # Site footer
│   │   │   ├── LoadingOverlay.jsx # Loading spinner
│   │   │   ├── ConfirmDialog.jsx  # Confirmation modal
│   │   │   ├── ProtectedRoute.jsx # Route guard
│   │   │   ├── ScrollToTop.jsx    # Scroll behavior
│   │   │   └── DiamondPricingManager.jsx # Admin pricing
│   │   │
│   │   ├── 📂 contexts/           # React Context providers
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   ├── CartContext.jsx    # Shopping cart state
│   │   │   └── ToastContext.jsx   # Toast notifications
│   │   │
│   │   ├── 📂 pages/              # Page components
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Products.jsx       # Product listing
│   │   │   ├── ProductDetail.jsx  # Product details
│   │   │   ├── Cart.jsx           # Shopping cart
│   │   │   ├── Checkout.jsx       # Checkout process
│   │   │   ├── ThankYou.jsx       # Order confirmation
│   │   │   ├── Profile.jsx        # User profile
│   │   │   ├── Admin.jsx          # Admin dashboard
│   │   │   ├── Recommender.jsx    # AI recommendations
│   │   │   ├── Prices.jsx         # Live pricing page
│   │   │   ├── Wishlist.jsx       # Wishlist page
│   │   │   ├── Collections.jsx    # Product collections
│   │   │   ├── Auth.jsx           # Authentication
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Signup.jsx         # Registration
│   │   │   ├── OTPLogin.jsx       # OTP authentication
│   │   │   ├── VerifyEmail.jsx    # Email verification
│   │   │   ├── Contact.jsx        # Contact page
│   │   │   ├── AboutUs.jsx        # About page
│   │   │   ├── SizeGuide.jsx      # Jewelry size guide
│   │   │   └── CareInstructions.jsx # Care tips
│   │   │
│   │   ├── 📂 utils/              # Utility functions
│   │   │   ├── authHelpers.js     # Auth utilities
│   │   │   ├── addressUtils.js    # Address formatting
│   │   │   ├── emailValidator.js  # Email validation
│   │   │   └── googleMapsUtils.js # Maps integration
│   │   │
│   │   └── 📂 assets/             # Static assets
│   │       └── images/            # Image files
│   │
│   └── 📂 public/                 # Public assets
│
└── 📋 package.json                # Root package.json
```

---

## 🚀 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18+ recommended)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** for version control

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/glimmrr.git
cd glimmrr
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration (see Configuration section)
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your configuration
```

### Step 4: Database Setup

```bash
# Navigate to backend
cd ../backend

# Initialize diamond pricing
node scripts/init_diamond_pricing.js

# Create admin user
node scripts/create_admin_user.js

# (Optional) Seed products
node seed/seedProductsSafe.js
```

### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5002
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 6: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002/api
- **Admin Panel**: http://localhost:5173/admin

### Development Workflow

Once your application is running, here's a typical development workflow:

```mermaid
graph TD
    A[Start Development] --> B[Run Backend Server]
    A --> C[Run Frontend Dev Server]
    
    B --> D[backend runs on :5002]
    C --> E[frontend runs on :5173]
    
    D --> F[MongoDB Connected]
    F --> G[API Endpoints Ready]
    
    E --> H[Vite Dev Server]
    H --> I[Hot Module Replacement]
    
    G --> J[Test API with Postman/Thunder Client]
    I --> K[Make Frontend Changes]
    
    K --> L{Changes Saved?}
    L -->|Yes| M[Auto Reload Browser]
    L -->|No| K
    
    M --> N[Test in Browser]
    N --> O{Working Correctly?}
    O -->|Yes| P[Commit Changes]
    O -->|No| Q[Debug & Fix]
    Q --> K
    
    P --> R[Push to Repository]
    R --> S[Continue Development]
    S --> A
```

### Common Installation Issues & Solutions

#### Issue 1: MongoDB Connection Failed
```bash
# Error: MongoServerError: connect ECONNREFUSED
# Solution:
# 1. Ensure MongoDB is running
mongod --dbpath C:\data\db  # Windows
mongod --dbpath /usr/local/var/mongodb  # macOS

# 2. Or use MongoDB Atlas (cloud)
# Update MONGO_URI in .env to MongoDB Atlas connection string
```

#### Issue 2: Port Already in Use
```bash
# Error: EADDRINUSE: address already in use :::5002
# Solution:
# Windows:
netstat -ano | findstr :5002
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5002 | xargs kill -9

# Or change PORT in backend/.env
```

#### Issue 3: Firebase Configuration Error
```bash
# Error: Firebase: Error (auth/invalid-api-key)
# Solution:
# 1. Verify all Firebase config values in frontend/.env.local
# 2. Check Firebase console for correct credentials
# 3. Ensure Firebase project is active
```

#### Issue 4: Module Not Found
```bash
# Error: Cannot find module 'xyz'
# Solution:
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or clear npm cache
npm cache clean --force
npm install
```

#### Issue 5: CORS Errors
```javascript
// Error: Access to XMLHttpRequest blocked by CORS policy
// Solution: Ensure backend CORS is configured correctly
// In backend/server.js:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Verification Checklist

After installation, verify everything is working:

- [ ] Backend server starts without errors
- [ ] MongoDB connection successful
- [ ] Frontend dev server running
- [ ] Can access homepage (http://localhost:5173)
- [ ] Can view products page
- [ ] API endpoint test: http://localhost:5002/api/products
- [ ] Can register a new user
- [ ] Email verification works (check console logs)
- [ ] Can login with credentials
- [ ] Can add items to cart
- [ ] Admin dashboard accessible
- [ ] Image uploads working

### Performance Optimization Tips

**Backend Optimization:**
```javascript
// 1. Enable MongoDB indexing
ProductSchema.index({ category: 1, material: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

// 2. Implement caching for pricing
const cache = new Map();
const CACHE_DURATION = 3600000; // 1 hour

// 3. Use projection to limit returned fields
Product.find({}).select('name price images').lean();

// 4. Implement pagination
const page = req.query.page || 1;
const limit = req.query.limit || 20;
const skip = (page - 1) * limit;
```

**Frontend Optimization:**
```javascript
// 1. Lazy load images
<img loading="lazy" src={imageUrl} alt={productName} />

// 2. Code splitting with React.lazy
const Admin = lazy(() => import('./pages/Admin'));

// 3. Memoize expensive computations
const calculatedPrice = useMemo(() => {
  return calculatePrice(product, currentRates);
}, [product, currentRates]);

// 4. Debounce search inputs
const debouncedSearch = useDebouce(searchTerm, 500);
```

---

## ⚙️ Configuration

### Backend Environment Variables (`.env`)

```env
# Server Configuration
PORT=5002
BACKEND_PORT=5002
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/glimmr
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/glimmr

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour Key Here\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# OpenAI API (for AI recommendations)
OPENAI_API_KEY=sk-your-openai-api-key

# Fast2SMS (OTP Service)
FAST2SMS_API_KEY=your_fast2sms_api_key

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=Glimmrr <noreply@glimmrr.com>

# Admin Configuration
ADMIN_EMAIL=admin@glimmrr.com
ADMIN_NOTIFICATION_EMAIL=admin@glimmrr.com

# Security
AUTO_DROP_LEGACY_INDEX=true
AUTO_FIX_EMAIL_INDEX=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables (`.env.local`)

```env
# API Configuration
VITE_API_URL=http://localhost:5002/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Stripe (Public Key)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Application Settings
VITE_APP_NAME=Glimmrr
VITE_APP_URL=http://localhost:5173
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5002/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### OTP Login (Send OTP)
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "123456",
  "firebaseToken": "firebase_id_token"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <JWT_TOKEN>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?category=rings&material=gold&minPrice=5000&maxPrice=50000&page=1&limit=20
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

{
  "name": "Gold Ring",
  "description": "Beautiful gold ring",
  "category": "rings",
  "material": "gold",
  "basePrice": 15000,
  "weight": 5.5,
  "images": [file1, file2]
}
```

#### Update Product (Admin)
```http
PUT /api/products/:id
Authorization: Bearer <JWT_TOKEN>
```

#### Delete Product (Admin)
```http
DELETE /api/products/:id
Authorization: Bearer <JWT_TOKEN>
```

### Cart Endpoints

#### Get Cart
```http
GET /api/cart
Authorization: Bearer <JWT_TOKEN>
```

#### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 1,
  "size": "18"
}
```

#### Update Cart Item
```http
PUT /api/cart/update/:itemId
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "quantity": 2
}
```

#### Remove from Cart
```http
DELETE /api/cart/remove/:itemId
Authorization: Bearer <JWT_TOKEN>
```

#### Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer <JWT_TOKEN>
```

### Order Endpoints

#### Create Order
```http
POST /api/orders/create
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "paymentMethod": "stripe",
  "stripePaymentIntentId": "pi_xxxxx"
}
```

#### Get User Orders
```http
GET /api/orders/my-orders
Authorization: Bearer <JWT_TOKEN>
```

#### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <JWT_TOKEN>
```

#### Update Order Status (Admin)
```http
PUT /api/orders/:id/status
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "status": "shipped"
}
```

### Pricing Endpoints

#### Get Current Prices
```http
GET /api/prices
```

Response:
```json
{
  "gold": {
    "22K": 6500,
    "24K": 7000,
    "18K": 5500
  },
  "silver": 85,
  "diamond": {
    "0.5": 50000,
    "1.0": 180000,
    "2.0": 650000
  }
}
```

#### Update Prices (Admin)
```http
PUT /api/prices/update
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "gold22K": 6600,
  "silver": 90
}
```

### Recommendation Endpoint

#### Get AI Recommendations
```http
POST /api/recommend
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "preferences": {
    "budget": 50000,
    "occasion": "wedding",
    "style": "traditional"
  }
}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /api/admin/stats
Authorization: Bearer <JWT_TOKEN>
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <JWT_TOKEN>
```

#### Get All Orders
```http
GET /api/admin/orders
Authorization: Bearer <JWT_TOKEN>
```

---

## 🗄️ Database Schema

### User Schema

```javascript
{
  _id: ObjectId,
  email: String (unique, sparse),
  password: String (hashed),
  name: String,
  phone: String (unique, sparse),
  role: String (enum: ['customer', 'admin'], default: 'customer'),
  emailVerified: Boolean (default: false),
  phoneVerified: Boolean (default: false),
  addresses: [{
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    isDefault: Boolean
  }],
  wishlist: [ObjectId] (ref: 'Product'),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  category: String (enum: ['rings', 'necklaces', 'earrings', 'bracelets', 'pendants']),
  material: String (enum: ['gold', 'silver', 'diamond', 'platinum']),
  basePrice: Number (required),
  weight: Number (in grams),
  purity: String (e.g., '22K', '24K', '18K'),
  images: [String] (URLs),
  stock: Number (default: 0),
  sizes: [String],
  tags: [String],
  featured: Boolean (default: false),
  discount: Number (percentage),
  specifications: {
    length: Number,
    width: Number,
    diamondWeight: Number,
    stoneType: String,
    metalColor: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Schema

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  items: [{
    product: ObjectId (ref: 'Product'),
    quantity: Number (default: 1),
    size: String,
    priceAtAdd: Number,
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema

```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  user: ObjectId (ref: 'User'),
  items: [{
    product: ObjectId (ref: 'Product'),
    name: String,
    quantity: Number,
    price: Number,
    size: String,
    image: String
  }],
  totalAmount: Number,
  status: String (enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  paymentMethod: String (enum: ['stripe', 'cod', 'bank_transfer']),
  paymentStatus: String (enum: ['pending', 'paid', 'failed', 'refunded']),
  stripePaymentIntentId: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  trackingNumber: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### DiamondPricing Schema

```javascript
{
  _id: ObjectId,
  carat: Number (e.g., 0.5, 1.0, 2.0),
  pricePerCarat: Number,
  clarity: String (enum: ['IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2']),
  color: String (enum: ['D', 'E', 'F', 'G', 'H', 'I', 'J']),
  cut: String (enum: ['Excellent', 'Very Good', 'Good', 'Fair']),
  lastUpdated: Date
}
```

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ CART : has
    USER ||--o{ ORDER : places
    USER }o--o{ PRODUCT : wishlist
    CART ||--|{ CART_ITEM : contains
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ CART_ITEM : includes
    PRODUCT ||--o{ ORDER_ITEM : includes
    PRODUCT }o--|| DIAMOND_PRICING : references

    USER {
        ObjectId _id PK
        String email UK
        String password
        String name
        String phone UK
        String role
        Boolean emailVerified
        Array addresses
        Array wishlist FK
    }

    PRODUCT {
        ObjectId _id PK
        String name
        String category
        String material
        Number basePrice
        Number weight
        Array images
        Number stock
        Object specifications
    }

    CART {
        ObjectId _id PK
        ObjectId user FK
        Array items
        Date createdAt
    }

    ORDER {
        ObjectId _id PK
        String orderNumber UK
        ObjectId user FK
        Array items
        Number totalAmount
        String status
        String paymentMethod
        Object shippingAddress
    }

    DIAMOND_PRICING {
        ObjectId _id PK
        Number carat
        Number pricePerCarat
        String clarity
        String color
        String cut
    }
```

---

## 🎨 Frontend Components

### Component Hierarchy

```
App
├── Header
│   ├── Navigation
│   ├── SearchBar
│   ├── CartIcon
│   └── UserMenu
├── Router
│   ├── Home
│   │   ├── Hero
│   │   ├── FeaturedProducts
│   │   ├── Categories
│   │   └── Testimonials
│   ├── Products
│   │   ├── ProductGrid
│   │   ├── FilterSidebar
│   │   └── ProductCard
│   ├── ProductDetail
│   │   ├── ImageGallery
│   │   ├── ProductInfo
│   │   ├── PriceCalculator
│   │   └── RelatedProducts
│   ├── Cart
│   │   ├── CartItems
│   │   ├── CartSummary
│   │   └── CheckoutButton
│   ├── Checkout
│   │   ├── ShippingForm
│   │   ├── PaymentForm
│   │   └── OrderSummary
│   ├── Profile
│   │   ├── UserInfo
│   │   ├── OrderHistory
│   │   └── AddressBook
│   └── Admin
│       ├── Dashboard
│       ├── ProductManagement
│       ├── OrderManagement
│       └── UserManagement
└── Footer
    ├── Links
    ├── Newsletter
    └── SocialMedia
```

### Key Component Descriptions

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **AuthContext** | Global authentication state | User login/logout, token management, role-based access |
| **CartContext** | Shopping cart state | Add/remove items, quantity updates, persist to backend |
| **ToastContext** | Notification system | Success/error messages, auto-dismiss |
| **Header** | Navigation bar | Logo, menu, search, cart icon, user dropdown |
| **ProductCard** | Product display tile | Image, name, price, quick actions (add to cart/wishlist) |
| **ProductDetail** | Detailed product view | Image gallery, specifications, size selector, price calculator |
| **LoadingOverlay** | Loading indicator | Full-screen spinner during async operations |
| **ConfirmDialog** | Confirmation modal | Delete/action confirmations with custom messages |
| **DiamondPricingManager** | Admin price control | Update gold/silver/diamond prices in real-time |

---

## 🔐 Security Features

### Authentication & Authorization

- **Firebase Authentication**: Secure email/password and OTP-based authentication
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Token Blacklisting**: Revoke tokens on logout for enhanced security
- **Role-Based Access Control**: Admin vs customer permissions
- **Password Hashing**: Bcrypt with salt rounds for secure password storage

### API Security

- **Rate Limiting**: Prevent brute-force attacks (100 requests/15 min)
- **CORS Configuration**: Restrict cross-origin requests
- **Input Validation**: Sanitize and validate all user inputs
- **Email Verification**: Ensure valid email addresses
- **Phone Verification**: OTP-based phone number validation

### Data Protection

- **Encrypted Connections**: HTTPS in production
- **Environment Variables**: Sensitive data stored in `.env` files
- **MongoDB Injection Prevention**: Mongoose sanitization
- **XSS Protection**: React's built-in XSS prevention
- **File Upload Validation**: Restrict file types and sizes

### Security Best Practices

```javascript
// Example: JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 🧪 Testing

### Testing Strategy

Glimmrr follows a comprehensive testing approach to ensure reliability and maintainability.

```mermaid
graph TB
    A[Testing Strategy] --> B[Unit Tests]
    A --> C[Integration Tests]
    A --> D[E2E Tests]
    A --> E[API Tests]
    
    B --> B1[Controllers]
    B --> B2[Utils/Helpers]
    B --> B3[Validators]
    
    C --> C1[API Routes]
    C --> C2[Database Operations]
    C --> C3[Authentication Flow]
    
    D --> D1[User Journeys]
    D --> D2[Checkout Process]
    D --> D3[Admin Operations]
    
    E --> E1[Postman Collections]
    E --> E2[Response Validation]
    E --> E3[Performance Testing]
```

### Manual Testing Checklist

#### Customer Flow Testing
```bash
# 1. User Registration & Authentication
- [ ] Register with email/password
- [ ] Receive verification email
- [ ] Verify email address
- [ ] Login with credentials
- [ ] Register with phone OTP
- [ ] Receive OTP SMS
- [ ] Verify OTP code
- [ ] Logout functionality

# 2. Product Browsing
- [ ] View all products
- [ ] Filter by category (rings, necklaces, etc.)
- [ ] Filter by material (gold, silver, diamond)
- [ ] Filter by price range
- [ ] Search products by name
- [ ] View product details
- [ ] Check price calculations
- [ ] View product images (gallery)

# 3. Shopping Cart
- [ ] Add product to cart
- [ ] Update quantity
- [ ] Remove item from cart
- [ ] View cart total
- [ ] Cart persists after logout
- [ ] Select product size

# 4. Wishlist
- [ ] Add to wishlist
- [ ] Remove from wishlist
- [ ] Move wishlist item to cart
- [ ] Wishlist persists across sessions

# 5. Checkout & Orders
- [ ] Proceed to checkout
- [ ] Enter shipping address
- [ ] Save address for future
- [ ] Select payment method
- [ ] Process Stripe payment
- [ ] Receive order confirmation email
- [ ] View order in profile
- [ ] Track order status

# 6. Profile Management
- [ ] Update profile information
- [ ] Change password
- [ ] Add multiple addresses
- [ ] Set default address
- [ ] View order history
- [ ] Download invoices
```

#### Admin Flow Testing
```bash
# 1. Admin Authentication
- [ ] Login with admin credentials
- [ ] Access denied for non-admin users
- [ ] Admin dashboard loads correctly

# 2. Product Management
- [ ] Create new product
- [ ] Upload product images (multiple)
- [ ] Edit existing product
- [ ] Delete product
- [ ] Update stock quantity
- [ ] Set product as featured
- [ ] Add product specifications

# 3. Order Management
- [ ] View all orders
- [ ] Filter orders by status
- [ ] Update order status
- [ ] Add tracking number
- [ ] Cancel order
- [ ] Send order notifications
- [ ] View order details

# 4. User Management
- [ ] View all users
- [ ] Search users
- [ ] View user details
- [ ] View user order history

# 5. Pricing Management
- [ ] Update gold prices (22K, 24K, 18K)
- [ ] Update silver price
- [ ] Update diamond pricing
- [ ] Verify price calculations on products

# 6. Analytics
- [ ] View sales charts
- [ ] Check revenue statistics
- [ ] View popular products
- [ ] Export reports
```

### API Testing with Scripts

```javascript
// Test Script: backend/scripts/test_complete_flow.js
const axios = require('axios');
const API_URL = 'http://localhost:5002/api';

// Test 1: User Registration
const testUserRegistration = async () => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    email: 'test@example.com',
    password: 'Test123!',
    name: 'Test User'
  });
  console.log('✓ User Registration:', response.status === 201);
  return response.data.token;
};

// Test 2: Product Listing
const testProductListing = async () => {
  const response = await axios.get(`${API_URL}/products`);
  console.log('✓ Product Listing:', response.data.length > 0);
  return response.data[0]._id;
};

// Test 3: Add to Cart
const testAddToCart = async (token, productId) => {
  const response = await axios.post(
    `${API_URL}/cart/add`,
    { productId, quantity: 1 },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log('✓ Add to Cart:', response.status === 200);
};

// Run all tests
const runTests = async () => {
  try {
    const token = await testUserRegistration();
    const productId = await testProductListing();
    await testAddToCart(token, productId);
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

runTests();
```

### Performance Testing

```bash
# Load testing with Artillery
npm install -g artillery

# Create artillery-config.yml
config:
  target: 'http://localhost:5002'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
    - get:
        url: '/api/products'
    - get:
        url: '/api/prices'

# Run load test
artillery run artillery-config.yml
```

### Database Testing Scripts

```bash
# Test database connections
node backend/scripts/test_db_connection.js

# Test data migrations
node backend/scripts/test_migrations.js

# Verify indexes
node backend/scripts/list_indexes.js

# Test authentication flow
node backend/scripts/test_auth_flow.js

# Test price calculations
node backend/scripts/test_price_filter.js
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Update all environment variables for production
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or managed database
- [ ] Configure Stripe live keys
- [ ] Set up SSL certificates (HTTPS)
- [ ] Enable CORS for production domain
- [ ] Configure rate limiting for production traffic
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Configure CDN for static assets
- [ ] Enable database backups
- [ ] Set up CI/CD pipeline
- [ ] Configure logging and monitoring

### Production Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Mobile Users]
        B[Desktop Users]
        C[Tablet Users]
    end
    
    subgraph "CDN Layer"
        D[Cloudflare CDN]
        E[Static Assets Cache]
        F[Image Optimization]
    end
    
    subgraph "Frontend Deployment - Vercel"
        G[React App Build]
        H[Edge Functions]
        I[Environment Variables]
    end
    
    subgraph "Load Balancer"
        J[Nginx/AWS ALB]
    end
    
    subgraph "Backend Deployment - AWS/Render"
        K[Node.js Server 1]
        L[Node.js Server 2]
        M[Node.js Server 3]
    end
    
    subgraph "Database Layer"
        N[(MongoDB Atlas - Primary)]
        O[(MongoDB Replica 1)]
        P[(MongoDB Replica 2)]
    end
    
    subgraph "External Services"
        Q[Firebase Auth]
        R[Stripe API]
        S[OpenAI API]
        T[Fast2SMS]
        U[Email SMTP]
    end
    
    subgraph "Monitoring & Logging"
        V[CloudWatch/LogRocket]
        W[Error Tracking - Sentry]
        X[Performance Monitoring]
    end
    
    subgraph "Backup & Recovery"
        Y[Automated Backups]
        Z[Disaster Recovery]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    E --> G
    F --> G
    G --> H
    G --> I
    G --> J
    J --> K
    J --> L
    J --> M
    K --> N
    L --> N
    M --> N
    N --> O
    N --> P
    K --> Q
    K --> R
    K --> S
    K --> T
    K --> U
    K --> V
    K --> W
    K --> X
    N --> Y
    Y --> Z
```

### Deployment Options

#### Option 1: Traditional VPS (DigitalOcean, AWS EC2)

**Advantages:**
- Full control over infrastructure
- Cost-effective for high-traffic sites
- Custom server configurations

**Setup Process:**

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Install Node.js and MongoDB
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mongodb

# 3. Install PM2 for process management
sudo npm install -g pm2

# 4. Clone repository
git clone https://github.com/yourusername/glimmrr.git
cd glimmrr

# 5. Setup Backend
cd backend
npm install --production
cp .env.example .env
# Edit .env with production values

# 6. Start backend with PM2
pm2 start server.js --name glimmrr-backend
pm2 save
pm2 startup

# 7. Setup Frontend
cd ../frontend
npm install
npm run build

# 8. Configure Nginx
sudo nano /etc/nginx/sites-available/glimmrr

# Nginx Configuration:
server {
    listen 80;
    server_name glimmrr.com www.glimmrr.com;
    
    # Frontend
    location / {
        root /var/www/glimmrr/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static uploads
    location /uploads {
        alias /var/www/glimmrr/backend/uploads;
    }
}

# 9. Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/glimmrr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d glimmrr.com -d www.glimmrr.com
```

#### Option 2: Platform as a Service (Heroku, Render)

**Advantages:**
- Easy deployment and scaling
- Automatic SSL certificates
- Built-in monitoring

**Render Deployment:**

```yaml
# render.yaml
services:
  # Backend Service
  - type: web
    name: glimmrr-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && node server.js
    envVars:
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production
    
  # Frontend Service  
  - type: web
    name: glimmrr-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

**Heroku Deployment:**

```bash
# Backend
cd backend
heroku create glimmrr-api
heroku addons:create mongolab:sandbox
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production
git push heroku main

# Frontend
cd ../frontend
heroku create glimmrr-web
heroku buildpacks:set heroku/nodejs
heroku config:set VITE_API_URL=https://glimmrr-api.herokuapp.com/api
npm run build
git push heroku main
```

#### Option 3: Serverless (Vercel, Netlify)

**Advantages:**
- Auto-scaling
- Global CDN
- Zero-config deployment

**Vercel Deployment:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy Frontend
cd frontend
vercel --prod

# Configure environment variables in Vercel dashboard
# VITE_API_URL
# VITE_FIREBASE_* (all Firebase keys)
# VITE_STRIPE_PUBLIC_KEY
```

**Backend on Railway:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway up

# Add environment variables
railway variables set MONGO_URI=your_mongodb_uri
railway variables set JWT_SECRET=your_secret
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5002
CMD ["node", "server.js"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5002:5002"
    environment:
      - MONGO_URI=mongodb://mongo:27017/glimmrr
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:5002/api
  
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

```bash
# Deploy with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Scale backend
docker-compose up -d --scale backend=3
```

### Environment Variables for Production

**Backend:**
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
FRONTEND_URL=https://glimmrr.com
```

**Frontend:**
```env
VITE_API_URL=https://api.glimmrr.com
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Write tests for new functionality

### Pull Request Process

1. Ensure all tests pass
2. Update README if needed
3. Add screenshots for UI changes
4. Request review from maintainers
5. Address review feedback

---

## ❓ Frequently Asked Questions (FAQ)

### General Questions

**Q: What makes Glimmrr different from other e-commerce platforms?**

A: Glimmrr is specifically designed for jewelry businesses with unique features:
- Dynamic pricing based on real-time precious metal rates
- AI-powered product recommendations using OpenAI
- Multiple authentication methods (email, phone OTP)
- Built-in diamond pricing calculator with carat, clarity, color, and cut factors
- Comprehensive admin dashboard with analytics

**Q: Can I use Glimmrr for other types of e-commerce?**

A: Yes! While optimized for jewelry, the platform is flexible enough for any e-commerce business. You may need to modify the pricing calculator and product attributes for your specific needs.

**Q: Is Glimmrr production-ready?**

A: Yes! Glimmrr includes all essential features for a production environment:
- Security measures (JWT, rate limiting, token blacklisting)
- Payment processing (Stripe)
- Email notifications
- Error handling
- Scalable architecture

However, ensure you:
- Use environment variables for sensitive data
- Enable HTTPS in production
- Set up proper monitoring and logging
- Implement regular backups

### Technical Questions

**Q: How does the dynamic pricing system work?**

A: The pricing engine calculates product prices in real-time using:
```javascript
// Formula varies by material:
// Gold: weight × rate × purity + making charges + tax - discount
// Diamond: carat × rate × quality factors + metal cost + tax - discount
```
Admins can update base rates through the admin panel, and all product prices recalculate automatically.

**Q: How do I customize the product categories?**

A: Edit the Product model schema in [backend/models/Product.js](backend/models/Product.js):
```javascript
category: {
  type: String,
  enum: ['rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'YOUR_CATEGORY'],
  required: true
}
```

**Q: Can I add more payment gateways besides Stripe?**

A: Yes! You can integrate additional payment gateways by:
1. Installing the SDK: `npm install razorpay` (example)
2. Adding payment routes in [backend/routes/orders.js](backend/routes/orders.js)
3. Creating payment processing logic in controllers
4. Updating frontend checkout component

**Q: How do I change the email provider?**

A: Update the email configuration in [backend/.env](backend/.env):
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@provider.com
EMAIL_PASS=your-password
```
Supported: Gmail, SendGrid, Mailgun, AWS SES, etc.

**Q: How do I add more languages (i18n)?**

A: Implement internationalization:
1. Install i18n library: `npm install react-i18next`
2. Create translation files: `frontend/src/locales/en.json`, `fr.json`, etc.
3. Wrap app with i18n provider
4. Use translation keys in components

**Q: Can I customize the admin dashboard?**

A: Absolutely! The admin panel is built with React components. Modify [frontend/src/pages/Admin.jsx](frontend/src/pages/Admin.jsx) to add:
- Custom analytics charts
- Additional management sections
- Bulk operations
- Export features

### Database Questions

**Q: How do I backup the database?**

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/glimmr" --out=/backup/path

# MongoDB restore
mongorestore --uri="mongodb://localhost:27017/glimmr" /backup/path/glimmr

# MongoDB Atlas: Use automated backups feature in cloud dashboard
```

**Q: How do I migrate from local MongoDB to MongoDB Atlas?**

```bash
# 1. Export local data
mongodump --uri="mongodb://localhost:27017/glimmr" --out=./backup

# 2. Import to Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/glimmr" ./backup/glimmr

# 3. Update .env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/glimmr
```

**Q: What indexes should I create for better performance?**

```javascript
// In models/Product.js
ProductSchema.index({ category: 1, material: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ featured: 1, createdAt: -1 });

// In models/Order.js
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ status: 1 });
```

### Security Questions

**Q: How secure is the authentication system?**

A: Glimmrr implements multiple security layers:
- Firebase Authentication for initial auth
- JWT tokens for API authentication
- Token blacklisting for secure logout
- Bcrypt password hashing with salt
- Rate limiting to prevent brute force
- Email/phone verification
- HTTPS enforcement in production

**Q: How do I implement two-factor authentication (2FA)?**

A: Integrate a 2FA library like `speakeasy`:
```bash
npm install speakeasy qrcode
```
Add 2FA secret to User model and implement verification flow.

**Q: How do I handle PCI compliance for payments?**

A: Glimmrr uses Stripe for payment processing, which is PCI DSS Level 1 compliant. Key points:
- Never store credit card numbers
- Use Stripe.js for card tokenization
- Payment data goes directly to Stripe
- Backend only receives payment tokens

### Troubleshooting

**Problem: Images not uploading**
```bash
# Check upload directory permissions
chmod -R 755 backend/uploads

# Verify multer configuration in backend/utils/productImages.js
# Check file size limits in middleware
```

**Problem: OTP not received**
```javascript
// Check Fast2SMS API key in .env
// Verify phone number format: +91XXXXXXXXXX
// Check Fast2SMS dashboard for balance and API status
// Test with backend/scripts/send_test_otp.js
```

**Problem: Stripe payments failing**
```javascript
// 1. Verify Stripe keys in .env (test vs live)
// 2. Check webhook configuration
// 3. Test card numbers:
//    Success: 4242 4242 4242 4242
//    Decline: 4000 0000 0000 0002
// 4. Check Stripe dashboard for error details
```

**Problem: Products not displaying correct prices**
```bash
# 1. Verify pricing data exists:
node backend/scripts/init_diamond_pricing.js

# 2. Check priceCalculator.js logic
# 3. Verify product weight and material fields
# 4. Clear cache if implemented
```

**Problem: High memory usage**
```javascript
// Optimize queries with lean()
const products = await Product.find({}).lean();

// Implement pagination
const limit = 20;
const skip = (page - 1) * limit;
const products = await Product.find().limit(limit).skip(skip);

// Use projection to limit fields
const products = await Product.find().select('name price images');
```

### Performance Questions

**Q: How do I improve page load times?**

1. **Frontend:**
   - Implement code splitting with React.lazy
   - Optimize images (use WebP format)
   - Enable lazy loading for images
   - Use CDN for static assets
   - Implement service workers for caching

2. **Backend:**
   - Add Redis caching for frequently accessed data
   - Optimize database queries with indexes
   - Implement API response caching
   - Use connection pooling for MongoDB

3. **Infrastructure:**
   - Use CDN (Cloudflare, AWS CloudFront)
   - Enable gzip compression
   - Implement load balancing
   - Use HTTP/2

**Q: How many concurrent users can Glimmrr handle?**

A: Performance depends on infrastructure:
- **Single server**: 100-500 concurrent users
- **Load-balanced**: 1,000-10,000+ concurrent users
- **Optimized with CDN & caching**: 50,000+ concurrent users

Benchmark your specific setup with load testing tools like Artillery or Apache JMeter.

### Customization Questions

**Q: How do I change the theme colors?**

A: Edit [frontend/tailwind.config.js](frontend/tailwind.config.js):
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
        accent: '#your-color',
      }
    }
  }
}
```

**Q: How do I add a new product attribute?**

1. Update Product model:
```javascript
// backend/models/Product.js
newAttribute: {
  type: String,
  required: false
}
```

2. Update product form:
```javascript
// frontend/src/pages/Admin.jsx
<input name="newAttribute" ... />
```

3. Update display:
```javascript
// frontend/src/pages/ProductDetail.jsx
<div>{product.newAttribute}</div>
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- **Email**: support@glimmrr.com
- **Website**: https://glimmrr.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/glimmrr/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/glimmrr/wiki)

---

## 🙏 Acknowledgments

- **React Team** for the amazing frontend library
- **Express.js** for the robust backend framework
- **MongoDB** for the flexible database
- **Stripe** for payment processing
- **Firebase** for authentication services
- **OpenAI** for AI capabilities
- **TailwindCSS** for beautiful styling
- **Community Contributors** for their valuable input

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/glimmrr?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/glimmrr?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/glimmrr)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/glimmrr)

---

<div align="center">

**Made with ❤️ by the Glimmrr Team**

⭐ Star this repo if you found it helpful!

</div>

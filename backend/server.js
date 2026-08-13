const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const { startKeepAlive } = require('./utils/keepAlive');

// Load environment variables before loading any route modules that rely on them (SMTP, etc.)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const recommendRoutes = require('./routes/recommend');
const priceRoutes = require('./routes/prices');
const newsletterRoutes = require('./routes/newsletter');
const customOrderRoutes = require('./routes/customOrders');

const app = express();
console.log('Starting Glimmr backend...');
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5002;

// CORS configuration for production (Vercel frontend + Render backend)
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://glimmr-jewellry-e-commerce-platform.vercel.app',
    /\.vercel\.app$/,  // Allow all Vercel preview deployments
    /\.netlify\.app$/  // Allow Netlify deployments if used
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// HTTP Security Headers & Cross-Site Protection
app.use(helmet({
  contentSecurityPolicy: false, // Allow cross-origin images and fonts
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// NoSQL Injection Defense Middleware: Sanitize request query and body operators
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`[SECURITY] Sanitized potentially malicious NoSQL key: ${key}`);
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});
// Serve uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// SMTP health check endpoint to help diagnose OTP send failures
app.get('/api/health/smtp', async (req, res) => {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter((v) => !process.env[v]);
  if (missing.length) {
    return res.status(500).json({ ok: false, error: 'Missing SMTP env vars', missing });
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 15000,
  });

  try {
    await transport.verify();
    return res.json({ ok: true, host: process.env.SMTP_HOST, secure: process.env.SMTP_SECURE === 'true' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Ensure upload directories exist
const uploadDirs = ['uploads/products', 'uploads/profiles'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});


async function connectDB() {
  try {
    
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glimmr';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
      
      if (process.env.AUTO_DROP_LEGACY_INDEX === 'true') {
        try {
          const coll = mongoose.connection.db.collection('users');
          const indexes = await coll.indexes();
          const hasMobileIndex = indexes.some((idx) => idx.name === 'mobile_1');
          if (hasMobileIndex) {
            console.warn('Dropping legacy index `mobile_1` to avoid duplicate null constraint on phone');
            try {
              await coll.dropIndex('mobile_1');
              console.log('Dropped legacy index mobile_1');
            } catch (err) {
              console.warn('Failed to drop mobile_1 index:', err && err.message ? err.message : err);
            }
          }
        } catch (err) {
          console.warn('Index cleanup skipped or failed:', err && err.message ? err.message : err);
        }
      }
      // Optionally fix email/phone indexes that are non-sparse unique and cause duplicate-null errors
      if (process.env.AUTO_FIX_EMAIL_INDEX === 'true') {
        try {
          const coll = mongoose.connection.db.collection('users');
          const indexes = await coll.indexes();
          // Find any index that targets the `email` field and is unique without a partial filter
          const emailIndexes = indexes.filter((idx) => {
            try {
              const key = idx.key || {};
              return Object.prototype.hasOwnProperty.call(key, 'email');
            } catch (e) {
              return false;
            }
          });

          for (const idx of emailIndexes) {
            const isUnique = !!idx.unique;
            const hasPartial = !!idx.partialFilterExpression || !!idx.sparse;
            if (isUnique && !hasPartial) {
              try {
                console.warn(`Dropping problematic email index: ${idx.name}`);
                await coll.dropIndex(idx.name);
              } catch (err) {
                console.warn(`Failed to drop index ${idx.name}:`, err && err.message ? err.message : err);
              }
            }
          }

          // Create a safe partial unique index for email to allow multiple nulls
          try {
            await coll.createIndex({ email: 1 }, { name: 'email_partial_unique', unique: true, partialFilterExpression: { email: { $type: 'string' } } });
            console.log('Ensured partial unique index `email_partial_unique` exists on email');
          } catch (err) {
            console.warn('Failed to ensure partial unique email index:', err && err.message ? err.message : err);
          }
          // Also ensure username unique index handles nulls
          try {
            const usernameIndexes = indexes.filter((idx) => {
              try { return Object.prototype.hasOwnProperty.call(idx.key || {}, 'username'); } catch (e) { return false; }
            });

            for (const idx of usernameIndexes) {
              if (idx.unique && !idx.partialFilterExpression && !idx.sparse) {
                try {
                  console.warn(`Dropping problematic username index: ${idx.name}`);
                  await coll.dropIndex(idx.name);
                } catch (err) {
                  console.warn(`Failed to drop index ${idx.name}:`, err && err.message ? err.message : err);
                }
              }
            }

            await coll.createIndex({ username: 1 }, { name: 'username_partial_unique', unique: true, partialFilterExpression: { username: { $type: 'string' } } });
            console.log('Ensured partial unique index `username_partial_unique` exists on username');
          } catch (err) {
            console.warn('Failed to ensure partial unique username index:', err && err.message ? err.message : err);
          }
        } catch (err) {
          console.warn('Email index fix skipped or failed:', err && err.message ? err.message : err);
        }
      }
    // connected successfully
    return;
  } catch (err) {
    // If connection failed, attempt a resilient in-memory server so app still runs
    console.error('MongoDB connection failed. Falling back to in-memory server. Error:', err && err.message ? err.message : err);
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('MongoDB Memory Server connected');
      return;
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB also:', memErr && memErr.message ? memErr.message : memErr);
      throw memErr;
    }
  }
}

connectDB().then(() => {
  (async () => {
    try {
      // Auto-seed if enabled or if in-memory database is empty
      try {
        const { ensureSeed } = require('./seed/seedProductsSafe');
        await ensureSeed(50);
      } catch (seedErr) {
        console.warn('Seeding step failed or not available:', seedErr && seedErr.message ? seedErr.message : seedErr);
      }

      // Create or update admin user
      try {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminKey = 'GLIMMR-ADMIN-DEFAULT';
        const hashedAdminKey = await bcrypt.hash(adminKey, 10);
        const existingAdmin = await User.findOneAndUpdate(
          { email: 'glimmr05@gmail.com' },
          {
            name: 'Admin User',
            email: 'glimmr05@gmail.com',
            password: hashedPassword,
            phone: '9999999999',
            role: 'admin',
            adminKey: hashedAdminKey,
            addresses: []
          },
          { upsert: true, new: true }
        );
        console.log('Admin user ensured successfully');
        console.log('Admin Email: glimmr05@gmail.com');
        console.log('Admin Password: admin123');
        console.log('Admin Key: GLIMMR-ADMIN-DEFAULT');
      } catch (adminErr) {
        console.warn('Admin user creation/update failed:', adminErr && adminErr.message ? adminErr.message : adminErr);
      }
    } catch (err) {
      console.warn('Post-connect tasks failed:', err && err.message ? err.message : err);
    }
  })();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/custom-orders', customOrderRoutes);

// Root endpoint - Useful for Render and deployment platforms
app.get('/', (req, res) => {
  res.json({ 
    message: 'Glimmr API Server', 
    status: 'running',
    version: '1.0.0',
    baseUrl: 'https://glimmr-jewellry-e-commerce-platform-5.onrender.com/api',
    documentation: 'See /api/docs or API_ENDPOINTS_DOCUMENTATION.md',
    endpoints: {
      health: {
        url: '/api/health',
        method: 'GET',
        description: 'Health check endpoint'
      },
      auth: {
        url: '/api/auth',
        methods: ['POST'],
        endpoints: [
          'POST /auth/signup - Register new user',
          'POST /auth/login - Email/password login',
          'POST /auth/request-otp-login - Request OTP',
          'POST /auth/verify-otp-login - Verify OTP',
          'POST /auth/logout - Logout user',
          'POST /auth/verify-email - Verify email',
          'POST /auth/admin-login - Admin login'
        ]
      },
      user: {
        url: '/api/user',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        endpoints: [
          'GET /user/profile - Get user profile',
          'PUT /user/profile - Update profile',
          'GET /user/addresses - Get addresses',
          'POST /user/addresses - Add address',
          'PUT /user/addresses/:id - Update address',
          'DELETE /user/addresses/:id - Delete address',
          'GET /user/wishlist - Get wishlist',
          'POST /user/wishlist - Add to wishlist',
          'DELETE /user/wishlist/:id - Remove from wishlist'
        ]
      },
      products: {
        url: '/api/products',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        endpoints: [
          'GET /products - List all products',
          'GET /products?category=Gold - Filter by category',
          'GET /products/:id - Get product details',
          'POST /products - Create product (admin)',
          'PUT /products/:id - Update product (admin)',
          'DELETE /products/:id - Delete product (admin)'
        ]
      },
      cart: {
        url: '/api/cart',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        endpoints: [
          'GET /cart/:cartId - Get cart',
          'POST /cart/:cartId/add - Add item',
          'PUT /cart/:cartId/update - Update item',
          'DELETE /cart/:cartId/remove - Remove item',
          'DELETE /cart/:cartId/clear - Clear cart'
        ]
      },
      orders: {
        url: '/api/orders',
        methods: ['GET', 'POST', 'PUT'],
        endpoints: [
          'GET /orders - List orders',
          'POST /orders - Create order',
          'GET /orders/:id - Get order',
          'PUT /orders/:id - Update order',
          'POST /orders/:id/cancel - Cancel order'
        ]
      },
      prices: {
        url: '/api/prices',
        methods: ['GET'],
        endpoints: [
          'GET /prices/gold-price - Current gold price',
          'GET /prices/diamond-pricing - Diamond pricing',
          'GET /prices/silver-price - Silver price'
        ]
      },
      recommend: {
        url: '/api/recommend',
        methods: ['GET'],
        endpoints: [
          'GET /recommend - Get recommendations',
          'GET /recommend/similar/:id - Similar products',
          'GET /recommend/trending - Trending products'
        ]
      },
      admin: {
        url: '/api/admin',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        endpoints: [
          'GET /admin/users - List users',
          'GET /admin/dashboard - Dashboard stats',
          'GET /admin/orders - All orders',
          'GET /admin/products - All products'
        ],
        auth: 'Requires admin token'
      }
    },
    features: {
      authentication: ['Email/Password', 'OTP Login', 'Firebase', 'Admin'],
      otp: {
        email: 'Gmail SMTP',
        phone: 'Fast2SMS',
        expiry: '10 minutes',
        maxAttempts: 5
      },
      database: 'MongoDB',
      storage: 'Local + Cloud',
      realTimeUpdates: 'Prices updated hourly',
      keepAlive: {
        enabled: process.env.NODE_ENV === 'production',
        interval: '14 minutes',
        purpose: 'Prevent Render free tier spindown'
      }
    },
    deployed: {
      frontend: 'https://glimmr-jewellry-e-commerce-platform.vercel.app',
      backend: 'https://glimmr-jewellry-e-commerce-platform-5.onrender.com',
      database: 'MongoDB Atlas',
      status: '✅ All systems operational'
    }
  });
});

// Health endpoint
app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// Catch-all route for undefined routes - must be before error handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: '/api/auth, /api/products, /api/cart, /api/orders, /api/user, /api/admin, /api/recommend, /api/prices'
  });
});

// Generic error handler (returns JSON) — helps avoid HTML error pages breaking API clients
app.use((err, req, res, next) => {
  console.error('Unhandled Express error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start the server via a native http server so we can handle EADDRINUSE gracefully
const http = require('http');

async function startServer(preferredPort) {
  let port = Number(preferredPort) || 5002;
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const server = http.createServer(app);

        server.on('error', (err) => {
          reject(err);
        });

        server.on('listening', () => {
          app.locals.server = server;
          console.log(`Server running on port ${port}`);
          
          // Start keep-alive service to prevent Render free tier from spinning down
          if (process.env.NODE_ENV === 'production') {
            console.log('[SERVER] Starting keep-alive service for production...');
            startKeepAlive();
          } else {
            console.log('[SERVER] Keep-alive service disabled in development');
          }
          
          resolve();
        });

        // Listen on all interfaces (IPv4 and IPv6)
        server.listen(port, '0.0.0.0');
      });
      // started successfully
      return;
    } catch (err) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, attempting port ${port + 1}...`);
        port = port + 1;
        continue;
      }
      console.error('Failed to start server:', err && err.message ? err.message : err);
      process.exit(1);
    }
  }

  console.error(`Unable to bind to a free port after ${maxAttempts} attempts. Exiting.`);
  process.exit(1);
}

// Global handlers to avoid uncaught exceptions taking down nodemon without logs
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason && reason.stack ? reason.stack : reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

startServer(PORT);

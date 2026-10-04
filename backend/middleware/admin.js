const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isBlacklisted } = require('./tokenBlacklist');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const extractUserFromToken = async (req) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', status: 401 };
  }

  const token = auth.split(' ')[1];
  if (isBlacklisted(token)) {
    return { error: 'Token revoked or invalidated', status: 401 };
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (verifyErr) {
    return { error: 'Invalid or expired token', status: 401 };
  }

  const userId = payload.id || payload._id || payload.userId;
  const user = await User.findById(userId);
  if (!user) {
    return { error: 'User account not found', status: 404 };
  }

  return { user };
};

// Super-admin only
const adminAuth = async (req, res, next) => {
  try {
    const result = await extractUserFromToken(req);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    if (result.user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrative clearance required' });
    }

    req.user = result.user;
    next();
  } catch (err) {
    console.error('[SECURITY] Admin auth verification error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Manager or Super-admin
const managerOrAdminAuth = async (req, res, next) => {
  try {
    const result = await extractUserFromToken(req);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    if (result.user.role !== 'admin' && result.user.role !== 'manager') {
      return res.status(403).json({ error: 'Managerial or administrative clearance required' });
    }

    req.user = result.user;
    next();
  } catch (err) {
    console.error('[SECURITY] Manager auth verification error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Staff level: Cashier, Manager, or Super-admin
const staffAuth = async (req, res, next) => {
  try {
    const result = await extractUserFromToken(req);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    const allowedRoles = ['admin', 'manager', 'cashier'];
    if (!allowedRoles.includes(result.user.role)) {
      return res.status(403).json({ error: 'Authorized showroom staff clearance required' });
    }

    req.user = result.user;
    next();
  } catch (err) {
    console.error('[SECURITY] Staff auth verification error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

adminAuth.adminAuth = adminAuth;
adminAuth.managerOrAdminAuth = managerOrAdminAuth;
adminAuth.staffAuth = staffAuth;

module.exports = adminAuth;


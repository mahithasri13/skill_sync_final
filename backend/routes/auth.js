const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const signToken = (id) => {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    console.log('📝 REGISTERING:', req.body.email);
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }

    // Create user (trim password to avoid accidental whitespace mismatches)
      const user = await User.create({ 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        password: typeof password === 'string' ? password.trim() : password, 
        role 
      });

      // NOTE: We store passwords as plain text in this simplified setup per request.
      // In production you should ALWAYS hash passwords.

    console.log('✅ USER CREATED:', user.email);
  console.log('🔍 Stored password for new user (DEBUG):', user.password);
    
    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: { 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          profile: user.profile 
        } 
      }
    });
  } catch (error) {
    console.error('❌ REGISTER ERROR:', error);
    res.status(400).json({ message: error.message });
  }
});

// LOGIN - Enhanced with detailed debugging
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 LOGIN ATTEMPT - Full request body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ 
        message: 'Please provide both email and password',
        received: { email: !!email, password: !!password }
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    console.log('👤 USER SEARCH RESULT:', user ? 'User found' : 'NO USER FOUND');
    
    if (!user) {
      console.log('❌ No user with email:', email);
      return res.status(401).json({ 
        message: 'No user found with this email',
        email: email 
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      console.log('❌ User account is deactivated:', user.email);
      return res.status(401).json({ 
        message: 'Your account has been deactivated' 
      });
    }

    // Check password using model helper (now plain-text comparison)
    console.log('🔑 Checking password...');
    let isPasswordCorrect = false;
    try {
      const submitted = typeof password === 'string' ? password.trim() : password;
      const stored = typeof user.password === 'string' ? user.password.trim() : user.password;
      console.log('🔎 Submitted password (trimmed):', submitted);
      console.log('🔎 Stored password (trimmed):', stored);
      console.log('🔎 Types - submitted:', typeof submitted, ', stored:', typeof stored);
      console.log('🔎 Direct equality check:', submitted === stored);

      try {
        // Use model helper but pass trimmed value
        isPasswordCorrect = await user.correctPassword(submitted);
      } catch (err) {
        console.warn('Error in user.correctPassword():', err.message || err);
        isPasswordCorrect = false;
      }

      console.log('🔑 PASSWORD CHECK RESULT (after helper):', isPasswordCorrect);

      // Fallback: if helper failed but trimmed strings match, accept
      if (!isPasswordCorrect && submitted === stored) {
        console.log('🔁 Fallback direct match succeeded');
        isPasswordCorrect = true;
      }

      if (!isPasswordCorrect) {
        console.log('❌ Incorrect password for user:', user.email);
        return res.status(401).json({ message: 'Incorrect password' });
      }
    } catch (e) {
      console.warn('Password compare/logging failed:', e.message || e);
      return res.status(500).json({ message: 'Server error during password check' });
    }

    // Generate token
    const token = signToken(user._id);
    console.log('🎉 LOGIN SUCCESSFUL:', user.email);
    console.log('✅ TOKEN GENERATED');

    res.json({
      status: 'success',
      token,
      data: { 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          profile: user.profile 
        } 
      }
    });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Internal server error during login',
      error: error.message 
    });
  }
});

// VERIFY TOKEN
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;

// DEBUG: temporary endpoint to inspect a user's stored values for troubleshooting.
// Remove this in production.
router.get('/debug-user', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: 'email query param required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Return limited fields useful for debugging
    return res.json({
      email: user.email,
      storedPassword: user.password,
      isActive: user.isActive,
      id: user._id
    });
  } catch (error) {
    console.error('DEBUG endpoint error', error);
    res.status(500).json({ message: 'Server error' });
  }
});
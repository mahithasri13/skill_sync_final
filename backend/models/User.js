const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    set: v => (v === undefined || v === null) ? v : String(v).trim()
  },
  role: { 
    type: String, 
    enum: ['student', 'tutor'], 
    required: true 
  },
  profile: {
    bio: String,
    subjects: [String],
    education: String,
    experience: String,
    hourlyRate: { type: Number, default: 300 },
    availability: [{
      day: String,
      slots: [String]
    }],
    expertiseLevel: { 
      type: String, 
      enum: ['Beginner', 'Intermediate', 'Expert'], 
      default: 'Intermediate' 
    },
    languages: [String],
    teachingStyle: String,
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  avatar: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// NOTE: Passwords are stored in plain text in this simplified setup per request.
// This is insecure for production. Use hashing in real deployments.
// Check password method (plain text comparison)
// Compare passwords as trimmed strings to avoid mismatches from types/whitespace
userSchema.methods.correctPassword = function(candidatePassword) {
  try {
    const stored = (this.password === undefined || this.password === null) ? '' : String(this.password).trim();
    const candidate = (candidatePassword === undefined || candidatePassword === null) ? '' : String(candidatePassword).trim();
    return candidate === stored;
  } catch (e) {
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);
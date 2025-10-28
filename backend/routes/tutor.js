const express = require('express');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');
const router = express.Router();

// Get all tutors with filtering
router.get('/search', auth, async (req, res) => {
  try {
    const { subject, minRate, maxRate, expertise } = req.query;
    
    let filter = { role: 'tutor' };
    
    if (subject) {
      filter['profile.subjects'] = { $in: [new RegExp(subject, 'i')] };
    }
    
    if (minRate || maxRate) {
      filter['profile.hourlyRate'] = {};
      if (minRate) filter['profile.hourlyRate'].$gte = parseInt(minRate);
      if (maxRate) filter['profile.hourlyRate'].$lte = parseInt(maxRate);
    }
    
    if (expertise) {
      filter['profile.expertiseLevel'] = expertise;
    }
    
    const tutors = await User.find(filter)
      .select('name email profile avatar')
      .sort({ 'profile.rating': -1 });
    
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/scheduled-classes', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ tutor: req.user.id })
      .populate('student', 'name email avatar')
      .sort({ scheduledDate: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/booking/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, tutor: req.user.id },
      { status },
      { new: true }
    ).populate('student', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { bio, subjects, education, experience, hourlyRate, availability, expertiseLevel, languages, teachingStyle } = req.body;
    
    const tutor = await User.findByIdAndUpdate(
      req.user.id,
      { 
        profile: { 
          bio, 
          subjects, 
          education, 
          experience, 
          hourlyRate, 
          availability,
          expertiseLevel,
          languages,
          teachingStyle
        } 
      },
      { new: true }
    ).select('name email profile avatar');

    res.json(tutor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
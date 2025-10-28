const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const router = express.Router();
const Review = require('../models/Review');

router.get('/tutors', auth, async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor' }).select('name email profile avatar');
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/book-tutor', auth, async (req, res) => {
  try {
    const { tutorId, course, scheduledDate, startTime, duration, notes } = req.body;
    
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    const price = (tutor.profile.hourlyRate || 300) * (duration / 60);

    const booking = await Booking.create({
      student: req.user.id,
      tutor: tutorId,
      course,
      scheduledDate: new Date(scheduledDate),
      startTime,
      duration,
      notes,
      price
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('tutor', 'name profile avatar')
      .populate('student', 'name');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user.id })
      .populate('tutor', 'name profile avatar')
      .sort({ scheduledDate: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a review for a tutor (student only)
router.post('/review', auth, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId || !rating) return res.status(400).json({ message: 'bookingId and rating required' });

    const booking = await Booking.findById(bookingId).populate('tutor');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.student) !== String(req.user.id)) return res.status(403).json({ message: 'Not your booking' });

    const tutor = booking.tutor;

    const review = await Review.create({
      student: req.user.id,
      tutor: tutor._id,
      booking: booking._id,
      rating,
      comment
    });

    // Update tutor aggregate rating
    const totalBefore = tutor.profile?.totalReviews || 0;
    const avgBefore = tutor.profile?.rating || 0;
    const totalAfter = totalBefore + 1;
    const newAvg = totalAfter === 0 ? rating : ((avgBefore * totalBefore) + Number(rating)) / totalAfter;

    tutor.profile = tutor.profile || {};
    tutor.profile.totalReviews = totalAfter;
    tutor.profile.rating = Math.round(newAvg * 10) / 10;
    await tutor.save();

    res.status(201).json({ review });
  } catch (error) {
    console.error('Error posting review:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET reviews for a tutor (public)
router.get('/tutor/:tutorId/reviews', async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    const reviews = await Review.find({ tutor: tutorId }).populate('student', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
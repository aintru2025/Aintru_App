const express = require('express');
const router = express.Router();
const Waitlist = require('../models/waitlist');

// Join waitlist
router.post('/join', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validate input
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and phone number are required'
      });
    }

    // Check if user already exists in waitlist
    const existingUser = await Waitlist.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'You are already on our waitlist!'
      });
    }

    // Create new waitlist entry
    const waitlistEntry = new Waitlist({
      name,
      email,
      phone
    });

    await waitlistEntry.save();

    res.status(201).json({
      success: true,
      message: 'Successfully joined waitlist',
      data: {
        name: waitlistEntry.name,
        email: waitlistEntry.email,
        joinedAt: waitlistEntry.joinedAt
      }
    });

  } catch (error) {
    console.error('Waitlist join error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already on our waitlist!'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to join waitlist. Please try again.'
    });
  }
});

// Get waitlist stats (admin only)
router.get('/stats', async (req, res) => {
  try {
    const totalCount = await Waitlist.countDocuments();
    const waitingCount = await Waitlist.countDocuments({ status: 'waiting' });
    const contactedCount = await Waitlist.countDocuments({ status: 'contacted' });
    const convertedCount = await Waitlist.countDocuments({ status: 'converted' });

    res.json({
      success: true,
      data: {
        total: totalCount,
        waiting: waitingCount,
        contacted: contactedCount,
        converted: convertedCount
      }
    });
  } catch (error) {
    console.error('Waitlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get waitlist stats'
    });
  }
});

module.exports = router;

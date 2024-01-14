const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const router = express.Router();

const User = require('../models/users');

/**
 * @route GET /api/v1/auth/users/:id
 * @desc Get logged in data
 * @access private
 */
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.id).select('-password');
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      msg: 'Server error',
    });
  }
});



module.exports = router;

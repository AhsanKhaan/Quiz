const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const router = express.Router();

const User = require('../models/users');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and profile retrieval
 */

/**
 * @swagger
 * /api/v1/auth/users:
 *   get:
 *     summary: Get logged-in user data
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               _id: '603ddca3fd6e1d396055bee0'
 *               name: 'John Doe'
 *               email: 'john@example.com'
 *               createdAt: '2022-02-01T10:00:00.000Z'
 *               updatedAt: '2022-02-01T12:00:00.000Z'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/users', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      msg: 'Server error',
    });
  }
});



module.exports = router;

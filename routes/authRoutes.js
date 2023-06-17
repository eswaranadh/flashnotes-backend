const express = require('express');
const { auth } = require('../utils/auth');
const { validateSignUpData, validateLoginData } = require('../utils/validators');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

// User Signup
router.post('/signup', validateSignUpData, signup);

// User Login
router.post('/login', validateLoginData, login);

// Get User Details
router.get('/user', auth, (req, res) => {
  return res.status(200).json({
    id: req.user.uid,
    email: req.user.email,
    handle: req.user.handle,
  });
});

module.exports = router;

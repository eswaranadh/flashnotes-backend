const { body, param, validationResult } = require('express-validator');

const validateSignUpData = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password')
    .notEmpty().withMessage('Password cannot be empty')
    .isLength({ min: 6 }).withMessage('Password must have at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords must match');
    }
    return true;
  }),
  body('handle').notEmpty().withMessage('Handle cannot be empty'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateLoginData = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate user authentication credentials
const validateAuthCredentials = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate note creation/update request
const validateNote = [
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate flashcard creation/update request
const validateFlashcard = [
  body('front').notEmpty().withMessage('Front is required'),
  body('back').notEmpty().withMessage('Back is required'),
  body('deckId').notEmpty().withMessage('deckId is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate flashcard creation/update request
const validateUpdateFlashcard = [
  body('front').notEmpty().withMessage('Front is required'),
  body('back').notEmpty().withMessage('Back is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate deck creation/update request
const validateDeck = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate studySet creation/update request
const validateStudySet = [
  body('title').notEmpty().withMessage('Title is required'),
  body('decks')
    .isArray().withMessage('Decks must be an array with at least one element')
    .notEmpty().withMessage('Decks array cannot be empty'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateSignUpData,
  validateLoginData,
  validateAuthCredentials,
  validateNote,
  validateFlashcard,
  validateDeck,
  validateStudySet,
  validateUpdateFlashcard
};

const { admin } = require('../utils/admin');
const Constants = require('../utils/constants');

// Sign up a new user
exports.signup = async (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  try {
    // Create new user
    const docRef = admin.firestore().collection(Constants.USERS).doc(newUser.handle);
    const doc = await docRef.get();
    if (doc.exists) {
      return res.status(400).json({ handle: 'This handle is already taken' });
    }
    const userRecord = await admin.auth().createUser({
      email: newUser.email,
      password: newUser.password,
    });
    const user = {
      handle: newUser.handle,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      userId: userRecord.uid,
    };
    await docRef.set(user);

    // Generate auth token
    const token = await admin.auth().createCustomToken(userRecord.uid);

    // Return response
    return res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ email: 'Email is already in use' });
    }
    return res.status(500).json({ error: error.code });
  }
};

// Log in an existing user
exports.login = async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    // Authenticate user
    const userRecord = await admin.auth().getUserByEmail(user.email);
    const token = await admin.auth().createCustomToken(userRecord.uid);

    // Return response
    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res.status(403).json({ general: 'Wrong credentials, please try again' });
  }
};

// Get user information
exports.getUser = async (req, res) => {
  try {
    const docRef = admin.firestore().collection(Constants.USERS).doc(req.user.handle);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = doc.data();
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.code });
  }
};

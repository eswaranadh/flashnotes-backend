const Email = require('../services/email');
const Notifications = require('../services/notifications');
const { admin } = require('../utils/admin');
const Constants = require('../utils/constants');
const { defaultUserPreferences } = require('../utils/helpers');

// Sign up a new user
exports.signup = async (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
  };

  try {

    try {
      // check already existing user
      const authUser = await admin.auth().getUserByEmail(newUser.email)
      if (authUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        console.error(error);
        return res.status(500).json({ error: error.code, message: 'Failed to sign up' });
      }
    }

    // Create new user

    const userRecord = await admin.auth().createUser({
      email: newUser.email,
      password: newUser.password,
    });

    const docRef = admin.firestore().collection(Constants.USERS).doc(userRecord.uid);

    // create default preferences
    const defaultPreferences = defaultUserPreferences()
    await docRef.collection(Constants.PREFERENCES).doc(Constants.STUDY_PREFERENCES).set({
      ...defaultPreferences.studyPreferences,
      userId: userRecord.uid
    });
    await docRef.collection(Constants.PREFERENCES).doc(Constants.NOTIFICATION_PREFERENCES).set({
      ...defaultPreferences.notificationPreferences,
      userId: userRecord.uid
    });

    const user = {
      email: newUser.email,
      phone: '',
      name: '',
      address: {
        line1: '',
        line2: '',
        country: '',
        city: '',
        state: '',
        zip: ''
      },
      about: '',
      createdAt: new Date().toISOString(),
      userId: userRecord.uid,
      id: userRecord.uid,
    };
    await docRef.set(user);

    // Generate auth token
    const token = await admin.auth().createCustomToken(userRecord.uid);

    // Return response
    await Notifications.sendWelcomeEmail(user);
    return res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    return res.status(500).json({ error: error.code, message: 'Failed to sign up' });
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
    return res.status(403).json({ message: 'Wrong credentials, please try again' });
  }
};

// Get user information
exports.getUser = async (req, res) => {
  try {
    const docRef = admin.firestore().collection(Constants.USERS).doc(req.user.handle);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = doc.data();
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.code, message: 'Something went wrong' });
  }
};


// forgot password
exports.forgotPassword = async (req, res) => {
  const email = req.body.email;

  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    await Email.send({
      to: [email],
      subject: 'Reset Password',
      text: `Please click on the link to reset your password: ${resetLink}`
    })
    return res.status(200).json({ message: 'Password reset link sent to your email' });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.code, message: 'Something went wrong' });
  }
}
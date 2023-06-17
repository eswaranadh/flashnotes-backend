const { admin } = require('./admin');

/**
 * Verify the Firebase ID token passed in the Authorization HTTP header.
 * If the token is valid, add the decoded token to the request object and call next().
 * If the token is invalid, send a 401 Unauthorized response.
 */
const auth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const idToken = authorization.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    return next();
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = { auth };

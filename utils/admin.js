const { initializeApp } = require('firebase-admin/app');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../config/serviceAccountKey.json');

initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };

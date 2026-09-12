const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const fs = require('fs');
const config = require('./env');

let serviceAccount;
const keyPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(keyPath)) {
  serviceAccount = require(keyPath);
} else if (process.env.FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
}

if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket: config.firebaseStorageBucket,
    });
  } else {
    // Default initialization (e.g. Google Cloud Environment / Firebase Hosting emulator)
    initializeApp({
      storageBucket: config.firebaseStorageBucket,
    });
  }
}

const db = getFirestore();
const bucket = getStorage().bucket();

module.exports = { db, bucket };

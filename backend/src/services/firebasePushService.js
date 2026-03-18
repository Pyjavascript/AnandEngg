const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

let firebaseApp = null;
let missingConfigLogged = false;
const backendRoot = path.resolve(__dirname, '../..');

function logMissingConfigOnce() {
  if (missingConfigLogged) return;
  missingConfigLogged = true;
  console.log(
    'Push notifications are disabled: set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.',
  );
}

function getServiceAccount() {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineJson) {
    try {
      return JSON.parse(inlineJson);
    } catch (err) {
      console.log('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err.message);
      return null;
    }
  }

  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (accountPath) {
    try {
      const resolvedPath = path.isAbsolute(accountPath)
        ? accountPath
        : path.resolve(backendRoot, accountPath);
      return JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    } catch (err) {
      console.log('Failed to load FIREBASE_SERVICE_ACCOUNT_PATH:', err.message);
      return null;
    }
  }

  return null;
}

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;
  if (admin.apps.length > 0) {
    firebaseApp = admin.app();
    return firebaseApp;
  }

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    logMissingConfigOnce();
    return null;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
  });
  return firebaseApp;
}

function stringifyData(data = {}) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value == null) return acc;
    acc[key] = String(value);
    return acc;
  }, {});
}

exports.sendMulticast = async ({
  tokens,
  title,
  message,
  data = {},
}) => {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, responses: [] };
  }

  const app = getFirebaseApp();
  if (!app) {
    return { successCount: 0, failureCount: 0, responses: [] };
  }

  return admin.messaging(app).sendEachForMulticast({
    tokens,
    notification: {
      title,
      body: message,
    },
    data: stringifyData(data),
    android: {
      priority: 'high',
      notification: {
        channelId: 'workflow-alerts',
        sound: 'default',
        priority: 'high',
        defaultSound: true,
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
  });
};

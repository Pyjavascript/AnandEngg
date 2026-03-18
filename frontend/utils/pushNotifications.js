import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import BASE_URL from '../config/api';

const PUSH_TOKEN_STORAGE_KEY = 'push_notification_token';
const API = `${BASE_URL}/api/report/push-token`;

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem('token');
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

async function requestAndroidNotificationPermission() {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function ensureNotificationPermission() {
  const androidAllowed = await requestAndroidNotificationPermission();
  if (!androidAllowed) return false;

  try {
    await messaging().registerDeviceForRemoteMessages();
  } catch {
    // Already registered on some devices/builds.
  }

  try {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return Platform.OS === 'android';
  }
}

function navigateToReportFromMessage(navigationRef, remoteMessage) {
  const submissionId = remoteMessage?.data?.relatedSubmissionId;
  if (!submissionId || !navigationRef?.isReady?.()) return;

  navigationRef.navigate('ReportDetail', {
    reportId: Number(submissionId),
  });
}

export async function syncPushTokenIfAuthenticated() {
  const headers = await getAuthHeaders();
  if (!headers) return null;

  const permissionGranted = await ensureNotificationPermission();
  if (!permissionGranted) return null;

  const fcmToken = await messaging().getToken();
  if (!fcmToken) return null;

  const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
  if (storedToken === fcmToken) return fcmToken;

  await axios.post(
    API,
    {
      token: fcmToken,
      platform: Platform.OS,
    },
    { headers },
  );
  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, fcmToken);
  return fcmToken;
}

export async function unregisterPushToken() {
  const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
  const headers = await getAuthHeaders();

  if (storedToken && headers) {
    try {
      await axios.delete(API, {
        headers,
        data: { token: storedToken },
      });
    } catch (err) {
      console.log('Failed to remove push token from backend', err?.message || err);
    }
  }

  await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
}

export function attachPushNotificationListeners(navigationRef) {
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async nextToken => {
    const headers = await getAuthHeaders();
    if (!headers || !nextToken) return;

    try {
      await axios.post(
        API,
        {
          token: nextToken,
          platform: Platform.OS,
        },
        { headers },
      );
      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, nextToken);
    } catch (err) {
      console.log('Failed to refresh push token', err?.message || err);
    }
  });

  const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
    navigateToReportFromMessage(navigationRef, remoteMessage);
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        navigateToReportFromMessage(navigationRef, remoteMessage);
      }
    })
    .catch(err => {
      console.log('Initial notification read failed', err?.message || err);
    });

  return () => {
    unsubscribeTokenRefresh();
    unsubscribeOpened();
  };
}

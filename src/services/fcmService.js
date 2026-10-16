import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp, vapidKey } from './firebaseConfig';

const NOTIFICATION_HISTORY_KEY = '@bonus6_fcm_history_v1';

// Cấu hình hiển thị thông báo khi ứng dụng đang mở (Foreground)
if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err) {
    console.warn('NotificationHandler setup warning:', err);
  }
}

let webListeners = [];

export const registerForFcmNotificationsAsync = async () => {
  let permissionStatus = 'undetermined';
  let fcmToken = '';
  let expoPushToken = '';
  let statusNote = '';

  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        permissionStatus = window.Notification.permission;
        if (permissionStatus === 'default') {
          permissionStatus = await window.Notification.requestPermission();
        }
      }

      if (permissionStatus !== 'granted') {
        return {
          permissionStatus,
          fcmToken: '',
          expoPushToken: '',
          platform: 'web',
          statusNote: 'Chưa cấp quyền thông báo trên trình duyệt.',
        };
      }

      try {
        const messagingModule = await import('firebase/messaging');
        const supported = await messagingModule.isSupported();
        if (supported && firebaseApp) {
          const messaging = messagingModule.getMessaging(firebaseApp);
          let swReg = undefined;
          if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            try {
              swReg = await navigator.serviceWorker.register(
                '/firebase-messaging-sw.js'
              );
            } catch (_) {}
          }
          const tokenOptions = {};
          if (vapidKey) tokenOptions.vapidKey = vapidKey;
          if (swReg) tokenOptions.serviceWorkerRegistration = swReg;

          const webToken = await messagingModule.getToken(
            messaging,
            Object.keys(tokenOptions).length > 0 ? tokenOptions : undefined
          );
          if (webToken) {
            fcmToken = webToken;
            statusNote =
              'Đã kết nối và nhận FCM Registration Token từ Firebase Cloud Messaging.';
          }
        }
      } catch (webFcmErr) {
        statusNote = `Thông báo trình duyệt đã bật (${
          webFcmErr?.message || 'Cần HTTPS/Service Worker để lấy FCM Web Token'
        }).`;
      }

      return {
        permissionStatus,
        fcmToken,
        expoPushToken: '',
        platform: 'web',
        statusNote,
      };
    }

    // Thiết lập Notification Channel cho Android (bắt buộc với Android 8.0+ để nhận FCM)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default FCM Channel',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync(
        'fcm_fallback_notification_channel',
        {
          name: 'Firebase Cloud Messaging',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4F46E5',
          sound: 'default',
        }
      );
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    permissionStatus = finalStatus;

    if (finalStatus !== 'granted') {
      return {
        permissionStatus,
        fcmToken: '',
        expoPushToken: '',
        platform: Platform.OS,
        statusNote: 'Chưa được cấp quyền hiển thị Push Notification trên thiết bị.',
      };
    }

    // 1. Lấy Native Device Push Token (FCM Token trên Android / APNs trên iOS)
    try {
      const deviceTokenRes = await Notifications.getDevicePushTokenAsync();
      if (deviceTokenRes?.data) {
        fcmToken = String(deviceTokenRes.data);
      }
    } catch (deviceTokenErr) {
      console.log('Device FCM token error:', deviceTokenErr?.message);
    }

    // 2. Lấy Expo Push Token
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      const expoTokenRes = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();
      if (expoTokenRes?.data) {
        expoPushToken = String(expoTokenRes.data);
      }
    } catch (expoTokenErr) {
      console.log('Expo Push token error:', expoTokenErr?.message);
    }

    statusNote = fcmToken
      ? 'Đã lấy Native FCM Device Token thành công.'
      : expoPushToken
      ? 'Đã lấy Expo Push Token thành công.'
      : 'Đã bật quyền thông báo trên thiết bị.';

    return {
      permissionStatus,
      fcmToken,
      expoPushToken,
      platform: Platform.OS,
      statusNote,
    };
  } catch (error) {
    console.warn('registerForFcmNotificationsAsync error:', error);
    return {
      permissionStatus: 'error',
      fcmToken: '',
      expoPushToken: '',
      platform: Platform.OS,
      statusNote: error?.message || 'Không thể khởi tạo dịch vụ thông báo.',
    };
  }
};

export const loadNotificationHistory = async () => {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

export const appendNotificationHistory = async (item) => {
  try {
    const existing = await loadNotificationHistory();
    const updated = [item, ...existing].slice(0, 30);
    await AsyncStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (_) {
    return [item];
  }
};

export const clearNotificationHistory = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATION_HISTORY_KEY);
  } catch (_) {}
  return [];
};

export const setupFcmNotificationListeners = ({
  onNotificationReceived,
  onNotificationTapped,
}) => {
  let receivedSub = null;
  let responseSub = null;
  let webUnsubscribe = null;

  const normalizeNotification = (rawNotif, sourceType) => {
    const content = rawNotif?.request?.content || rawNotif || {};
    return {
      id:
        rawNotif?.request?.identifier ||
        'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      title: content.title || 'Thông báo FCM',
      body: content.body || '',
      data: content.data || {},
      source: sourceType,
      receivedAt: new Date().toISOString(),
    };
  };

  if (Platform.OS !== 'web') {
    receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        const formatted = normalizeNotification(notification, 'Foreground FCM');
        if (onNotificationReceived) onNotificationReceived(formatted);
      }
    );

    responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const formatted = normalizeNotification(
          response?.notification,
          'Tapped Notification'
        );
        if (onNotificationTapped) onNotificationTapped(formatted);
      }
    );

    if (typeof Notifications.getLastNotificationResponseAsync === 'function') {
      Notifications.getLastNotificationResponseAsync()
        .then((lastResponse) => {
          if (lastResponse?.notification) {
            const formatted = normalizeNotification(
              lastResponse.notification,
              'Opened from Background'
            );
            if (onNotificationTapped) onNotificationTapped(formatted);
          }
        })
        .catch(() => {});
    }
  } else {
    const webHandler = (payload, isTap = false) => {
      const formatted = normalizeNotification(
        payload,
        isTap ? 'Tapped Web Notification' : 'Foreground Web FCM'
      );
      if (isTap && onNotificationTapped) {
        onNotificationTapped(formatted);
      } else if (onNotificationReceived) {
        onNotificationReceived(formatted);
      }
    };
    webListeners.push(webHandler);

    if (firebaseApp) {
      import('firebase/messaging')
        .then(async (messagingModule) => {
          const supported = await messagingModule.isSupported();
          if (supported) {
            const messaging = messagingModule.getMessaging(firebaseApp);
            webUnsubscribe = messagingModule.onMessage(messaging, (payload) => {
              const notifTitle =
                payload?.notification?.title || 'Thông báo từ Firebase FCM';
              const notifBody = payload?.notification?.body || '';
              const notifData = payload?.data || {};

              webHandler({
                title: notifTitle,
                body: notifBody,
                data: notifData,
              });

              if (
                typeof window !== 'undefined' &&
                'Notification' in window &&
                window.Notification.permission === 'granted'
              ) {
                try {
                  new window.Notification(notifTitle, {
                    body: notifBody,
                    data: notifData,
                  });
                } catch (_) {}
              }
            });
          }
        })
        .catch(() => {});
    }

    return () => {
      webListeners = webListeners.filter((h) => h !== webHandler);
      if (typeof webUnsubscribe === 'function') webUnsubscribe();
    };
  }

  return () => {
    if (receivedSub && typeof receivedSub.remove === 'function') {
      receivedSub.remove();
    }
    if (responseSub && typeof responseSub.remove === 'function') {
      responseSub.remove();
    }
  };
};

export const triggerPushNotificationAsync = async ({
  title,
  body,
  data = {},
  delaySeconds = 0,
}) => {
  const cleanTitle = String(title || '').trim() || 'Thông báo từ Firebase FCM';
  const cleanBody = String(body || '').trim();

  if (!cleanBody) {
    throw new Error('Vui lòng nhập nội dung thông báo!');
  }

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      throw new Error('Trình duyệt này không hỗ trợ Web Notifications.');
    }

    let permission = window.Notification.permission;
    if (permission === 'default') {
      permission = await window.Notification.requestPermission();
    }
    if (permission !== 'granted') {
      throw new Error('Vui lòng cho phép quyền thông báo trên trình duyệt.');
    }

    const fireWebNotification = () => {
      const payload = {
        title: cleanTitle,
        body: cleanBody,
        data,
      };

      webListeners.forEach((listener) => listener(payload, false));

      try {
        const browserNotif = new window.Notification(cleanTitle, {
          body: cleanBody,
          data,
        });
        browserNotif.onclick = () => {
          window.focus();
          webListeners.forEach((listener) => listener(payload, true));
          browserNotif.close();
        };
      } catch (_) {}
    };

    if (delaySeconds > 0) {
      setTimeout(fireWebNotification, delaySeconds * 1000);
    } else {
      fireWebNotification();
    }
    return;
  }

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    if (requested.status !== 'granted') {
      throw new Error('Vui lòng cấp quyền thông báo trong cài đặt thiết bị.');
    }
  }

  const trigger =
    delaySeconds > 0
      ? {
          type: Notifications.SchedulableTriggerInputTypes
            ? Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
            : 'timeInterval',
          seconds: delaySeconds,
          repeats: false,
        }
      : null;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: cleanTitle,
      body: cleanBody,
      data,
      sound: true,
    },
    trigger,
  });
};

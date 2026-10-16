// Service Worker hỗ trợ nhận Background Push Notification từ Firebase Cloud Messaging (FCM) trên trình duyệt Web
self.addEventListener('push', function (event) {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = {
      notification: {
        title: 'Thông báo từ Firebase FCM',
        body: event.data ? event.data.text() : 'Bạn có thông báo mới.',
      },
    };
  }

  const notification = payload.notification || {};
  const title = notification.title || 'Thông báo từ Firebase FCM';
  const options = {
    body: notification.body || '',
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});


import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {
  initFirebaseServices,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  getFirebaseState,
} from './src/services/firebaseConfig';
import {
  subscribeToUserSession,
  registerUserWithFirebase,
  loginUserWithFirebase,
  logoutUserFromFirebase,
  updateUserProfileWithFirebase,
  syncDeviceTokensToFirebase,
  formatFirebaseError,
} from './src/services/userService';
import {
  registerForFcmNotificationsAsync,
  setupFcmNotificationListeners,
  triggerPushNotificationAsync,
  loadNotificationHistory,
  appendNotificationHistory,
  clearNotificationHistory,
} from './src/services/fcmService';
import AuthScreen from './src/components/AuthScreen';
import ProfileTab from './src/components/ProfileTab';
import FcmTab from './src/components/FcmTab';
import FirebaseConfigModal from './src/components/FirebaseConfigModal';

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [isLiveFirebase, setIsLiveFirebase] = useState(false);
  const [firebaseConfig, setFirebaseConfig] = useState({});
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [fcmInfo, setFcmInfo] = useState({
    permissionStatus: 'undetermined',
    fcmToken: '',
    expoPushToken: '',
    platform: '',
    statusNote: '',
  });
  const [notifications, setNotifications] = useState([]);
  const [latestToast, setLatestToast] = useState(null);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configVersion, setConfigVersion] = useState(0);

  const initFcmAndHistory = useCallback(async (currentUid) => {
    const history = await loadNotificationHistory();
    setNotifications(history);

    const tokenData = await registerForFcmNotificationsAsync();
    setFcmInfo(tokenData);

    if (currentUid && tokenData.fcmToken) {
      await syncDeviceTokensToFirebase(currentUid, tokenData);
    }
  }, []);

  // Khởi tạo Firebase & theo dõi phiên đăng nhập
  useEffect(() => {
    let unsubscribeAuth = null;
    let isMounted = true;

    async function bootstrap() {
      setInitializing(true);
      const state = await initFirebaseServices();
      if (!isMounted) return;

      setIsLiveFirebase(state.isLive);
      setFirebaseConfig(state.config || {});

      unsubscribeAuth = subscribeToUserSession(async (userProfile) => {
        if (!isMounted) return;
        setUser(userProfile);
        setInitializing(false);

        if (userProfile?.uid) {
          await initFcmAndHistory(userProfile.uid);
        }
      });
    }

    bootstrap();

    return () => {
      isMounted = false;
      if (typeof unsubscribeAuth === 'function') {
        unsubscribeAuth();
      }
    };
  }, [configVersion, initFcmAndHistory]);

  // Đăng ký lắng nghe sự kiện nhận Push Notification (Foreground & Background Tap)
  useEffect(() => {
    const cleanupListeners = setupFcmNotificationListeners({
      onNotificationReceived: async (notif) => {
        const updated = await appendNotificationHistory(notif);
        setNotifications(updated);
        setLatestToast({
          title: `🔔 ${notif.title}`,
          body: notif.body,
        });
      },
      onNotificationTapped: async (notif) => {
        const updated = await appendNotificationHistory(notif);
        setNotifications(updated);
        setLatestToast({
          title: `👆 Đã mở từ thông báo: ${notif.title}`,
          body: notif.body,
        });
        setActiveTab('fcm');
      },
    });

    return () => {
      if (typeof cleanupListeners === 'function') {
        cleanupListeners();
      }
    };
  }, [configVersion]);

  // Tự ẩn Toast thông báo sau 5 giây
  useEffect(() => {
    if (!latestToast) return;
    const timer = setTimeout(() => {
      setLatestToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [latestToast]);

  const handleLogin = async (credentials) => {
    try {
      await loginUserWithFirebase(credentials);
    } catch (err) {
      const wrapped = new Error(formatFirebaseError(err));
      wrapped.userMessage = formatFirebaseError(err);
      throw wrapped;
    }
  };

  const handleRegister = async (payload) => {
    try {
      await registerUserWithFirebase(payload);
    } catch (err) {
      const wrapped = new Error(formatFirebaseError(err));
      wrapped.userMessage = formatFirebaseError(err);
      throw wrapped;
    }
  };

  const handleUpdateProfile = async (payload) => {
    try {
      return await updateUserProfileWithFirebase(payload);
    } catch (err) {
      const wrapped = new Error(formatFirebaseError(err));
      wrapped.userMessage = formatFirebaseError(err);
      throw wrapped;
    }
  };

  const handleSendPush = async ({ title, body, data, delaySeconds = 0 }) => {
    await triggerPushNotificationAsync({
      title,
      body,
      data,
      delaySeconds,
    });
  };

  const handleSaveFirebaseConfig = async (newConfig, useSandbox) => {
    await saveCustomFirebaseConfig(newConfig, useSandbox);
    const current = getFirebaseState();
    setIsLiveFirebase(current.isLive);
    setFirebaseConfig(current.config || {});
    setConfigVersion((v) => v + 1);
  };

  const handleResetSandbox = async () => {
    await clearCustomFirebaseConfig();
    const current = getFirebaseState();
    setIsLiveFirebase(current.isLive);
    setFirebaseConfig(current.config || {});
    setConfigVersion((v) => v + 1);
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>
          Đang khởi tạo dịch vụ Firebase Authentication & FCM...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Toast hiển thị khi có Push Notification tới */}
      {latestToast && (
        <Pressable
          style={styles.toastBanner}
          onPress={() => {
            setActiveTab('fcm');
            setLatestToast(null);
          }}>
          <View style={styles.toastTextWrap}>
            <Text style={styles.toastTitle}>{latestToast.title}</Text>
            <Text style={styles.toastBody} numberOfLines={2}>
              {latestToast.body}
            </Text>
          </View>
          <Text style={styles.toastDismiss}>Xem →</Text>
        </Pressable>
      )}

      {!user ? (
        <AuthScreen
          isLiveFirebase={isLiveFirebase}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onOpenConfig={() => setConfigModalVisible(true)}
        />
      ) : (
        <View style={styles.mainWrapper}>
          {/* Thanh điều hướng trên cùng */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Text style={styles.appTitle}>Firebase Manager</Text>
              <View
                style={[
                  styles.modePill,
                  isLiveFirebase ? styles.modePillLive : styles.modePillSandbox,
                ]}>
                <Text
                  style={[
                    styles.modePillText,
                    { color: isLiveFirebase ? '#065F46' : '#92400E' },
                  ]}>
                  {isLiveFirebase ? '● Firebase Live' : '● Sandbox Mode'}
                </Text>
              </View>
            </View>

            <View style={styles.topBarActions}>
              <Pressable
                style={styles.configTopBtn}
                onPress={() => setConfigModalVisible(true)}>
                <Text style={styles.configTopBtnText}>⚙️ Cấu hình</Text>
              </Pressable>

              <Pressable
                style={styles.logoutBtn}
                onPress={logoutUserFromFirebase}>
                <Text style={styles.logoutBtnText}>Đăng xuất</Text>
              </Pressable>
            </View>
          </View>

          {/* Thanh chuyển Tab */}
          <View style={styles.navTabs}>
            <Pressable
              style={[
                styles.navTabBtn,
                activeTab === 'profile' && styles.navTabBtnActive,
              ]}
              onPress={() => setActiveTab('profile')}>
              <Text
                style={[
                  styles.navTabText,
                  activeTab === 'profile' && styles.navTabTextActive,
                ]}>
                👤 Thông tin người dùng
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.navTabBtn,
                activeTab === 'fcm' && styles.navTabBtnActive,
              ]}
              onPress={() => setActiveTab('fcm')}>
              <Text
                style={[
                  styles.navTabText,
                  activeTab === 'fcm' && styles.navTabTextActive,
                ]}>
                🔔 Push Notification (FCM)
                {notifications.length > 0 ? ` (${notifications.length})` : ''}
              </Text>
            </Pressable>
          </View>

          {/* Nội dung chính */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.centeredContent}>
              {activeTab === 'profile' ? (
                <ProfileTab
                  user={user}
                  onUpdateProfile={handleUpdateProfile}
                  onTriggerProfilePush={handleSendPush}
                />
              ) : (
                <FcmTab
                  fcmInfo={fcmInfo}
                  notifications={notifications}
                  onSendPush={handleSendPush}
                  onRefreshToken={() => initFcmAndHistory(user?.uid)}
                  onClearHistory={async () => {
                    const empty = await clearNotificationHistory();
                    setNotifications(empty);
                  }}
                />
              )}
            </View>
          </ScrollView>
        </View>
      )}

      <FirebaseConfigModal
        visible={configModalVisible}
        currentConfig={firebaseConfig}
        isLiveFirebase={isLiveFirebase}
        onClose={() => setConfigModalVisible(false)}
        onSaveConfig={handleSaveFirebaseConfig}
        onResetToSandbox={handleResetSandbox}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
    textAlign: 'center',
  },
  toastBanner: {
    backgroundColor: '#1E1B4B',
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  toastTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  toastTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  toastBody: {
    color: '#E0E7FF',
    fontSize: 12.5,
  },
  toastDismiss: {
    color: '#A5B4FC',
    fontSize: 12.5,
    fontWeight: '700',
  },
  mainWrapper: {
    flex: 1,
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  modePillLive: {
    backgroundColor: '#D1FAE5',
  },
  modePillSandbox: {
    backgroundColor: '#FEF3C7',
  },
  modePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  configTopBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  configTopBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  logoutBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },
  navTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  navTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  navTabBtnActive: {
    backgroundColor: '#4F46E5',
  },
  navTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  navTabTextActive: {
    color: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centeredContent: {
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
});


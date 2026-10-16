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
import { COLORS } from './src/components/UiPrimitives';

export default function App() {
  const [initializing, setInitializing] = useState(true);
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

  const initFcmAndHistory = useCallback(async (currentUid) => {
    const history = await loadNotificationHistory();
    setNotifications(history);

    const tokenData = await registerForFcmNotificationsAsync();
    setFcmInfo(tokenData);

    if (currentUid && (tokenData.fcmToken || tokenData.expoPushToken)) {
      await syncDeviceTokensToFirebase(currentUid, tokenData);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const unsubscribeAuth = subscribeToUserSession(async (userProfile) => {
      if (!isMounted) return;
      setUser(userProfile);
      setInitializing(false);

      if (userProfile?.uid) {
        await initFcmAndHistory(userProfile.uid);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribeAuth === 'function') {
        unsubscribeAuth();
      }
    };
  }, [initFcmAndHistory]);

  useEffect(() => {
    const cleanupListeners = setupFcmNotificationListeners({
      onNotificationReceived: async (notif) => {
        const updated = await appendNotificationHistory(notif);
        setNotifications(updated);
        setLatestToast({
          tag: 'FOREGROUND FCM',
          title: notif.title,
          body: notif.body,
        });
      },
      onNotificationTapped: async (notif) => {
        const updated = await appendNotificationHistory(notif);
        setNotifications(updated);
        setLatestToast({
          tag: 'OPENED FROM NOTIFICATION',
          title: notif.title,
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
  }, []);

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

  if (initializing) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingTitle}>Firebase Cloud Suite</Text>
          <Text style={styles.loadingSubtitle}>
            Đang đồng bộ phiên đăng nhập & dịch vụ thông báo đẩy...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.darkSurface} />

      {/* Floating Push Notification Toast */}
      {latestToast ? (
        <View style={styles.toastWrapper}>
          <Pressable
            style={styles.toastBanner}
            onPress={() => {
              setActiveTab('fcm');
              setLatestToast(null);
            }}>
            <View style={styles.toastIndicator} />
            <View style={styles.toastContent}>
              <Text style={styles.toastTag}>{latestToast.tag}</Text>
              <Text style={styles.toastTitle} numberOfLines={1}>
                {latestToast.title}
              </Text>
              <Text style={styles.toastBody} numberOfLines={2}>
                {latestToast.body}
              </Text>
            </View>
            <View style={styles.toastActionChip}>
              <Text style={styles.toastActionText}>Chi tiết</Text>
            </View>
          </Pressable>
        </View>
      ) : null}

      {!user ? (
        <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        <View style={styles.mainWrapper}>
          {/* Dark Top Navigation Header */}
          <View style={styles.topHeader}>
            <View style={styles.topHeaderInner}>
              <View style={styles.brandSection}>
                <View style={styles.logoMark}>
                  <View style={styles.logoDiamond} />
                </View>
                <View>
                  <View style={styles.brandTitleRow}>
                    <Text style={styles.brandTitle}>Firebase Cloud</Text>
                    <View style={styles.liveStatusBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveStatusText}>LIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.brandUserEmail} numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.logoutBtn,
                  pressed && styles.logoutBtnPressed,
                ]}
                onPress={logoutUserFromFirebase}>
                <Text style={styles.logoutBtnText}>Đăng xuất</Text>
              </Pressable>
            </View>

            {/* Segmented Tab Bar */}
            <View style={styles.tabBarContainer}>
              <View style={styles.tabBarTrack}>
                <Pressable
                  style={[
                    styles.tabButton,
                    activeTab === 'profile' && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab('profile')}>
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === 'profile' && styles.tabButtonTextActive,
                    ]}>
                    Hồ sơ & Bảo mật
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.tabButton,
                    activeTab === 'fcm' && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab('fcm')}>
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === 'fcm' && styles.tabButtonTextActive,
                    ]}>
                    Push Notification (FCM)
                  </Text>
                  {notifications.length > 0 ? (
                    <View
                      style={[
                        styles.counterBadge,
                        activeTab === 'fcm' && styles.counterBadgeActive,
                      ]}>
                      <Text
                        style={[
                          styles.counterBadgeText,
                          activeTab === 'fcm' && styles.counterBadgeTextActive,
                        ]}>
                        {notifications.length}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>
            </View>
          </View>

          {/* Main Content Scroll */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    padding: 24,
  },
  loadingCard: {
    backgroundColor: COLORS.surface,
    paddingVertical: 32,
    paddingHorizontal: 28,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 340,
    width: '100%',
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  loadingSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  toastWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: COLORS.darkSurface,
  },
  toastBanner: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: COLORS.darkElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingRight: 14,
  },
  toastIndicator: {
    width: 5,
    alignSelf: 'stretch',
    backgroundColor: COLORS.primary,
  },
  toastContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  toastTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  toastTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  toastBody: {
    color: '#CBD5E1',
    fontSize: 12.5,
    marginTop: 2,
  },
  toastActionChip: {
    backgroundColor: 'rgba(79, 70, 229, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toastActionText: {
    color: '#E0E7FF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  mainWrapper: {
    flex: 1,
  },
  topHeader: {
    backgroundColor: COLORS.darkSurface,
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkElevated,
  },
  topHeaderInner: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDiamond: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  liveStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 5,
  },
  liveStatusText: {
    color: '#6EE7B7',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  brandUserEmail: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.38)',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutBtnPressed: {
    opacity: 0.75,
  },
  logoutBtnText: {
    color: '#FCA5A5',
    fontSize: 12.5,
    fontWeight: '700',
  },
  tabBarContainer: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  tabBarTrack: {
    flexDirection: 'row',
    backgroundColor: COLORS.darkElevated,
    borderRadius: 13,
    padding: 4,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 7,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  counterBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 999,
  },
  counterBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  counterBadgeText: {
    color: '#E2E8F0',
    fontSize: 10.5,
    fontWeight: '800',
  },
  counterBadgeTextActive: {
    color: COLORS.primary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 44,
  },
  centeredContent: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
});

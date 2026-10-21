import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import {
  COLORS,
  ModernInput,
  PrimaryButton,
  FeedbackAlert,
} from './UiPrimitives';

const SUBMISSION_LINKS = [
  {
    id: 'apk',
    icon: '📱',
    label: 'Tải File Cài Đặt Android (APK)',
    sub: '58.3 MB • Cài trực tiếp trên điện thoại để test Native FCM',
    url: 'https://expo.dev/artifacts/eas/Et2BtcYGj18cPhfMaSK5wESvgViSfbANtPuSqr7kwcI.apk',
    badge: 'APK Native',
    badgeColor: '#10B981',
  },
  {
    id: 'web',
    icon: '🚀',
    label: 'Ứng Dụng Chạy Trực Tiếp (Web)',
    sub: 'bonus6-firebase-integration.expo.app (EAS Hosting)',
    url: 'https://bonus6-firebase-integration.expo.app',
    badge: 'Web Live',
    badgeColor: '#6366F1',
  },
  {
    id: 'github',
    icon: '💻',
    label: 'Mã Nguồn Dự Án (GitHub Repo)',
    sub: 'github.com/ndhung23/bonus6-firebase-integration',
    url: 'https://github.com/ndhung23/bonus6-firebase-integration',
    badge: 'Public Code',
    badgeColor: '#0F172A',
  },
  {
    id: 'expo',
    icon: '📊',
    label: 'Trang Quản Lý Dự Án Expo',
    sub: 'expo.dev/accounts/ndhung23/projects/bonus6-firebase-integration',
    url: 'https://expo.dev/accounts/ndhung23/projects/bonus6-firebase-integration',
    badge: 'Expo EAS',
    badgeColor: '#F59E0B',
  },
];

export default function AuthScreen({ onLogin, onRegister }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async () => {
    setFeedback(null);
    setLoading(true);
    try {
      if (isRegisterMode) {
        await onRegister({
          email,
          password,
          fullName,
          phone,
          address,
        });
      } else {
        await onLogin({
          email,
          password,
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error?.userMessage || error?.message || 'Thao tác thất bại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      showsVerticalScrollIndicator={false}>
        <View style={styles.authContainer}>
          {/* Hero Dark Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroGlowCircle1} />
            <View style={styles.heroGlowCircle2} />

            <View style={styles.heroBadgeRow}>
              <View style={styles.brandMark}>
                <View style={styles.brandFlameInner} />
              </View>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTagText}>
                  FIREBASE AUTH • FIRESTORE • FCM
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              {isRegisterMode
                ? 'Khởi tạo hồ sơ người dùng'
                : 'Đăng nhập hệ thống'}
            </Text>
            <Text style={styles.heroSubtitle}>
              Quản lý đồng bộ thông tin tài khoản (Email, Số điện thoại, Mật khẩu, Địa chỉ) & dịch vụ thông báo đẩy thời gian thực.
            </Text>
          </View>

          {/* Form Body */}
          <View style={styles.formBody}>
            {/* Segmented Control */}
            <View style={styles.segmentedControl}>
              <Pressable
                style={[
                  styles.segmentItem,
                  !isRegisterMode && styles.segmentItemActive,
                ]}
                onPress={() => {
                  setIsRegisterMode(false);
                  setFeedback(null);
                }}>
                <Text
                  style={[
                    styles.segmentText,
                    !isRegisterMode && styles.segmentTextActive,
                  ]}>
                  Đăng nhập
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.segmentItem,
                  isRegisterMode && styles.segmentItemActive,
                ]}
                onPress={() => {
                  setIsRegisterMode(true);
                  setFeedback(null);
                }}>
                <Text
                  style={[
                    styles.segmentText,
                    isRegisterMode && styles.segmentTextActive,
                  ]}>
                  Đăng ký tài khoản
                </Text>
              </Pressable>
            </View>

            {feedback ? (
              <FeedbackAlert
                type={feedback.type}
                message={feedback.text}
                onDismiss={() => setFeedback(null)}
              />
            ) : null}

            <ModernInput
              label="Địa chỉ Email"
              badgeText="Bắt buộc"
              value={email}
              onChangeText={setEmail}
              placeholder="name@domain.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ModernInput
              label="Mật khẩu bảo mật"
              badgeText="Tối thiểu 6 ký tự"
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu của bạn"
              secureTextEntry
            />

            {isRegisterMode ? (
              <View style={styles.extraSection}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerLabel}>
                    THÔNG TIN HỒ SƠ FIRESTORE
                  </Text>
                  <View style={styles.dividerLine} />
                </View>

                <ModernInput
                  label="Họ và tên"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên đầy đủ"
                />

                <ModernInput
                  label="Số điện thoại"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Ví dụ: 0987654321"
                  keyboardType="phone-pad"
                />

                <ModernInput
                  label="Địa chỉ liên hệ"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  multiline
                />
              </View>
            ) : null}

            <PrimaryButton
              title={
                isRegisterMode
                  ? 'Đăng ký & Lưu hồ sơ lên Firebase'
                  : 'Đăng nhập vào hệ thống'
              }
              subtitle={
                isRegisterMode
                  ? 'Tự động khởi tạo Auth & Cloud Firestore'
                  : 'Xác thực qua Firebase Authentication'
              }
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitBtn}
            />

            {/* Quick Submission Links for Grader/Tester */}
            <View style={styles.linksCard}>
              <View style={styles.linksHeader}>
                <View style={styles.linksDot} />
                <Text style={styles.linksTag}>MMA301 • LIÊN KẾT NỘP BÀI ONLINE</Text>
              </View>
              <Text style={styles.linksTitle}>Đường dẫn kiểm thử & Chấm điểm</Text>
              <Text style={styles.linksSubtitle}>
                Chạm vào liên kết bên dưới để mở hoặc tải về trực tiếp:
              </Text>

              <View style={styles.linksList}>
                {SUBMISSION_LINKS.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.linkItem,
                      pressed && styles.linkItemPressed,
                    ]}
                    onPress={() => Linking.openURL(item.url).catch(() => {})}>
                    <View style={styles.linkIconCircle}>
                      <Text style={styles.linkIconText}>{item.icon}</Text>
                    </View>
                    <View style={styles.linkContent}>
                      <View style={styles.linkTopRow}>
                        <Text style={styles.linkItemLabel} numberOfLines={1}>
                          {item.label}
                        </Text>
                        <View
                          style={[
                            styles.linkBadge,
                            { backgroundColor: item.badgeColor },
                          ]}>
                          <Text style={styles.linkBadgeText}>{item.badge}</Text>
                        </View>
                      </View>
                      <Text style={styles.linkItemSub} numberOfLines={1}>
                        {item.sub}
                      </Text>
                    </View>
                    <Text style={styles.linkArrow}>↗</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
  );

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView style={styles.wrapper} behavior="padding">
        {content}
      </KeyboardAvoidingView>
    );
  }

  return <View style={styles.wrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 36,
    paddingBottom: 60,
  },
  authContainer: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  heroBanner: {
    backgroundColor: COLORS.darkSurface,
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 26,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlowCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(79, 70, 229, 0.25)',
    top: -60,
    right: -40,
  },
  heroGlowCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(13, 148, 136, 0.2)',
    bottom: -40,
    left: -30,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandFlameInner: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.success,
    marginRight: 7,
  },
  liveTagText: {
    color: '#E2E8F0',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#94A3B8',
    fontSize: 13.5,
    lineHeight: 20,
  },
  formBody: {
    padding: 24,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 14,
    padding: 4,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  extraSection: {
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerLabel: {
    paddingHorizontal: 10,
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  submitBtn: {
    marginTop: 6,
  },
  linksCard: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  linksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  linksDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 7,
  },
  linksTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  linksTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 3,
  },
  linksSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 14,
  },
  linksList: {
    gap: 10,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceMuted,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  linkItemPressed: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    transform: [{ scale: 0.99 }],
  },
  linkIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  linkIconText: {
    fontSize: 18,
  },
  linkContent: {
    flex: 1,
  },
  linkTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  linkItemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
    flex: 1,
  },
  linkBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  linkBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  linkItemSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  linkArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginLeft: 2,
  },
});

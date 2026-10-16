import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import {
  COLORS,
  ModernInput,
  PrimaryButton,
  ToggleSwitch,
  SectionHeader,
  FeedbackAlert,
} from './UiPrimitives';

export default function ProfileTab({
  user,
  onUpdateProfile,
  onTriggerProfilePush,
}) {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifyOnSave, setNotifyOnSave] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user?.uid, user?.email, user?.phone, user?.address, user?.fullName]);

  const handleSave = async () => {
    setStatusBanner(null);

    if (newPassword && newPassword !== confirmPassword) {
      setStatusBanner({
        type: 'error',
        text: 'Mật khẩu xác nhận không khớp với mật khẩu mới.',
      });
      return;
    }

    setSaving(true);
    try {
      const result = await onUpdateProfile({
        uid: user.uid,
        fullName,
        email,
        phone,
        address,
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setStatusBanner({
        type: 'success',
        text:
          result?.message ||
          'Đã đồng bộ thông tin người dùng (Email, Số điện thoại, Mật khẩu, Địa chỉ) lên Firebase thành công.',
      });

      if (notifyOnSave && onTriggerProfilePush) {
        await onTriggerProfilePush({
          title: 'Hồ sơ Firebase đã được cập nhật',
          body: `Email: ${email} • SĐT: ${phone || 'Chưa nhập'} • Địa chỉ: ${
            address || 'Chưa nhập'
          }`,
          data: {
            type: 'PROFILE_UPDATED',
            email,
            phone,
            address,
          },
        });
      }
    } catch (error) {
      setStatusBanner({
        type: 'error',
        text:
          error?.userMessage ||
          error?.message ||
          'Không thể cập nhật thông tin người dùng.',
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.fullName || user?.email || 'U')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <View style={styles.container}>
      {/* Bento Hero Profile Overview */}
      <View style={styles.heroCard}>
        <View style={styles.heroBanner}>
          <View style={styles.heroBannerOrb} />
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <View style={styles.heroIdentity}>
            <View style={styles.verifiedRow}>
              <Text style={styles.heroName} numberOfLines={1}>
                {user?.fullName || 'Tài khoản Firebase'}
              </Text>
              <View style={styles.verifiedPill}>
                <Text style={styles.verifiedPillText}>VERIFIED</Text>
              </View>
            </View>
            <Text style={styles.heroUid} selectable>
              UID: {user?.uid}
            </Text>
            <Text style={styles.heroSyncTime}>
              Đồng bộ Realtime:{' '}
              {user?.updatedAt
                ? new Date(user.updatedAt).toLocaleString('vi-VN')
                : 'Đang kết nối'}
            </Text>
          </View>
        </View>

        <View style={styles.bentoGrid}>
          <View style={styles.bentoTile}>
            <Text style={styles.bentoLabel}>ĐỊA CHỈ EMAIL</Text>
            <Text style={styles.bentoValue} numberOfLines={1}>
              {user?.email || 'Chưa thiết lập'}
            </Text>
          </View>

          <View style={styles.bentoTile}>
            <Text style={styles.bentoLabel}>SỐ ĐIỆN THOẠI</Text>
            <Text style={styles.bentoValue} numberOfLines={1}>
              {user?.phone || 'Chưa thiết lập'}
            </Text>
          </View>

          <View style={[styles.bentoTile, styles.bentoTileFull]}>
            <Text style={styles.bentoLabel}>ĐỊA CHỈ LIÊN HỆ</Text>
            <Text style={styles.bentoValue}>
              {user?.address || 'Chưa thiết lập địa chỉ'}
            </Text>
          </View>
        </View>
      </View>

      {statusBanner ? (
        <FeedbackAlert
          type={statusBanner.type}
          message={statusBanner.text}
          onDismiss={() => setStatusBanner(null)}
        />
      ) : null}

      {/* Card 1: Thông tin cá nhân & Liên hệ */}
      <View style={styles.surfaceCard}>
        <SectionHeader
          tag="CLOUD FIRESTORE + AUTH"
          title="Thông tin định danh & Liên hệ"
          subtitle="Cập nhật trực tiếp Email, Số điện thoại và Địa chỉ của bạn trên hệ thống Firebase."
        />

        <ModernInput
          label="Họ và tên hiển thị"
          badgeText="DisplayName"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nhập họ và tên của bạn"
        />

        <View style={styles.twoColRow}>
          <View style={styles.colItem}>
            <ModernInput
              label="1. Địa chỉ Email"
              badgeText="Firebase Auth"
              value={email}
              onChangeText={setEmail}
              placeholder="name@domain.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.colItem}>
            <ModernInput
              label="2. Số điện thoại"
              badgeText="8 - 15 số"
              value={phone}
              onChangeText={setPhone}
              placeholder="0987654321"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <ModernInput
          label="3. Địa chỉ cư trú / liên hệ"
          badgeText="Firestore Document"
          value={address}
          onChangeText={setAddress}
          placeholder="Nhập số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
          multiline
        />
      </View>

      {/* Card 2: Đổi mật khẩu & Xác thực bảo mật */}
      <View style={styles.surfaceCard}>
        <SectionHeader
          tag="SECURITY & CREDENTIALS"
          title="4. Quản lý Mật khẩu bảo mật"
          subtitle="Để trống các ô mật khẩu mới nếu bạn chỉ muốn cập nhật thông tin liên hệ ở trên."
        />

        <ModernInput
          label="Mật khẩu hiện tại"
          badgeText="Xác thực Re-Auth"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Nhập mật khẩu hiện tại khi đổi Email hoặc Mật khẩu mới"
          secureTextEntry
          helperText="Firebase yêu cầu xác thực lại mật khẩu hiện tại trước khi thay đổi thông tin nhạy cảm."
        />

        <View style={styles.twoColRow}>
          <View style={styles.colItem}>
            <ModernInput
              label="Mật khẩu mới"
              badgeText="Tối thiểu 6 ký tự"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry
            />
          </View>

          <View style={styles.colItem}>
            <ModernInput
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
            />
          </View>
        </View>

        <ToggleSwitch
          value={notifyOnSave}
          onValueChange={setNotifyOnSave}
          label="Bắn Push Notification sau khi cập nhật"
          description="Tự động gửi một thông báo đẩy xác nhận thay đổi hồ sơ tới thiết bị này."
        />

        <PrimaryButton
          title="Lưu & Đồng bộ lên Firebase Cloud"
          subtitle="Cập nhật đồng thời Firebase Authentication & Cloud Firestore"
          onPress={handleSave}
          loading={saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroBanner: {
    backgroundColor: COLORS.darkSurface,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBannerOrb: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(79, 70, 229, 0.24)',
    right: -40,
    top: -50,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.6)',
    marginRight: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },
  heroIdentity: {
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  verifiedPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.45)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedPillText: {
    color: '#6EE7B7',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroUid: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  heroSyncTime: {
    color: '#A5B4FC',
    fontSize: 11.5,
    marginTop: 4,
    fontWeight: '600',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 10,
    backgroundColor: COLORS.surface,
  },
  bentoTile: {
    flex: 1,
    minWidth: 160,
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bentoTileFull: {
    minWidth: '100%',
  },
  bentoLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.7,
    marginBottom: 5,
  },
  bentoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  surfaceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  twoColRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  colItem: {
    flex: 1,
    minWidth: 210,
  },
});

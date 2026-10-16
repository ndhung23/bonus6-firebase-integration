import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';

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
          'Cập nhật thông tin người dùng (Email, SĐT, Mật khẩu, Địa chỉ) thành công!',
      });

      if (notifyOnSave && onTriggerProfilePush) {
        await onTriggerProfilePush({
          title: 'Cập nhật hồ sơ thành công ✅',
          body: `Đã lưu Email: ${email} | SĐT: ${phone || 'Chưa nhập'} | Địa chỉ: ${
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

  return (
    <View style={styles.container}>
      {/* Thẻ tóm tắt thông tin hiện tại trên Firebase */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryName}>
              {user?.fullName || 'Người dùng Firebase'}
            </Text>
            <Text style={styles.summaryUid}>UID: {user?.uid}</Text>
            <Text style={styles.summaryTime}>
              Đồng bộ lần cuối:{' '}
              {user?.updatedAt
                ? new Date(user.updatedAt).toLocaleString('vi-VN')
                : 'Vừa xong'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>📧 Email hiện tại</Text>
            <Text style={styles.summaryValue}>{user?.email || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>📱 Số điện thoại</Text>
            <Text style={styles.summaryValue}>{user?.phone || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.summaryItemFull}>
            <Text style={styles.summaryLabel}>📍 Địa chỉ liên hệ</Text>
            <Text style={styles.summaryValue}>
              {user?.address || 'Chưa cập nhật'}
            </Text>
          </View>
        </View>
      </View>

      {/* Form cập nhật thông tin người dùng */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>
          ✏️ Cập nhật thông tin người dùng
        </Text>
        <Text style={styles.sectionDesc}>
          Thay đổi Email, Số điện thoại, Mật khẩu và Địa chỉ. Dữ liệu được đồng bộ trực tiếp với Firebase Authentication & Cloud Firestore.
        </Text>

        {statusBanner && (
          <View
            style={[
              styles.banner,
              statusBanner.type === 'success'
                ? styles.bannerSuccess
                : styles.bannerError,
            ]}>
            <Text
              style={[
                styles.bannerText,
                statusBanner.type === 'success'
                  ? styles.bannerSuccessText
                  : styles.bannerErrorText,
              ]}>
              {statusBanner.text}
            </Text>
          </View>
        )}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Họ và tên hiển thị</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nhập họ tên"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>1. Email người dùng (*)</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>2. Số điện thoại (*)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="VD: 0987654321"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>3. Địa chỉ (*)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={address}
            onChangeText={setAddress}
            placeholder="Nhập số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            placeholderTextColor="#9CA3AF"
            multiline
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.subSectionTitle}>
          4. Cập nhật Mật khẩu (Để trống nếu giữ nguyên mật khẩu cũ)
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Mật khẩu hiện tại (cần khi đổi Mật khẩu hoặc đổi Email trên Firebase)
          </Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Nhập mật khẩu hiện tại để xác thực"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
          />
        </View>

        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Ít nhất 6 ký tự"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>

          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>
        </View>

        {/* Tùy chọn bắn thông báo FCM khi cập nhật */}
        <Pressable
          style={styles.checkboxRow}
          onPress={() => setNotifyOnSave(!notifyOnSave)}>
          <View
            style={[
              styles.checkbox,
              notifyOnSave && styles.checkboxChecked,
            ]}>
            {notifyOnSave && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Gửi Push Notification xác nhận ngay sau khi cập nhật thông tin
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && styles.btnPressed,
            saving && styles.btnDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>
              💾 Lưu thay đổi lên Firebase
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  summaryUid: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryTime: {
    fontSize: 11.5,
    color: '#4F46E5',
    marginTop: 2,
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
  },
  summaryItemFull: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
  },
  summaryLabel: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 13.5,
    color: '#111827',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 14,
  },
  banner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  bannerSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  bannerError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  bannerText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bannerSuccessText: {
    color: '#065F46',
    fontWeight: '600',
  },
  bannerErrorText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14.5,
    color: '#111827',
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  rowFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  halfField: {
    flex: 1,
    minWidth: 180,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  saveBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});


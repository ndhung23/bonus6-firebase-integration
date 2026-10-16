import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

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

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Firebase Auth & FCM</Text>
          <Text style={styles.subtitle}>
            Đăng nhập, quản lý thông tin cá nhân (Email, SĐT, Mật khẩu, Địa chỉ) & nhận Push Notification qua Firebase Cloud Messaging
          </Text>

          {/* Chuyển đổi Đăng nhập / Đăng ký */}
          <View style={styles.tabSwitch}>
            <Pressable
              style={[
                styles.tabOption,
                !isRegisterMode && styles.tabOptionActive,
              ]}
              onPress={() => {
                setIsRegisterMode(false);
                setFeedback(null);
              }}>
              <Text
                style={[
                  styles.tabOptionText,
                  !isRegisterMode && styles.tabOptionTextActive,
                ]}>
                Đăng nhập
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabOption,
                isRegisterMode && styles.tabOptionActive,
              ]}
              onPress={() => {
                setIsRegisterMode(true);
                setFeedback(null);
              }}>
              <Text
                style={[
                  styles.tabOptionText,
                  isRegisterMode && styles.tabOptionTextActive,
                ]}>
                Đăng ký mới
              </Text>
            </Pressable>
          </View>

          {feedback && (
            <View
              style={[
                styles.feedbackBox,
                feedback.type === 'error'
                  ? styles.feedbackError
                  : styles.feedbackInfo,
              ]}>
              <Text
                style={[
                  styles.feedbackText,
                  feedback.type === 'error'
                    ? styles.feedbackErrorText
                    : styles.feedbackInfoText,
                ]}>
                {feedback.text}
              </Text>
            </View>
          )}

          {/* Các trường nhập liệu */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email (*)</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="nhap@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mật khẩu (*)</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>

          {isRegisterMode && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Địa chỉ</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Nhập địa chỉ liên hệ"
                  placeholderTextColor="#9CA3AF"
                  multiline
                />
              </View>
            </>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
              loading && styles.btnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isRegisterMode
                  ? 'Tạo tài khoản Firebase'
                  : 'Đăng nhập với Firebase'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    lineHeight: 19,
    marginBottom: 18,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabOptionTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  feedbackBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  feedbackInfo: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  feedbackText: {
    fontSize: 13,
    lineHeight: 18,
  },
  feedbackErrorText: {
    color: '#B91C1C',
  },
  feedbackInfoText: {
    color: '#1D4ED8',
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
    fontSize: 15,
    color: '#111827',
  },
  multilineInput: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
  },
});

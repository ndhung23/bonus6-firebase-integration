import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';

export const COLORS = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  darkSurface: '#0F172A',
  darkElevated: '#1E293B',
  primary: '#4F46E5',
  primaryHover: '#4338CA',
  primarySoft: '#EEF2FF',
  primaryBorder: '#C7D2FE',
  secondary: '#0D9488',
  secondarySoft: '#F0FDFA',
  textMain: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  success: '#10B981',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  successText: '#065F46',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FECACA',
  dangerText: '#991B1B',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  warningText: '#92400E',
};

export function ModernInput({
  label,
  badgeText,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  helperText,
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.inputContainer}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, focused && styles.labelFocused]}>
            {label}
          </Text>
          {badgeText ? (
            <View style={styles.labelBadge}>
              <Text style={styles.labelBadgeText}>{badgeText}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          multiline && styles.inputWrapperMultiline,
          focused && styles.inputWrapperFocused,
        ]}>
        <TextInput
          style={[
            styles.inputField,
            multiline && styles.inputFieldMultiline,
            Platform.OS === 'web' && { outlineStyle: 'none' },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry ? hidden : false}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {secureTextEntry ? (
          <Pressable
            style={styles.toggleBtn}
            onPress={() => setHidden((prev) => !prev)}>
            <Text style={styles.toggleBtnText}>{hidden ? 'Hiện' : 'Ẩn'}</Text>
          </Pressable>
        ) : null}
      </View>

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  title,
  subtitle,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}) {
  const bgStyle =
    variant === 'teal'
      ? styles.btnTeal
      : variant === 'dark'
      ? styles.btnDark
      : styles.btnPrimary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btnBase,
        bgStyle,
        pressed && !disabled && !loading && styles.btnPressed,
        (disabled || loading) && styles.btnDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.btnContent}>
          <Text style={styles.btnTitle}>{title}</Text>
          {subtitle ? <Text style={styles.btnSubtitle}>{subtitle}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

export function ToggleSwitch({ value, onValueChange, label, description }) {
  return (
    <Pressable
      style={styles.switchContainer}
      onPress={() => onValueChange(!value)}>
      <View style={styles.switchTextWrap}>
        <Text style={styles.switchLabel}>{label}</Text>
        {description ? (
          <Text style={styles.switchDesc}>{description}</Text>
        ) : null}
      </View>
      <View
        style={[
          styles.switchTrack,
          value ? styles.switchTrackOn : styles.switchTrackOff,
        ]}>
        <View
          style={[
            styles.switchThumb,
            value ? styles.switchThumbOn : styles.switchThumbOff,
          ]}
        />
      </View>
    </Pressable>
  );
}

export function SectionHeader({ tag, title, subtitle, rightElement }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        {tag ? (
          <View style={styles.sectionTag}>
            <Text style={styles.sectionTagText}>{tag}</Text>
          </View>
        ) : null}
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      {rightElement ? <View>{rightElement}</View> : null}
    </View>
  );
}

export function FeedbackAlert({ type = 'info', message, onDismiss }) {
  if (!message) return null;
  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <View
      style={[
        styles.alertContainer,
        isError
          ? styles.alertError
          : isSuccess
          ? styles.alertSuccess
          : styles.alertInfo,
      ]}>
      <View
        style={[
          styles.alertAccent,
          {
            backgroundColor: isError
              ? COLORS.danger
              : isSuccess
              ? COLORS.success
              : COLORS.primary,
          },
        ]}
      />
      <View style={styles.alertBody}>
        <Text
          style={[
            styles.alertTitle,
            isError
              ? styles.alertErrorTitle
              : isSuccess
              ? styles.alertSuccessTitle
              : styles.alertInfoTitle,
          ]}>
          {isError
            ? 'Không thể thực hiện'
            : isSuccess
            ? 'Hoàn tất đồng bộ Firebase'
            : 'Thông tin'}
        </Text>
        <Text
          style={[
            styles.alertText,
            isError
              ? styles.alertErrorText
              : isSuccess
              ? styles.alertSuccessText
              : styles.alertInfoText,
          ]}>
          {message}
        </Text>
      </View>
      {onDismiss ? (
        <Pressable style={styles.alertClose} onPress={onDismiss}>
          <Text style={styles.alertCloseText}>Đóng</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  labelFocused: {
    color: COLORS.primary,
  },
  labelBadge: {
    backgroundColor: COLORS.surfaceMuted,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  labelBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 10,
    minHeight: 86,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
  },
  inputField: {
    flex: 1,
    fontSize: 14.5,
    color: COLORS.textMain,
    paddingVertical: 10,
  },
  inputFieldMultiline: {
    minHeight: 66,
    textAlignVertical: 'top',
    paddingVertical: 2,
  },
  toggleBtn: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  helperText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 5,
  },
  btnBase: {
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnTeal: {
    backgroundColor: COLORS.secondary,
  },
  btnDark: {
    backgroundColor: COLORS.darkSurface,
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  btnDisabled: {
    opacity: 0.55,
  },
  btnContent: {
    alignItems: 'center',
  },
  btnTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  btnSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceMuted,
    padding: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  switchTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  switchDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  switchTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  switchTrackOff: {
    backgroundColor: COLORS.borderStrong,
  },
  switchTrackOn: {
    backgroundColor: COLORS.primary,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  sectionTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginTop: 4,
  },
  alertContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  alertAccent: {
    width: 5,
  },
  alertBody: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  alertError: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
  },
  alertSuccess: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.successBorder,
  },
  alertInfo: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primaryBorder,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  alertErrorTitle: {
    color: COLORS.dangerText,
  },
  alertSuccessTitle: {
    color: COLORS.successText,
  },
  alertInfoTitle: {
    color: COLORS.primaryHover,
  },
  alertText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  alertErrorText: {
    color: COLORS.dangerText,
  },
  alertSuccessText: {
    color: COLORS.successText,
  },
  alertInfoText: {
    color: COLORS.primaryHover,
  },
  alertClose: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  alertCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});


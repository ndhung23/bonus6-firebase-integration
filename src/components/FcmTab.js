import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';

export default function FcmTab({
  fcmInfo,
  notifications,
  onSendPush,
  onRefreshToken,
  onClearHistory,
}) {
  const [title, setTitle] = useState('Thông báo từ Firebase FCM 🔔');
  const [body, setBody] = useState(
    'Xin chào! Hồ sơ người dùng của bạn đã được đồng bộ với Firebase.'
  );
  const [customAction, setCustomAction] = useState('OPEN_PROFILE');
  const [statusMsg, setStatusMsg] = useState(null);
  const [sending, setSending] = useState(false);

  const handleTriggerPush = async (delaySeconds = 0) => {
    setStatusMsg(null);
    setSending(true);
    try {
      await onSendPush({
        title,
        body,
        data: {
          action: customAction,
          sentAt: new Date().toISOString(),
        },
        delaySeconds,
      });
      setStatusMsg({
        type: 'success',
        text:
          delaySeconds > 0
            ? `Đã lên lịch bắn Push Notification sau ${delaySeconds} giây (hãy ẩn ứng dụng xuống nền để kiểm tra Background Notification)!`
            : 'Đã gửi Push Notification thành công!',
      });
    } catch (error) {
      setStatusMsg({
        type: 'error',
        text: error?.message || 'Không thể gửi thông báo.',
      });
    } finally {
      setSending(false);
    }
  };

  const handleCopyToken = async (tokenValue) => {
    if (!tokenValue) return;
    if (
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      navigator.clipboard
    ) {
      try {
        await navigator.clipboard.writeText(tokenValue);
        setStatusMsg({
          type: 'success',
          text: 'Đã sao chép FCM Token vào Clipboard!',
        });
        return;
      } catch (_) {}
    }
    setStatusMsg({
      type: 'success',
      text: `FCM Token: ${tokenValue}`,
    });
  };

  return (
    <View style={styles.container}>
      {/* Thẻ trạng thái FCM & Device Token */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>
            📡 Trạng thái dịch vụ Firebase Cloud Messaging (FCM)
          </Text>
          <Pressable style={styles.refreshBtn} onPress={onRefreshToken}>
            <Text style={styles.refreshBtnText}>🔄 Làm mới Token</Text>
          </Pressable>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Quyền thông báo (Permission):</Text>
          <View
            style={[
              styles.permBadge,
              fcmInfo?.permissionStatus === 'granted'
                ? styles.permGranted
                : styles.permPending,
            ]}>
            <Text
              style={[
                styles.permBadgeText,
                fcmInfo?.permissionStatus === 'granted'
                  ? styles.permGrantedText
                  : styles.permPendingText,
              ]}>
              {fcmInfo?.permissionStatus === 'granted'
                ? 'ĐÃ CẤP QUYỀN (GRANTED)'
                : String(fcmInfo?.permissionStatus || 'UNDETERMINED').toUpperCase()}
            </Text>
          </View>
        </View>

        {fcmInfo?.statusNote ? (
          <Text style={styles.statusNoteText}>{fcmInfo.statusNote}</Text>
        ) : null}

        <View style={styles.tokenBox}>
          <View style={styles.tokenHeader}>
            <Text style={styles.tokenTitle}>🔑 FCM Device Registration Token</Text>
            <Pressable
              style={styles.copyBtn}
              onPress={() => handleCopyToken(fcmInfo?.fcmToken)}>
              <Text style={styles.copyBtnText}>Sao chép</Text>
            </Pressable>
          </View>
          <Text selectable style={styles.tokenValue}>
            {fcmInfo?.fcmToken || 'Đang lấy FCM Token...'}
          </Text>
        </View>

        {fcmInfo?.expoPushToken &&
        fcmInfo.expoPushToken !== 'N/A (Web Platform)' ? (
          <View style={styles.tokenBox}>
            <View style={styles.tokenHeader}>
              <Text style={styles.tokenTitle}>🚀 Expo Push Token</Text>
              <Pressable
                style={styles.copyBtn}
                onPress={() => handleCopyToken(fcmInfo?.expoPushToken)}>
                <Text style={styles.copyBtnText}>Sao chép</Text>
              </Pressable>
            </View>
            <Text selectable style={styles.tokenValue}>
              {fcmInfo.expoPushToken}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Form gửi thử Push Notification */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          🔔 Gửi thử Push Notification (Test FCM / Local Push)
        </Text>
        <Text style={styles.cardSubtitle}>
          Kiểm tra nhận thông báo đẩy trực tiếp trên thiết bị hoặc trình duyệt (hỗ trợ cả Foreground và Background).
        </Text>

        {statusMsg && (
          <View
            style={[
              styles.alertBox,
              statusMsg.type === 'success'
                ? styles.alertSuccess
                : styles.alertError,
            ]}>
            <Text
              style={[
                styles.alertText,
                statusMsg.type === 'success'
                  ? styles.alertSuccessText
                  : styles.alertErrorText,
              ]}>
              {statusMsg.text}
            </Text>
          </View>
        )}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tiêu đề thông báo (Title)</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Nhập tiêu đề thông báo"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nội dung thông báo (Body)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={body}
            onChangeText={setBody}
            placeholder="Nhập nội dung thông báo"
            placeholderTextColor="#9CA3AF"
            multiline
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Payload Data (Custom Action)</Text>
          <TextInput
            style={styles.input}
            value={customAction}
            onChangeText={setCustomAction}
            placeholder="VD: OPEN_PROFILE"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.sendNowBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => handleTriggerPush(0)}
            disabled={sending}>
            <Text style={styles.sendNowText}>🚀 Bắn thông báo ngay</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.sendDelayBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => handleTriggerPush(3)}
            disabled={sending}>
            <Text style={styles.sendDelayText}>⏱️ Gửi sau 3s (Test nền)</Text>
          </Pressable>
        </View>
      </View>

      {/* Danh sách thông báo đã nhận */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>
            📥 Lịch sử Push Notification đã nhận ({notifications.length})
          </Text>
          {notifications.length > 0 && (
            <Pressable style={styles.clearBtn} onPress={onClearHistory}>
              <Text style={styles.clearBtnText}>Xóa lịch sử</Text>
            </Pressable>
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Chưa có thông báo nào. Hãy nhấn "Bắn thông báo ngay" hoặc gửi từ Firebase Console để kiểm tra!
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View key={item.id} style={styles.notifItem}>
              <View style={styles.notifTop}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <View style={styles.sourceBadge}>
                  <Text style={styles.sourceBadgeText}>
                    {item.source || 'FCM'}
                  </Text>
                </View>
              </View>
              <Text style={styles.notifBody}>{item.body}</Text>
              <View style={styles.notifFooter}>
                <Text style={styles.notifMeta}>
                  🕒{' '}
                  {item.receivedAt
                    ? new Date(item.receivedAt).toLocaleTimeString('vi-VN')
                    : ''}
                </Text>
                {item.data && Object.keys(item.data).length > 0 ? (
                  <Text style={styles.notifData}>
                    Data: {JSON.stringify(item.data)}
                  </Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Hướng dẫn bắn từ Firebase Console */}
      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>
          💡 Hướng dẫn bắn thông báo từ Firebase Console (Cloud Messaging)
        </Text>
        <Text style={styles.guideStep}>
          1. Mở Firebase Console → Chọn Project → Vào mục{' '}
          <Text style={styles.bold}>Messaging</Text> (Cloud Messaging).
        </Text>
        <Text style={styles.guideStep}>
          2. Nhấn <Text style={styles.bold}>Create your first campaign</Text> → Chọn{' '}
          <Text style={styles.bold}>Firebase Notification messages</Text>.
        </Text>
        <Text style={styles.guideStep}>
          3. Nhập Notification Title & Text → Nhấn{' '}
          <Text style={styles.bold}>Send test message</Text> và dán{' '}
          <Text style={styles.bold}>FCM Device Registration Token</Text> ở trên (hoặc chọn Target theo App Android) rồi nhấn{' '}
          <Text style={styles.bold}>Publish</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 14,
  },
  refreshBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  permBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  permGranted: {
    backgroundColor: '#D1FAE5',
  },
  permPending: {
    backgroundColor: '#FEF3C7',
  },
  permBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  permGrantedText: {
    color: '#065F46',
  },
  permPendingText: {
    color: '#92400E',
  },
  statusNoteText: {
    fontSize: 12.5,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 17,
  },
  tokenBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tokenTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#374151',
  },
  copyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E0E7FF',
    borderRadius: 6,
  },
  copyBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4338CA',
  },
  tokenValue: {
    fontSize: 12,
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  alertBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  alertSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  alertError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  alertText: {
    fontSize: 13,
    lineHeight: 18,
  },
  alertSuccessText: {
    color: '#065F46',
    fontWeight: '600',
  },
  alertErrorText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  fieldGroup: {
    marginBottom: 12,
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
    fontSize: 14,
    color: '#111827',
  },
  multilineInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  sendNowBtn: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  sendNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sendDelayBtn: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  sendDelayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },
  emptyBox: {
    padding: 18,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },
  notifItem: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  notifTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  sourceBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sourceBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4338CA',
  },
  notifBody: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 6,
  },
  notifFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  notifMeta: {
    fontSize: 11.5,
    color: '#6B7280',
  },
  notifData: {
    fontSize: 11.5,
    color: '#4F46E5',
    fontWeight: '600',
  },
  guideCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  guideTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: 8,
  },
  guideStep: {
    fontSize: 12.5,
    color: '#3730A3',
    lineHeight: 19,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
  },
});


import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from 'react-native';
import {
  COLORS,
  ModernInput,
  PrimaryButton,
  SectionHeader,
  FeedbackAlert,
} from './UiPrimitives';

const QUICK_TEMPLATES = [
  {
    id: 'security',
    label: 'Cảnh báo bảo mật',
    title: 'Cảnh báo đăng nhập thiết bị mới',
    body: 'Tài khoản Firebase của bạn vừa được xác thực thành công trên phiên làm việc mới.',
    action: 'SECURITY_ALERT',
  },
  {
    id: 'profile',
    label: 'Đồng bộ hồ sơ',
    title: 'Đồng bộ Firestore hoàn tất',
    body: 'Thông tin Email, Số điện thoại và Địa chỉ của bạn đã được cập nhật.',
    action: 'OPEN_PROFILE',
  },
  {
    id: 'system',
    label: 'Thông báo hệ thống',
    title: 'Firebase Cloud Messaging',
    body: 'Dịch vụ Push Notification đang hoạt động ổn định ở chế độ thời gian thực.',
    action: 'SYSTEM_PING',
  },
];

export default function FcmTab({
  fcmInfo,
  notifications,
  onSendPush,
  onRefreshToken,
  onClearHistory,
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [customAction, setCustomAction] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [sending, setSending] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const handleTriggerPush = async (delaySeconds = 0) => {
    setStatusMsg(null);
    setSending(true);
    try {
      await onSendPush({
        title,
        body,
        data: customAction.trim()
          ? {
              action: customAction.trim(),
              sentAt: new Date().toISOString(),
            }
          : { sentAt: new Date().toISOString() },
        delaySeconds,
      });
      setStatusMsg({
        type: 'success',
        text:
          delaySeconds > 0
            ? `Đã đặt lịch bắn Push Notification sau ${delaySeconds} giây (hãy ẩn ứng dụng xuống nền để kiểm tra Background Push).`
            : 'Đã phát Push Notification thành công tới thiết bị.',
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

  const handleCopyToken = async (tokenValue, keyName) => {
    if (!tokenValue) return;
    if (
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      navigator.clipboard
    ) {
      try {
        await navigator.clipboard.writeText(tokenValue);
        setCopiedKey(keyName);
        setTimeout(() => setCopiedKey(''), 2500);
        return;
      } catch (_) {}
    }
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(''), 2500);
    setStatusMsg({
      type: 'success',
      text: `Đã chọn Token: ${tokenValue}`,
    });
  };

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setBody(tpl.body);
    setCustomAction(tpl.action);
    setStatusMsg(null);
  };

  const isGranted = fcmInfo?.permissionStatus === 'granted';

  return (
    <View style={styles.container}>
      {/* Card 1: FCM Diagnostic & Registration Token */}
      <View style={styles.surfaceCard}>
        <SectionHeader
          tag="CLOUD MESSAGING DIAGNOSTICS"
          title="Trạng thái kết nối FCM & Device Token"
          subtitle="Quản lý quyền nhận thông báo đẩy và mã định danh thiết bị dùng để gửi tin nhắn từ Firebase Console."
          rightElement={
            <Pressable style={styles.refreshBtn} onPress={onRefreshToken}>
              <Text style={styles.refreshBtnText}>Làm mới Token</Text>
            </Pressable>
          }
        />

        {/* Bento Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricTile}>
            <Text style={styles.metricLabel}>TRẠNG THÁI QUYỀN</Text>
            <View style={styles.metricBadgeRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isGranted
                      ? COLORS.success
                      : COLORS.warning,
                  },
                ]}
              />
              <Text
                style={[
                  styles.metricValue,
                  {
                    color: isGranted
                      ? COLORS.successText
                      : COLORS.warningText,
                  },
                ]}>
                {isGranted
                  ? 'ĐÃ CẤP QUYỀN (GRANTED)'
                  : String(
                      fcmInfo?.permissionStatus || 'UNDETERMINED'
                    ).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.metricTile}>
            <Text style={styles.metricLabel}>NỀN TẢNG THIẾT BỊ</Text>
            <Text style={styles.metricValue}>
              {String(fcmInfo?.platform || Platform.OS).toUpperCase()} CLIENT
            </Text>
          </View>
        </View>

        {fcmInfo?.statusNote ? (
          <View style={styles.noteStrip}>
            <Text style={styles.noteStripText}>{fcmInfo.statusNote}</Text>
          </View>
        ) : null}

        {/* Dark Terminal Box cho FCM Token */}
        <View style={styles.terminalBox}>
          <View style={styles.terminalHeader}>
            <View style={styles.terminalDots}>
              <View style={[styles.termDot, { backgroundColor: '#EF4444' }]} />
              <View style={[styles.termDot, { backgroundColor: '#F59E0B' }]} />
              <View style={[styles.termDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.terminalTitle}>
                FCM_REGISTRATION_TOKEN
              </Text>
            </View>
            {fcmInfo?.fcmToken ? (
              <Pressable
                style={[
                  styles.copyChip,
                  copiedKey === 'fcm' && styles.copyChipSuccess,
                ]}
                onPress={() => handleCopyToken(fcmInfo.fcmToken, 'fcm')}>
                <Text style={styles.copyChipText}>
                  {copiedKey === 'fcm' ? 'Đã chép ✓' : 'Sao chép'}
                </Text>
              </Pressable>
            ) : null}
          </View>
          <Text selectable style={styles.terminalCode}>
            {fcmInfo?.fcmToken ||
              '// Chưa có FCM Token (Hãy cấp quyền thông báo & nhấn Làm mới Token)'}
          </Text>
        </View>

        {fcmInfo?.expoPushToken ? (
          <View style={styles.terminalBox}>
            <View style={styles.terminalHeader}>
              <Text style={styles.terminalTitle}>EXPO_PUSH_TOKEN</Text>
              <Pressable
                style={[
                  styles.copyChip,
                  copiedKey === 'expo' && styles.copyChipSuccess,
                ]}
                onPress={() => handleCopyToken(fcmInfo.expoPushToken, 'expo')}>
                <Text style={styles.copyChipText}>
                  {copiedKey === 'expo' ? 'Đã chép ✓' : 'Sao chép'}
                </Text>
              </Pressable>
            </View>
            <Text selectable style={styles.terminalCode}>
              {fcmInfo.expoPushToken}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Card 2: Trình tạo & Bắn thử Push Notification */}
      <View style={styles.surfaceCard}>
        <SectionHeader
          tag="PUSH DISPATCHER"
          title="Kiểm thử gửi & nhận Push Notification"
          subtitle="Soạn nội dung thông báo hoặc chọn mẫu có sẵn bên dưới để kiểm tra hiển thị thông báo trên thiết bị."
        />

        {/* Quick Preset Chips */}
        <View style={styles.presetSection}>
          <Text style={styles.presetHeading}>MẪU THÔNG BÁO NHANH:</Text>
          <View style={styles.presetRow}>
            {QUICK_TEMPLATES.map((tpl) => (
              <Pressable
                key={tpl.id}
                style={({ pressed }) => [
                  styles.presetChip,
                  pressed && styles.presetChipPressed,
                ]}
                onPress={() => applyTemplate(tpl)}>
                <Text style={styles.presetChipText}>+ {tpl.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {statusMsg ? (
          <FeedbackAlert
            type={statusMsg.type}
            message={statusMsg.text}
            onDismiss={() => setStatusMsg(null)}
          />
        ) : null}

        <ModernInput
          label="Tiêu đề thông báo (Notification Title)"
          badgeText="Header"
          value={title}
          onChangeText={setTitle}
          placeholder="Nhập tiêu đề hiển thị trên thanh thông báo"
        />

        <ModernInput
          label="Nội dung thông báo (Notification Body)"
          badgeText="Bắt buộc"
          value={body}
          onChangeText={setBody}
          placeholder="Nhập nội dung chi tiết của thông báo đẩy..."
          multiline
        />

        <ModernInput
          label="Dữ liệu đính kèm (Custom Data Payload)"
          badgeText="JSON Action"
          value={customAction}
          onChangeText={setCustomAction}
          placeholder="Ví dụ: OPEN_PROFILE, ORDER_UPDATE..."
          autoCapitalize="characters"
        />

        <View style={styles.dispatchActions}>
          <View style={styles.dispatchBtnWrap}>
            <PrimaryButton
              title="Bắn thông báo ngay"
              subtitle="Hiển thị tức thì (Foreground)"
              onPress={() => handleTriggerPush(0)}
              loading={sending}
            />
          </View>

          <View style={styles.dispatchBtnWrap}>
            <PrimaryButton
              title="Hẹn giờ sau 3 giây"
              subtitle="Kiểm tra khi ẩn ứng dụng (Background)"
              variant="teal"
              onPress={() => handleTriggerPush(3)}
              disabled={sending}
            />
          </View>
        </View>
      </View>

      {/* Card 3: Timeline Lịch sử thông báo đã nhận */}
      <View style={styles.surfaceCard}>
        <SectionHeader
          tag="INCOMING STREAM"
          title={`Lịch sử thông báo đã nhận (${notifications.length})`}
          subtitle="Tự động ghi nhận mọi bản tin FCM đến khi mở ứng dụng hoặc khi người dùng nhấn vào thông báo."
          rightElement={
            notifications.length > 0 ? (
              <Pressable style={styles.clearBtn} onPress={onClearHistory}>
                <Text style={styles.clearBtnText}>Xóa tất cả</Text>
              </Pressable>
            ) : null
          }
        />

        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <View style={styles.emptyBellShape} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có bản tin thông báo nào</Text>
            <Text style={styles.emptySubtitle}>
              Hãy nhấn "Bắn thông báo ngay" ở khung phía trên hoặc gửi chiến dịch từ Firebase Console để xem dữ liệu xuất hiện theo thời gian thực.
            </Text>
          </View>
        ) : (
          <View style={styles.timelineList}>
            {notifications.map((item, index) => (
              <View
                key={item.id ? `${item.id}-${index}` : `notif-${index}`}
                style={styles.timelineCard}>
                <View style={styles.timelineAccent} />
                <View style={styles.timelineContent}>
                  <View style={styles.timelineTopRow}>
                    <Text style={styles.timelineTitle}>{item.title}</Text>
                    <View style={styles.sourcePill}>
                      <Text style={styles.sourcePillText}>
                        {item.source || 'FCM'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.timelineBody}>{item.body}</Text>

                  <View style={styles.timelineMetaRow}>
                    <Text style={styles.timelineTime}>
                      Nhận lúc:{' '}
                      {item.receivedAt
                        ? new Date(item.receivedAt).toLocaleTimeString('vi-VN')
                        : ''}
                    </Text>

                    {item.data && Object.keys(item.data).length > 0 ? (
                      <View style={styles.payloadChip}>
                        <Text style={styles.payloadChipText} numberOfLines={1}>
                          Payload: {JSON.stringify(item.data)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
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
  refreshBtn: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  metricTile: {
    flex: 1,
    minWidth: 170,
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  metricBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },
  metricValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  noteStrip: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 14,
  },
  noteStripText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  terminalBox: {
    backgroundColor: COLORS.darkSurface,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.darkElevated,
  },
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  terminalDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  termDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  terminalTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  copyChip: {
    backgroundColor: 'rgba(79, 70, 229, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
  },
  copyChipSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(52, 211, 153, 0.5)',
  },
  copyChipText: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '700',
  },
  terminalCode: {
    color: '#38BDF8',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  presetSection: {
    marginBottom: 18,
  },
  presetHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  presetChipPressed: {
    opacity: 0.75,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dispatchActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  dispatchBtnWrap: {
    flex: 1,
    minWidth: 210,
  },
  clearBtn: {
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dangerText,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyBellShape: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 420,
  },
  timelineList: {
    gap: 12,
  },
  timelineCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  timelineAccent: {
    width: 4,
    backgroundColor: COLORS.primary,
  },
  timelineContent: {
    flex: 1,
    padding: 14,
  },
  timelineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  timelineTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textMain,
    flex: 1,
  },
  sourcePill: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sourcePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  timelineBody: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  timelineMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  timelineTime: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  payloadChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: '100%',
  },
  payloadChipText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

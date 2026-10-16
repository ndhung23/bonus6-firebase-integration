import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { parseFirebaseSnippet, isConfigValid } from '../services/firebaseConfig';

export default function FirebaseConfigModal({
  visible,
  currentConfig,
  isLiveFirebase,
  onClose,
  onSaveConfig,
  onResetToSandbox,
}) {
  const [rawSnippet, setRawSnippet] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [vapidKey, setVapidKey] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (visible && currentConfig) {
      setApiKey(currentConfig.apiKey || '');
      setAuthDomain(currentConfig.authDomain || '');
      setProjectId(currentConfig.projectId || '');
      setStorageBucket(currentConfig.storageBucket || '');
      setMessagingSenderId(currentConfig.messagingSenderId || '');
      setAppId(currentConfig.appId || '');
      setVapidKey(currentConfig.vapidKey || '');
      setNotice(null);
    }
  }, [visible, currentConfig]);

  const handleParseSnippet = () => {
    const parsed = parseFirebaseSnippet(rawSnippet);
    if (!parsed) {
      setNotice({
        type: 'error',
        text: 'Không tìm thấy apiKey và projectId trong đoạn văn bản vừa dán.',
      });
      return;
    }
    setApiKey(parsed.apiKey || '');
    setAuthDomain(parsed.authDomain || '');
    setProjectId(parsed.projectId || '');
    setStorageBucket(parsed.storageBucket || '');
    setMessagingSenderId(parsed.messagingSenderId || '');
    setAppId(parsed.appId || '');
    if (parsed.vapidKey) setVapidKey(parsed.vapidKey);
    setNotice({
      type: 'success',
      text: 'Đã tách thành công các trường firebaseConfig! Nhấn "Lưu & Kết nối Firebase" bên dưới.',
    });
  };

  const handleSave = async () => {
    const candidate = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim(),
      vapidKey: vapidKey.trim(),
    };

    if (!isConfigValid(candidate)) {
      setNotice({
        type: 'error',
        text: 'Vui lòng điền ít nhất apiKey, projectId và appId hợp lệ để kết nối Firebase Cloud.',
      });
      return;
    }

    await onSaveConfig(candidate, false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          <View style={styles.header}>
            <Text style={styles.title}>⚙️ Cấu hình kết nối Firebase</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.desc}>
              Trạng thái hiện tại:{' '}
              <Text style={styles.bold}>
                {isLiveFirebase
                  ? 'Đang kết nối Firebase Cloud thật'
                  : 'Đang dùng chế độ Sandbox (Giả lập nội bộ)'}
              </Text>
              . Bạn có thể cấu hình qua file <Text style={styles.bold}>.env</Text> hoặc dán trực tiếp đoạn mã <Text style={styles.bold}>firebaseConfig</Text> từ Firebase Console vào ô dưới đây:
            </Text>

            {notice && (
              <View
                style={[
                  styles.noticeBox,
                  notice.type === 'success'
                    ? styles.noticeSuccess
                    : styles.noticeError,
                ]}>
                <Text
                  style={[
                    styles.noticeText,
                    notice.type === 'success'
                      ? styles.noticeSuccessText
                      : styles.noticeErrorText,
                  ]}>
                  {notice.text}
                </Text>
              </View>
            )}

            <View style={styles.snippetSection}>
              <Text style={styles.label}>
                📋 Dán nhanh đoạn code firebaseConfig từ Firebase Console:
              </Text>
              <TextInput
                style={[styles.input, styles.snippetInput]}
                value={rawSnippet}
                onChangeText={setRawSnippet}
                placeholder={'const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "my-app",\n  appId: "1:123:web:abc"\n};'}
                placeholderTextColor="#9CA3AF"
                multiline
              />
              <Pressable style={styles.parseBtn} onPress={handleParseSnippet}>
                <Text style={styles.parseBtnText}>
                  ✨ Tự động tách các trường từ đoạn mã trên
                </Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>apiKey (*)</Text>
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="AIzaSy..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>authDomain</Text>
              <TextInput
                style={styles.input}
                value={authDomain}
                onChangeText={setAuthDomain}
                placeholder="your-project.firebaseapp.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>projectId (*)</Text>
              <TextInput
                style={styles.input}
                value={projectId}
                onChangeText={setProjectId}
                placeholder="your-project-id"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>storageBucket</Text>
              <TextInput
                style={styles.input}
                value={storageBucket}
                onChangeText={setStorageBucket}
                placeholder="your-project.firebasestorage.app"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>messagingSenderId</Text>
              <TextInput
                style={styles.input}
                value={messagingSenderId}
                onChangeText={setMessagingSenderId}
                placeholder="1234567890"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>appId (*)</Text>
              <TextInput
                style={styles.input}
                value={appId}
                onChangeText={setAppId}
                placeholder="1:1234567890:web:abcdef..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                vapidKey (Tuỳ chọn - dùng cho Web Push Certificate)
              </Text>
              <TextInput
                style={styles.input}
                value={vapidKey}
                onChangeText={setVapidKey}
                placeholder="BExxx..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={styles.sandboxBtn}
              onPress={async () => {
                await onResetToSandbox();
                onClose();
              }}>
              <Text style={styles.sandboxBtnText}>Dùng chế độ Sandbox</Text>
            </Pressable>

            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Lưu & Kết nối Firebase</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  modalBox: {
    maxWidth: 560,
    width: '100%',
    maxHeight: '90%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  body: {
    padding: 18,
  },
  desc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 14,
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  noticeBox: {
    padding: 11,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  noticeSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  noticeError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  noticeText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  noticeSuccessText: {
    color: '#065F46',
    fontWeight: '600',
  },
  noticeErrorText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  snippetSection: {
    backgroundColor: '#F5F3FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 16,
  },
  snippetInput: {
    minHeight: 84,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  parseBtn: {
    marginTop: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  parseBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 9,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  sandboxBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  sandboxBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#374151',
  },
  saveBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});


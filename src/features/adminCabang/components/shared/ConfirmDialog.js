import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from './ActionButton';

const ConfirmDialog = ({
  visible,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Yakin ingin melanjutkan?',
  confirmText = 'Ya',
  cancelText = 'Batal',
  type = 'danger', // 'danger', 'warning', 'info'
  loading = false
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case 'danger':
        return { icon: 'warning', color: '#dc3545' };
      case 'warning':
        return { icon: 'alert-circle', color: '#ffc107' };
      case 'info':
        return { icon: 'information-circle', color: '#007bff' };
      default:
        return { icon: 'help-circle', color: '#6c757d' };
    }
  };

  const { icon, color } = getIconAndColor();

  const handleConfirm = () => {
    if (loading) return;
    onConfirm();
  };

  const handleCancel = () => {
    if (loading) return;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon} size={32} color={color} />
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.actions}>
            <ActionButton
              title={cancelText}
              variant="outline"
              onPress={handleCancel}
              disabled={loading}
              style={styles.cancelButton}
            />
            
            <ActionButton
              title={confirmText}
              variant={type === 'danger' ? 'danger' : 'primary'}
              onPress={handleConfirm}
              loading={loading}
              style={styles.confirmButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Utility function for quick alerts
ConfirmDialog.show = ({
  title = 'Konfirmasi',
  message = 'Yakin ingin melanjutkan?',
  confirmText = 'Ya',
  cancelText = 'Batal',
  onConfirm = () => {},
  onCancel = () => {}
}) => {
  Alert.alert(
    title,
    message,
    [
      { text: cancelText, style: 'cancel', onPress: onCancel },
      { text: confirmText, style: 'destructive', onPress: onConfirm }
    ]
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden'
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12
  },
  cancelButton: {
    flex: 1
  },
  confirmButton: {
    flex: 1
  }
});

export default ConfirmDialog;
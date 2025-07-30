import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from '../../shared/ActionButton';

const JenjangDeleteDialog = ({
  visible,
  onClose,
  onConfirm,
  jenjangData,
  loading = false
}) => {
  if (!jenjangData) return null;

  const handleConfirm = () => {
    if (loading) return;
    onConfirm(jenjangData);
  };

  const handleCancel = () => {
    if (loading) return;
    onClose();
  };

  const hasKelas = jenjangData.kelas_count > 0 || (jenjangData.kelas && jenjangData.kelas.length > 0);
  const hasMataPelajaran = jenjangData.mata_pelajaran_count > 0 || (jenjangData.mata_pelajaran && jenjangData.mata_pelajaran.length > 0);
  const canDelete = !hasKelas && !hasMataPelajaran;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: canDelete ? '#dc354520' : '#ffc10720' }
            ]}>
              <Ionicons 
                name={canDelete ? "warning" : "information-circle"} 
                size={32} 
                color={canDelete ? "#dc3545" : "#ffc107"} 
              />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>
              {canDelete ? 'Hapus Jenjang' : 'Tidak Dapat Menghapus'}
            </Text>
            
            <Text style={styles.message}>
              {canDelete 
                ? `Yakin ingin menghapus jenjang "${jenjangData.nama_jenjang}"? Tindakan ini tidak dapat dibatalkan.`
                : `Jenjang "${jenjangData.nama_jenjang}" tidak dapat dihapus karena masih digunakan.`
              }
            </Text>

            {/* Dependency Information */}
            {(hasKelas || hasMataPelajaran) && (
              <View style={styles.dependencyInfo}>
                <Text style={styles.dependencyTitle}>Jenjang ini digunakan oleh:</Text>
                
                {hasKelas && (
                  <View style={styles.dependencyItem}>
                    <Ionicons name="library-outline" size={16} color="#666" />
                    <Text style={styles.dependencyText}>
                      {jenjangData.kelas_count || jenjangData.kelas?.length || 0} Kelas
                    </Text>
                  </View>
                )}
                
                {hasMataPelajaran && (
                  <View style={styles.dependencyItem}>
                    <Ionicons name="book-outline" size={16} color="#666" />
                    <Text style={styles.dependencyText}>
                      {jenjangData.mata_pelajaran_count || jenjangData.mata_pelajaran?.length || 0} Mata Pelajaran
                    </Text>
                  </View>
                )}
                
                <Text style={styles.dependencyNote}>
                  Hapus terlebih dahulu semua data yang terkait untuk dapat menghapus jenjang ini.
                </Text>
              </View>
            )}

            {/* Jenjang Info */}
            <View style={styles.jenjangInfo}>
              <View style={styles.jenjangInfoRow}>
                <Text style={styles.jenjangInfoLabel}>Kode:</Text>
                <Text style={styles.jenjangInfoValue}>{jenjangData.kode_jenjang}</Text>
              </View>
              
              <View style={styles.jenjangInfoRow}>
                <Text style={styles.jenjangInfoLabel}>Urutan:</Text>
                <Text style={styles.jenjangInfoValue}>#{jenjangData.urutan}</Text>
              </View>
              
              <View style={styles.jenjangInfoRow}>
                <Text style={styles.jenjangInfoLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: jenjangData.is_active ? '#d4edda' : '#f8d7da' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: jenjangData.is_active ? '#155724' : '#721c24' }
                  ]}>
                    {jenjangData.is_active ? 'Aktif' : 'Nonaktif'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <ActionButton
              title="Batal"
              variant="outline"
              onPress={handleCancel}
              disabled={loading}
              style={styles.cancelButton}
            />
            
            {canDelete && (
              <ActionButton
                title="Hapus"
                variant="danger"
                onPress={handleConfirm}
                loading={loading}
                style={styles.confirmButton}
                icon="trash-outline"
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
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
    maxHeight: '80%',
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
    paddingBottom: 24
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20
  },
  dependencyInfo: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20
  },
  dependencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8
  },
  dependencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  dependencyText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8
  },
  dependencyNote: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
    marginTop: 8
  },
  jenjangInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8
  },
  jenjangInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  jenjangInfoLabel: {
    fontSize: 14,
    color: '#666'
  },
  jenjangInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600'
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

export default JenjangDeleteDialog;
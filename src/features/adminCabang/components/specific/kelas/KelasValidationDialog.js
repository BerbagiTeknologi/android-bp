import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from '../../shared/ActionButton';

const KelasValidationDialog = ({
  visible,
  onClose,
  onConfirm,
  kelasData,
  loading = false
}) => {
  if (!kelasData) return null;

  const handleConfirm = () => {
    if (loading) return;
    onConfirm(kelasData);
  };

  const handleCancel = () => {
    if (loading) return;
    onClose();
  };

  const hasMateri = kelasData.materi_count > 0 || (kelasData.materi && kelasData.materi.length > 0);
  const canDelete = !hasMateri;

  const getDisplayName = () => {
    if (kelasData.jenis_kelas === 'standard' && kelasData.tingkat) {
      const romans = {1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X',11:'XI',12:'XII'};
      return `Kelas ${kelasData.tingkat} (${romans[kelasData.tingkat]})`;
    }
    return kelasData.nama_kelas;
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

          <View style={styles.content}>
            <Text style={styles.title}>
              {canDelete ? 'Hapus Kelas' : 'Tidak Dapat Menghapus'}
            </Text>
            
            <Text style={styles.message}>
              {canDelete 
                ? `Yakin ingin menghapus kelas "${getDisplayName()}"? Tindakan ini tidak dapat dibatalkan.`
                : `Kelas "${getDisplayName()}" tidak dapat dihapus karena masih digunakan.`
              }
            </Text>

            {hasMateri && (
              <View style={styles.dependencyInfo}>
                <Text style={styles.dependencyTitle}>Kelas ini digunakan oleh:</Text>
                
                <View style={styles.dependencyItem}>
                  <Ionicons name="document-text-outline" size={16} color="#666" />
                  <Text style={styles.dependencyText}>
                    {kelasData.materi_count || kelasData.materi?.length || 0} Materi
                  </Text>
                </View>
                
                <Text style={styles.dependencyNote}>
                  Hapus terlebih dahulu semua materi untuk dapat menghapus kelas ini.
                </Text>
              </View>
            )}

            <View style={styles.kelasInfo}>
              <View style={styles.kelasInfoRow}>
                <Text style={styles.kelasInfoLabel}>Jenis:</Text>
                <View style={[
                  styles.typeBadge,
                  { backgroundColor: kelasData.jenis_kelas === 'standard' ? '#007bff20' : '#28a74520' }
                ]}>
                  <Text style={[
                    styles.typeText,
                    { color: kelasData.jenis_kelas === 'standard' ? '#007bff' : '#28a745' }
                  ]}>
                    {kelasData.jenis_kelas === 'standard' ? 'Standard' : 'Custom'}
                  </Text>
                </View>
              </View>
              
              {kelasData.jenis_kelas === 'standard' && kelasData.tingkat && (
                <View style={styles.kelasInfoRow}>
                  <Text style={styles.kelasInfoLabel}>Tingkat:</Text>
                  <Text style={styles.kelasInfoValue}>{kelasData.tingkat}</Text>
                </View>
              )}
              
              <View style={styles.kelasInfoRow}>
                <Text style={styles.kelasInfoLabel}>Jenjang:</Text>
                <Text style={styles.kelasInfoValue}>
                  {kelasData.jenjang?.nama_jenjang || 'Tidak diketahui'}
                </Text>
              </View>
              
              <View style={styles.kelasInfoRow}>
                <Text style={styles.kelasInfoLabel}>Urutan:</Text>
                <Text style={styles.kelasInfoValue}>#{kelasData.urutan}</Text>
              </View>
              
              <View style={styles.kelasInfoRow}>
                <Text style={styles.kelasInfoLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: kelasData.is_active ? '#d4edda' : '#f8d7da' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: kelasData.is_active ? '#155724' : '#721c24' }
                  ]}>
                    {kelasData.is_active ? 'Aktif' : 'Nonaktif'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

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
  kelasInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8
  },
  kelasInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  kelasInfoLabel: {
    fontSize: 14,
    color: '#666'
  },
  kelasInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600'
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

export default KelasValidationDialog;
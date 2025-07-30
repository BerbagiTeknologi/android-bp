import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from '../../shared/ActionButton';
import DropdownSelector from '../../shared/DropdownSelector';
import { useCascadeData } from '../../../hooks/useCascadeData';

const MateriBulkOperations = ({
  visible,
  onClose,
  selectedItems = [],
  onBulkDelete,
  onBulkDuplicate,
  onBulkExport,
  onBulkMove,
  loading = false
}) => {
  const cascadeData = useCascadeData({ autoLoad: true });
  const [operation, setOperation] = useState('');
  const [moveToKelas, setMoveToKelas] = useState('');
  const [duplicateToKelas, setDuplicateToKelas] = useState('');

  const canDelete = selectedItems.every(item => !item.kurikulum_materi_count);
  const selectedCount = selectedItems.length;

  const handleBulkDelete = () => {
    if (!canDelete) {
      const usedItems = selectedItems.filter(item => item.kurikulum_materi_count > 0);
      Alert.alert(
        'Tidak Dapat Dihapus',
        `${usedItems.length} materi sedang digunakan dalam kurikulum dan tidak dapat dihapus.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Hapus Materi',
      `Yakin ingin menghapus ${selectedCount} materi terpilih?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: () => {
            onBulkDelete(selectedItems.map(item => item.id_materi));
            onClose();
          }
        }
      ]
    );
  };

  const handleBulkDuplicate = () => {
    if (!duplicateToKelas) {
      Alert.alert('Error', 'Pilih kelas tujuan untuk duplikasi');
      return;
    }

    const duplicateData = {
      items: selectedItems.map(item => item.id_materi),
      target_kelas_id: parseInt(duplicateToKelas)
    };

    onBulkDuplicate(duplicateData);
    onClose();
  };

  const handleBulkMove = () => {
    if (!moveToKelas) {
      Alert.alert('Error', 'Pilih kelas tujuan untuk pemindahan');
      return;
    }

    const moveData = {
      items: selectedItems.map(item => item.id_materi),
      target_kelas_id: parseInt(moveToKelas)
    };

    Alert.alert(
      'Pindah Materi',
      `Yakin ingin memindahkan ${selectedCount} materi ke kelas yang dipilih?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Pindah',
          onPress: () => {
            onBulkMove(moveData);
            onClose();
          }
        }
      ]
    );
  };

  const handleExport = () => {
    onBulkExport(selectedItems.map(item => item.id_materi));
    onClose();
  };

  const getKelasOptions = () => {
    return cascadeData.data.kelas.map(item => ({
      label: item.nama_kelas,
      value: item.id_kelas.toString(),
      subtitle: `${item.jenjang?.nama_jenjang} - ${item.jenis_kelas}`,
      badge: item.jenjang?.kode_jenjang
    }));
  };

  const renderSelectedItem = ({ item }) => (
    <View style={styles.selectedItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.nama_materi}</Text>
        <Text style={styles.itemDetail}>
          {item.mata_pelajaran?.nama_mata_pelajaran} - {item.kelas?.nama_kelas}
        </Text>
      </View>
      {item.kurikulum_materi_count > 0 && (
        <View style={styles.usageBadge}>
          <Ionicons name="link" size={12} color="#dc3545" />
          <Text style={styles.usageText}>{item.kurikulum_materi_count}</Text>
        </View>
      )}
    </View>
  );

  const renderOperationContent = () => {
    switch (operation) {
      case 'duplicate':
        return (
          <View>
            <Text style={styles.operationDesc}>
              Duplikasi {selectedCount} materi ke kelas lain
            </Text>
            <DropdownSelector
              label="Kelas Tujuan"
              value={duplicateToKelas}
              onValueChange={setDuplicateToKelas}
              options={getKelasOptions()}
              placeholder="Pilih kelas tujuan"
              searchable
            />
            <ActionButton
              title={`Duplikasi ${selectedCount} Materi`}
              onPress={handleBulkDuplicate}
              loading={loading}
              disabled={!duplicateToKelas}
              style={styles.actionButton}
            />
          </View>
        );

      case 'move':
        return (
          <View>
            <Text style={styles.operationDesc}>
              Pindahkan {selectedCount} materi ke kelas lain
            </Text>
            <DropdownSelector
              label="Kelas Tujuan"
              value={moveToKelas}
              onValueChange={setMoveToKelas}
              options={getKelasOptions()}
              placeholder="Pilih kelas tujuan"
              searchable
            />
            <ActionButton
              title={`Pindahkan ${selectedCount} Materi`}
              onPress={handleBulkMove}
              loading={loading}
              disabled={!moveToKelas}
              style={styles.actionButton}
            />
          </View>
        );

      case 'delete':
        return (
          <View>
            <Text style={styles.operationDesc}>
              Hapus {selectedCount} materi terpilih
            </Text>
            {!canDelete && (
              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={16} color="#ffc107" />
                <Text style={styles.warningText}>
                  Beberapa materi sedang digunakan dalam kurikulum
                </Text>
              </View>
            )}
            <ActionButton
              title={`Hapus ${selectedCount} Materi`}
              variant="danger"
              onPress={handleBulkDelete}
              loading={loading}
              style={styles.actionButton}
            />
          </View>
        );

      case 'export':
        return (
          <View>
            <Text style={styles.operationDesc}>
              Export {selectedCount} materi ke file
            </Text>
            <ActionButton
              title={`Export ${selectedCount} Materi`}
              icon="download-outline"
              onPress={handleExport}
              loading={loading}
              style={styles.actionButton}
            />
          </View>
        );

      default:
        return (
          <View style={styles.operationSelector}>
            <Text style={styles.selectorTitle}>Pilih Operasi</Text>
            
            <TouchableOpacity
              style={styles.operationOption}
              onPress={() => setOperation('duplicate')}
            >
              <Ionicons name="copy-outline" size={24} color="#007bff" />
              <Text style={styles.operationLabel}>Duplikasi</Text>
              <Text style={styles.operationSubtext}>Salin ke kelas lain</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.operationOption}
              onPress={() => setOperation('move')}
            >
              <Ionicons name="move-outline" size={24} color="#28a745" />
              <Text style={styles.operationLabel}>Pindahkan</Text>
              <Text style={styles.operationSubtext}>Pindah ke kelas lain</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.operationOption}
              onPress={() => setOperation('export')}
            >
              <Ionicons name="download-outline" size={24} color="#ffc107" />
              <Text style={styles.operationLabel}>Export</Text>
              <Text style={styles.operationSubtext}>Download sebagai file</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.operationOption, !canDelete && styles.operationDisabled]}
              onPress={() => canDelete && setOperation('delete')}
              disabled={!canDelete}
            >
              <Ionicons 
                name="trash-outline" 
                size={24} 
                color={canDelete ? "#dc3545" : "#ccc"} 
              />
              <Text style={[
                styles.operationLabel,
                !canDelete && styles.operationLabelDisabled
              ]}>
                Hapus
              </Text>
              <Text style={[
                styles.operationSubtext,
                !canDelete && styles.operationLabelDisabled
              ]}>
                {canDelete ? 'Hapus permanen' : 'Ada yang digunakan'}
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Operasi Bulk ({selectedCount} item)
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {operation && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setOperation('')}
              >
                <Ionicons name="chevron-back" size={20} color="#007bff" />
                <Text style={styles.backText}>Kembali</Text>
              </TouchableOpacity>
            )}

            {renderOperationContent()}

            {operation === '' && (
              <View style={styles.selectedList}>
                <Text style={styles.selectedTitle}>Materi Terpilih:</Text>
                <FlatList
                  data={selectedItems.slice(0, 5)}
                  renderItem={renderSelectedItem}
                  keyExtractor={(item) => item.id_materi.toString()}
                  style={styles.list}
                />
                {selectedItems.length > 5 && (
                  <Text style={styles.moreText}>
                    +{selectedItems.length - 5} materi lainnya
                  </Text>
                )}
              </View>
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
    justifyContent: 'flex-end'
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    padding: 4
  },
  content: {
    padding: 20
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  backText: {
    fontSize: 16,
    color: '#007bff',
    marginLeft: 4
  },
  operationSelector: {
    marginBottom: 20
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  operationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8
  },
  operationDisabled: {
    opacity: 0.5
  },
  operationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
    flex: 1
  },
  operationLabelDisabled: {
    color: '#ccc'
  },
  operationSubtext: {
    fontSize: 12,
    color: '#666'
  },
  operationDesc: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center'
  },
  actionButton: {
    marginTop: 16
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 8
  },
  selectedList: {
    marginTop: 20
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  list: {
    maxHeight: 200
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 4
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  itemDetail: {
    fontSize: 12,
    color: '#666'
  },
  usageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  usageText: {
    fontSize: 10,
    color: '#dc3545',
    marginLeft: 2
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8
  }
});

export default MateriBulkOperations;
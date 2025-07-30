import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ActionButton from '../../shared/ActionButton';
import DropdownSelector from '../../shared/DropdownSelector';
import { useCascadeData } from '../../../hooks/useCascadeData';

const MateriImportExport = ({
  visible,
  onClose,
  onImport,
  onExport,
  selectedItems = [],
  loading = false
}) => {
  const cascadeData = useCascadeData({ autoLoad: true });
  const [mode, setMode] = useState(''); // 'import', 'export'
  const [importFile, setImportFile] = useState(null);
  const [importFormat, setImportFormat] = useState('json');
  const [exportFormat, setExportFormat] = useState('json');
  const [targetJenjang, setTargetJenjang] = useState('');
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets[0]) {
        setImportFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memilih file');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      Alert.alert('Error', 'Pilih file untuk diimport');
      return;
    }

    const importData = {
      file: importFile,
      format: importFormat,
      target_jenjang_id: targetJenjang ? parseInt(targetJenjang) : null,
      overwrite_existing: overwriteExisting,
      validate_dependencies: true
    };

    onImport(importData);
    onClose();
  };

  const handleExport = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Tidak ada data untuk diekspor');
      return;
    }

    const exportData = {
      items: selectedItems.map(item => item.id_materi),
      format: exportFormat,
      include_dependencies: true,
      include_metadata: true
    };

    onExport(exportData);
    onClose();
  };

  const generateTemplate = async () => {
    try {
      const templateData = {
        materi: [
          {
            nama_materi: 'Contoh Materi 1',
            mata_pelajaran: 'Bahasa Indonesia',
            kelas: 'Kelas 1A',
            jenjang: 'Sekolah Dasar'
          },
          {
            nama_materi: 'Contoh Materi 2',
            mata_pelajaran: 'Matematika',
            kelas: 'Kelas 1A',
            jenjang: 'Sekolah Dasar'
          }
        ],
        metadata: {
          version: '1.0',
          created_at: new Date().toISOString(),
          description: 'Template untuk import materi'
        }
      };

      const fileName = `template_import_materi_${Date.now()}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(templateData, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal membuat template');
    }
  };

  const getJenjangOptions = () => {
    return cascadeData.data.jenjang.map(item => ({
      label: item.nama_jenjang,
      value: item.id_jenjang.toString(),
      subtitle: item.kode_jenjang
    }));
  };

  const formatOptions = [
    { label: 'JSON Format', value: 'json' },
    { label: 'CSV Format', value: 'csv' },
    { label: 'Excel Format', value: 'xlsx' }
  ];

  const renderImportContent = () => (
    <View>
      <Text style={styles.modeTitle}>Import Materi</Text>
      
      <TouchableOpacity style={styles.fileSelector} onPress={handleFileSelect}>
        <Ionicons name="cloud-upload-outline" size={24} color="#007bff" />
        <Text style={styles.fileSelectorText}>
          {importFile ? importFile.name : 'Pilih File'}
        </Text>
      </TouchableOpacity>

      {importFile && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{importFile.name}</Text>
          <Text style={styles.fileSize}>{Math.round(importFile.size / 1024)} KB</Text>
        </View>
      )}

      <DropdownSelector
        label="Format File"
        value={importFormat}
        onValueChange={setImportFormat}
        options={formatOptions}
        placeholder="Pilih format"
      />

      <DropdownSelector
        label="Target Jenjang (Opsional)"
        value={targetJenjang}
        onValueChange={setTargetJenjang}
        options={getJenjangOptions()}
        placeholder="Semua jenjang"
      />

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setOverwriteExisting(!overwriteExisting)}
      >
        <View style={[styles.checkbox, overwriteExisting && styles.checkboxActive]}>
          {overwriteExisting && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
        <Text style={styles.checkboxLabel}>Timpa data yang sudah ada</Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <ActionButton
          title="Download Template"
          variant="outline"
          onPress={generateTemplate}
          style={styles.templateButton}
          icon="download-outline"
        />
        
        <ActionButton
          title="Import"
          onPress={handleImport}
          loading={loading}
          disabled={!importFile}
          style={styles.importButton}
        />
      </View>
    </View>
  );

  const renderExportContent = () => (
    <View>
      <Text style={styles.modeTitle}>Export Materi</Text>
      
      <View style={styles.exportInfo}>
        <Text style={styles.exportCount}>
          {selectedItems.length} materi akan diekspor
        </Text>
      </View>

      <DropdownSelector
        label="Format Export"
        value={exportFormat}
        onValueChange={setExportFormat}
        options={formatOptions}
        placeholder="Pilih format"
      />

      <View style={styles.exportOptions}>
        <Text style={styles.optionsTitle}>Opsi Export:</Text>
        <Text style={styles.optionItem}>✓ Termasuk informasi dependency</Text>
        <Text style={styles.optionItem}>✓ Termasuk metadata</Text>
        <Text style={styles.optionItem}>✓ Validasi struktur data</Text>
      </View>

      <ActionButton
        title={`Export ${selectedItems.length} Materi`}
        onPress={handleExport}
        loading={loading}
        style={styles.exportButton}
        icon="download-outline"
      />
    </View>
  );

  const renderModeSelector = () => (
    <View>
      <Text style={styles.selectorTitle}>Pilih Operasi</Text>
      
      <TouchableOpacity
        style={styles.modeOption}
        onPress={() => setMode('import')}
      >
        <Ionicons name="cloud-upload-outline" size={32} color="#007bff" />
        <View style={styles.modeContent}>
          <Text style={styles.modeLabel}>Import Materi</Text>
          <Text style={styles.modeDesc}>Import dari file JSON, CSV, atau Excel</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.modeOption}
        onPress={() => setMode('export')}
        disabled={selectedItems.length === 0}
      >
        <Ionicons 
          name="cloud-download-outline" 
          size={32} 
          color={selectedItems.length > 0 ? "#28a745" : "#ccc"} 
        />
        <View style={styles.modeContent}>
          <Text style={[
            styles.modeLabel,
            selectedItems.length === 0 && styles.modeDisabled
          ]}>
            Export Materi
          </Text>
          <Text style={[
            styles.modeDesc,
            selectedItems.length === 0 && styles.modeDisabled
          ]}>
            {selectedItems.length > 0 
              ? `Export ${selectedItems.length} materi terpilih`
              : 'Pilih materi untuk export'
            }
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (mode) {
      case 'import': return renderImportContent();
      case 'export': return renderExportContent();
      default: return renderModeSelector();
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
            <Text style={styles.title}>Import/Export Materi</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {mode && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setMode('')}
              >
                <Ionicons name="chevron-back" size={20} color="#007bff" />
                <Text style={styles.backText}>Kembali</Text>
              </TouchableOpacity>
            )}

            {renderContent()}
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
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%'
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
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12
  },
  modeContent: {
    marginLeft: 16,
    flex: 1
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  modeDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  modeDisabled: {
    color: '#ccc'
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  fileSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#007bff',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16
  },
  fileSelectorText: {
    fontSize: 16,
    color: '#007bff',
    marginLeft: 8
  },
  fileInfo: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff'
  },
  fileSize: {
    fontSize: 12,
    color: '#0c5460'
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  checkboxActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff'
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333'
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12
  },
  templateButton: {
    flex: 1
  },
  importButton: {
    flex: 1
  },
  exportInfo: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  exportCount: {
    fontSize: 14,
    color: '#155724',
    textAlign: 'center'
  },
  exportOptions: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  optionItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  exportButton: {
    marginTop: 8
  }
});

export default MateriImportExport;
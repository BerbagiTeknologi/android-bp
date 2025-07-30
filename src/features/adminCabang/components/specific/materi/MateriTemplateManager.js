import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from '../../shared/ActionButton';
import TextInput from '../../../../../common/components/TextInput';
import DropdownSelector from '../../shared/DropdownSelector';
import { useCascadeData } from '../../../hooks/useCascadeData';

const MateriTemplateManager = ({
  visible,
  onClose,
  sourceItem,
  onCreateTemplate,
  onApplyTemplate,
  templates = [],
  loading = false
}) => {
  const cascadeData = useCascadeData({ autoLoad: true });
  const [mode, setMode] = useState('list'); // 'list', 'create', 'apply'
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [targetKelas, setTargetKelas] = useState('');

  const handleCreateTemplate = () => {
    if (!templateName.trim()) {
      Alert.alert('Error', 'Nama template harus diisi');
      return;
    }

    const templateData = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      source_materi_id: sourceItem?.id_materi,
      mata_pelajaran: sourceItem?.mata_pelajaran,
      kelas: sourceItem?.kelas
    };

    onCreateTemplate(templateData);
    setMode('list');
    setTemplateName('');
    setTemplateDescription('');
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate || !targetKelas) {
      Alert.alert('Error', 'Pilih template dan kelas tujuan');
      return;
    }

    const applyData = {
      template_id: selectedTemplate.id,
      target_kelas_id: parseInt(targetKelas),
      create_variations: true
    };

    Alert.alert(
      'Terapkan Template',
      `Yakin ingin menerapkan template "${selectedTemplate.name}" ke kelas yang dipilih?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Terapkan',
          onPress: () => {
            onApplyTemplate(applyData);
            onClose();
          }
        }
      ]
    );
  };

  const getKelasOptions = () => {
    return cascadeData.data.kelas.map(item => ({
      label: item.nama_kelas,
      value: item.id_kelas.toString(),
      subtitle: `${item.jenjang?.nama_jenjang} - ${item.jenis_kelas}`,
      badge: item.jenjang?.kode_jenjang
    }));
  };

  const renderTemplate = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.templateItem,
        selectedTemplate?.id === item.id && styles.templateSelected
      ]}
      onPress={() => setSelectedTemplate(item)}
    >
      <View style={styles.templateContent}>
        <Text style={styles.templateName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.templateDesc}>{item.description}</Text>
        )}
        <Text style={styles.templateMeta}>
          {item.mata_pelajaran?.nama_mata_pelajaran} - {item.kelas?.nama_kelas}
        </Text>
      </View>
      
      <View style={styles.templateActions}>
        <TouchableOpacity
          style={styles.templateActionButton}
          onPress={() => {
            setSelectedTemplate(item);
            setMode('apply');
          }}
        >
          <Ionicons name="play" size={16} color="#007bff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (mode) {
      case 'create':
        return (
          <View>
            <Text style={styles.modeTitle}>Buat Template Baru</Text>
            <Text style={styles.sourceInfo}>
              Dari: {sourceItem?.nama_materi}
            </Text>
            
            <TextInput
              label="Nama Template *"
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="Contoh: Template Pengenalan Huruf"
            />
            
            <TextInput
              label="Deskripsi"
              value={templateDescription}
              onChangeText={setTemplateDescription}
              placeholder="Deskripsi template (opsional)"
              multiline
              inputProps={{ numberOfLines: 3 }}
            />
            
            <ActionButton
              title="Simpan Template"
              onPress={handleCreateTemplate}
              loading={loading}
              disabled={!templateName.trim()}
              style={styles.actionButton}
            />
          </View>
        );

      case 'apply':
        return (
          <View>
            <Text style={styles.modeTitle}>Terapkan Template</Text>
            {selectedTemplate && (
              <View style={styles.selectedTemplate}>
                <Text style={styles.selectedName}>{selectedTemplate.name}</Text>
                <Text style={styles.selectedDesc}>{selectedTemplate.description}</Text>
              </View>
            )}
            
            <DropdownSelector
              label="Kelas Tujuan"
              value={targetKelas}
              onValueChange={setTargetKelas}
              options={getKelasOptions()}
              placeholder="Pilih kelas tujuan"
              searchable
            />
            
            <ActionButton
              title="Terapkan Template"
              onPress={handleApplyTemplate}
              loading={loading}
              disabled={!selectedTemplate || !targetKelas}
              style={styles.actionButton}
            />
          </View>
        );

      default:
        return (
          <View>
            <View style={styles.modeActions}>
              {sourceItem && (
                <ActionButton
                  title="Buat Template"
                  icon="add"
                  onPress={() => setMode('create')}
                  style={styles.modeButton}
                />
              )}
              
              <ActionButton
                title="Terapkan Template"
                icon="play"
                variant="outline"
                onPress={() => setMode('apply')}
                disabled={templates.length === 0}
                style={styles.modeButton}
              />
            </View>

            <View style={styles.templateList}>
              <Text style={styles.listTitle}>
                Template Tersedia ({templates.length})
              </Text>
              
              {templates.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>Belum ada template</Text>
                  {sourceItem && (
                    <Text style={styles.emptySubtext}>
                      Buat template dari materi ini
                    </Text>
                  )}
                </View>
              ) : (
                <FlatList
                  data={templates}
                  renderItem={renderTemplate}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
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
            <Text style={styles.title}>Template Materi</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {mode !== 'list' && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setMode('list')}
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
    maxHeight: '80%',
    overflow: 'hidden'
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
    padding: 20,
    maxHeight: 500
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
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  sourceInfo: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16
  },
  actionButton: {
    marginTop: 16
  },
  selectedTemplate: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff'
  },
  selectedDesc: {
    fontSize: 12,
    color: '#0c5460',
    marginTop: 2
  },
  modeActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12
  },
  modeButton: {
    flex: 1
  },
  templateList: {
    flex: 1
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  list: {
    maxHeight: 300
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  templateSelected: {
    backgroundColor: '#e7f3ff',
    borderColor: '#007bff',
    borderWidth: 1
  },
  templateContent: {
    flex: 1
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  templateDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  templateMeta: {
    fontSize: 10,
    color: '#999',
    marginTop: 4
  },
  templateActions: {
    flexDirection: 'row'
  },
  templateActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#cce5ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  }
});

export default MateriTemplateManager;
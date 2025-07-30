import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from './SearchBar';

const MultiFieldSearch = ({
  value,
  onSearch,
  searchFields = [],
  placeholder = 'Cari di semua field...',
  showFieldSelector = true,
  style
}) => {
  const [selectedFields, setSelectedFields] = useState(searchFields.map(f => f.key));
  const [showFieldMenu, setShowFieldMenu] = useState(false);

  const handleSearch = useCallback((searchText) => {
    const searchData = {
      query: searchText,
      fields: selectedFields,
      searchType: selectedFields.length === searchFields.length ? 'all' : 'selected'
    };
    onSearch(searchData);
  }, [selectedFields, searchFields.length, onSearch]);

  const toggleField = (fieldKey) => {
    setSelectedFields(prev => {
      const newFields = prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey];
      return newFields.length === 0 ? [fieldKey] : newFields;
    });
  };

  const selectAllFields = () => {
    setSelectedFields(searchFields.map(f => f.key));
  };

  const clearAllFields = () => {
    setSelectedFields([searchFields[0]?.key].filter(Boolean));
  };

  const getActiveFieldsText = () => {
    if (selectedFields.length === searchFields.length) {
      return 'Semua field';
    }
    
    const fieldNames = selectedFields
      .map(key => searchFields.find(f => f.key === key)?.label)
      .filter(Boolean);
    
    return fieldNames.length > 2 
      ? `${fieldNames.slice(0, 2).join(', ')} +${fieldNames.length - 2}`
      : fieldNames.join(', ');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchRow}>
        <SearchBar
          value={value}
          onChangeText={handleSearch}
          placeholder={placeholder}
          style={styles.searchBar}
        />
        
        {showFieldSelector && (
          <TouchableOpacity
            style={styles.fieldButton}
            onPress={() => setShowFieldMenu(!showFieldMenu)}
          >
            <Ionicons 
              name="options" 
              size={20} 
              color="#007bff" 
            />
          </TouchableOpacity>
        )}
      </View>

      {showFieldSelector && (
        <Text style={styles.fieldInfo}>
          Mencari di: {getActiveFieldsText()}
        </Text>
      )}

      {showFieldMenu && (
        <View style={styles.fieldMenu}>
          <View style={styles.fieldMenuHeader}>
            <Text style={styles.fieldMenuTitle}>Pilih Field Pencarian</Text>
            <View style={styles.fieldMenuActions}>
              <TouchableOpacity onPress={selectAllFields}>
                <Text style={styles.fieldMenuAction}>Semua</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearAllFields}>
                <Text style={styles.fieldMenuAction}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {searchFields.map((field) => (
            <TouchableOpacity
              key={field.key}
              style={styles.fieldItem}
              onPress={() => toggleField(field.key)}
            >
              <View style={styles.fieldItemContent}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {field.description && (
                  <Text style={styles.fieldDescription}>{field.description}</Text>
                )}
              </View>
              
              <View style={[
                styles.checkbox,
                selectedFields.includes(field.key) && styles.checkboxActive
              ]}>
                {selectedFields.includes(field.key) && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchBar: {
    flex: 1,
    marginRight: 8
  },
  fieldButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  fieldInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4
  },
  fieldMenu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4
  },
  fieldMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  fieldMenuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  fieldMenuActions: {
    flexDirection: 'row',
    gap: 12
  },
  fieldMenuAction: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600'
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  fieldItemContent: {
    flex: 1
  },
  fieldLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  fieldDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff'
  }
});

export default MultiFieldSearch;
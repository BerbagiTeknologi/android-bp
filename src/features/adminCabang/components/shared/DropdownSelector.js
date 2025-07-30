// src/features/adminCabang/components/shared/DropdownSelector.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, TextInput,
  ActivityIndicator, StyleSheet, Animated, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStoreSelectors } from '../../stores';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * DropdownSelector - General purpose dropdown dengan Zustand integration
 * For single entity selection without cascade dependencies
 */
const DropdownSelector = ({
  // Data props
  options = [], // Array of {label, value, subtitle?, badge?, data?}
  value,
  onValueChange,
  
  // UI props
  placeholder = 'Pilih...',
  disabled = false,
  required = false,
  showSearch = true,
  allowClear = true,
  multiSelect = false,
  
  // Styling
  style, containerStyle, dropdownStyle, textStyle, errorStyle,
  
  // Validation
  error, onValidationChange,
  
  // Performance
  virtualizeList = true,
  debounceMs = 300,
  maxHeight = SCREEN_HEIGHT * 0.4,
  
  // Custom rendering
  renderOption, renderSelectedValue, renderSeparator,
  
  // Events
  onOpen, onClose, onSearch, onLoadMore,
  
  // Loading state
  loading = false,
  loadingText = 'Memuat...',
  
  // Empty state
  emptyText = 'Tidak ada data',
  searchEmptyText = 'Tidak ada hasil pencarian'
}) => {
  // ==================== STATE ====================
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [animationValue] = useState(new Animated.Value(0));
  
  // ==================== COMPUTED VALUES ====================
  const currentOptions = useMemo(() => {
    if (multiSelect) {
      const values = Array.isArray(value) ? value : [value].filter(Boolean);
      return options.filter(opt => values.includes(opt.value));
    }
    return options.find(opt => opt.value?.toString() === value?.toString()) || null;
  }, [options, value, multiSelect]);
  
  const isDisabled = disabled || loading;
  
  // ==================== SEARCH LOGIC ====================
  const filterOptions = useCallback((text) => {
    if (!text.trim()) {
      setFilteredOptions(options);
      return;
    }
    
    const filtered = options.filter(option => 
      option.label?.toLowerCase().includes(text.toLowerCase()) ||
      option.subtitle?.toLowerCase().includes(text.toLowerCase()) ||
      option.badge?.toLowerCase().includes(text.toLowerCase()) ||
      option.value?.toString().toLowerCase().includes(text.toLowerCase())
    );
    
    setFilteredOptions(filtered);
    onSearch?.(text, filtered);
  }, [options, onSearch]);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => filterOptions(searchText), debounceMs);
    return () => clearTimeout(timer);
  }, [searchText, filterOptions, debounceMs]);
  
  // Update filtered options when options change
  useEffect(() => {
    if (!searchText) {
      setFilteredOptions(options);
    } else {
      filterOptions(searchText);
    }
  }, [options, searchText, filterOptions]);
  
  // ==================== HANDLERS ====================
  const handleOpen = useCallback(() => {
    if (isDisabled) return;
    
    setIsOpen(true);
    setSearchText('');
    setFilteredOptions(options);
    
    Animated.timing(animationValue, {
      toValue: 1, duration: 200, useNativeDriver: true
    }).start();
    
    onOpen?.();
  }, [isDisabled, options, animationValue, onOpen]);
  
  const handleClose = useCallback(() => {
    Animated.timing(animationValue, {
      toValue: 0, duration: 150, useNativeDriver: true
    }).start(() => {
      setIsOpen(false);
      setSearchText('');
    });
    onClose?.();
  }, [animationValue, onClose]);
  
  const handleSelect = useCallback((option) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      
      onValueChange?.(newValues, options.filter(opt => newValues.includes(opt.value)));
    } else {
      onValueChange?.(option.value, option);
      handleClose();
    }
  }, [multiSelect, value, onValueChange, options, handleClose]);
  
  const handleClear = useCallback(() => {
    onValueChange?.(multiSelect ? [] : null, multiSelect ? [] : null);
  }, [onValueChange, multiSelect]);
  
  // ==================== RENDER FUNCTIONS ====================
  const renderSelectedDisplay = () => {
    if (renderSelectedValue && currentOptions) {
      return renderSelectedValue(currentOptions);
    }
    
    if (loading) {
      return <Text style={[styles.loadingText, textStyle]}>{loadingText}</Text>;
    }
    
    if (multiSelect && Array.isArray(currentOptions)) {
      if (currentOptions.length === 0) {
        return <Text style={[styles.placeholderText, textStyle]}>{placeholder}</Text>;
      }
      
      if (currentOptions.length === 1) {
        return (
          <Text style={[styles.selectedText, textStyle]} numberOfLines={1}>
            {currentOptions[0].label}
          </Text>
        );
      }
      
      return (
        <Text style={[styles.selectedText, textStyle]} numberOfLines={1}>
          {currentOptions.length} item dipilih
        </Text>
      );
    }
    
    if (currentOptions && !multiSelect) {
      return (
        <View style={styles.selectedContent}>
          <Text style={[styles.selectedText, textStyle]} numberOfLines={1}>
            {currentOptions.label}
          </Text>
          {currentOptions.subtitle && (
            <Text style={styles.selectedSubtitle} numberOfLines={1}>
              {currentOptions.subtitle}
            </Text>
          )}
          {currentOptions.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{currentOptions.badge}</Text>
            </View>
          )}
        </View>
      );
    }
    
    return <Text style={[styles.placeholderText, textStyle]}>{placeholder}</Text>;
  };
  
  const renderOptionItem = ({ item, index }) => {
    if (renderOption) {
      return renderOption(item, index, handleSelect);
    }
    
    const isSelected = multiSelect 
      ? (Array.isArray(value) ? value : []).includes(item.value)
      : item.value?.toString() === value?.toString();
    
    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.selectedOption]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionLabel} numberOfLines={1}>
            {item.label}
          </Text>
          {item.subtitle && (
            <Text style={styles.optionSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
        </View>
        
        {item.badge && (
          <View style={styles.optionBadge}>
            <Text style={styles.optionBadgeText}>{item.badge}</Text>
          </View>
        )}
        
        {isSelected && (
          <Ionicons 
            name={multiSelect ? "checkbox" : "checkmark"} 
            size={20} 
            color="#007bff" 
          />
        )}
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={48} color="#ccc" />
      <Text style={styles.emptyText}>
        {searchText ? searchEmptyText : emptyText}
      </Text>
    </View>
  );
  
  const getDisplayValue = () => {
    if (multiSelect) {
      const count = Array.isArray(value) ? value.length : 0;
      return count > 0;
    }
    return !!currentOptions;
  };
  
  // ==================== RENDER ====================
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={[
          styles.trigger, style,
          isDisabled && styles.disabled,
          error && styles.error
        ]}
        onPress={handleOpen}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <View style={styles.triggerContent}>
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : (
            renderSelectedDisplay()
          )}
        </View>
        
        <View style={styles.triggerActions}>
          {allowClear && getDisplayValue() && !isDisabled && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
          
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color={isDisabled ? "#ccc" : "#666"}
          />
        </View>
      </TouchableOpacity>
      
      {/* Required indicator */}
      {required && <Text style={styles.required}>*</Text>}
      
      {/* Error message */}
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
      
      {/* Dropdown Modal */}
      <Modal visible={isOpen} transparent animationType="none" onRequestClose={handleClose}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
          <Animated.View
            style={[
              styles.dropdown, dropdownStyle,
              {
                opacity: animationValue,
                transform: [{
                  scale: animationValue.interpolate({
                    inputRange: [0, 1], outputRange: [0.95, 1]
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Search Input */}
              {showSearch && (
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color="#666" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Cari..."
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}
              
              {/* Multi-select header */}
              {multiSelect && (
                <View style={styles.multiSelectHeader}>
                  <Text style={styles.multiSelectText}>
                    {Array.isArray(value) ? value.length : 0} dari {options.length} dipilih
                  </Text>
                  {Array.isArray(value) && value.length > 0 && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearAll}>
                      <Text style={styles.clearAllText}>Bersihkan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              
              {/* Options List */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007bff" />
                  <Text style={styles.loadingText}>{loadingText}</Text>
                </View>
              ) : filteredOptions.length > 0 ? (
                <FlatList
                  data={filteredOptions}
                  renderItem={renderOptionItem}
                  keyExtractor={(item, index) => `${item.value}_${index}`}
                  style={[styles.optionsList, { maxHeight }]}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={virtualizeList}
                  initialNumToRender={10}
                  windowSize={5}
                  ItemSeparatorComponent={renderSeparator}
                  onEndReached={onLoadMore}
                  onEndReachedThreshold={0.1}
                />
              ) : (
                renderEmptyState()
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { position: 'relative' },
  trigger: {
    flexDirection: 'row', alignItems: 'center', minHeight: 48,
    paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, backgroundColor: '#fff'
  },
  disabled: { backgroundColor: '#f5f5f5', borderColor: '#e0e0e0' },
  error: { borderColor: '#dc3545' },
  triggerContent: { flex: 1, justifyContent: 'center' },
  triggerActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  clearButton: { marginRight: 8 },
  selectedContent: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  selectedText: { fontSize: 16, color: '#333', marginRight: 8 },
  selectedSubtitle: { fontSize: 12, color: '#666', marginRight: 8 },
  badge: { backgroundColor: '#e3f2fd', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 10, color: '#1976d2', fontWeight: '500' },
  placeholderText: { fontSize: 16, color: '#999' },
  loadingText: { fontSize: 16, color: '#666' },
  required: { position: 'absolute', top: -5, right: -5, color: '#dc3545', fontSize: 18, fontWeight: 'bold' },
  errorText: { marginTop: 4, fontSize: 12, color: '#dc3545' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  dropdown: {
    backgroundColor: '#fff', borderRadius: 12, maxWidth: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.6, elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#333' },
  multiSelectHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  multiSelectText: { fontSize: 14, color: '#666' },
  clearAll: { paddingHorizontal: 8, paddingVertical: 4 },
  clearAllText: { fontSize: 14, color: '#007bff' },
  optionsList: {},
  option: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  selectedOption: { backgroundColor: '#f8f9fa' },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: 16, color: '#333', marginBottom: 2 },
  optionSubtitle: { fontSize: 12, color: '#666' },
  optionBadge: {
    backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, marginRight: 8
  },
  optionBadgeText: { fontSize: 10, color: '#1976d2', fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 12, textAlign: 'center' },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
});

export default DropdownSelector;
// src/features/adminCabang/components/shared/CascadeDropdown.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCascadeStore, useUIStore, useStoreSelectors } from '../../stores';
import { ENTITIES } from '../../stores/masterDataStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * CascadeDropdown - Multi-level dropdown dengan Zustand integration
 * Supports: Jenjang → MataPelajaran → Kelas → Materi cascade logic
 */
const CascadeDropdown = ({
  // Required props
  entityType, // ENTITIES.JENJANG, MATA_PELAJARAN, KELAS, MATERI
  value, // Selected value ID
  onValueChange, // (value, option) => void
  
  // Optional props
  placeholder = 'Pilih...',
  disabled = false,
  required = false,
  showSearch = true,
  allowClear = true,
  
  // Cascade dependencies
  dependsOn = null, // { jenjang: id, mataPelajaran: id, kelas: id }
  
  // Styling
  style,
  containerStyle,
  dropdownStyle,
  textStyle,
  errorStyle,
  
  // Validation
  error,
  onValidationChange,
  
  // Performance
  virtualizeList = true,
  debounceMs = 300,
  
  // Custom rendering
  renderOption,
  renderSelectedValue,
  
  // Events
  onOpen,
  onClose,
  onSearch
}) => {
  // ==================== ZUSTAND STORES ====================
  const cascadeActions = useStoreSelectors.cascade.actions();
  const uiActions = useStoreSelectors.ui.actions();
  
  const loading = useStoreSelectors.ui.loading(entityType, 'dropdown');
  const error_state = useStoreSelectors.ui.error(entityType);
  
  // Get options based on entity type and dependencies
  const options = useMemo(() => {
    switch (entityType) {
      case ENTITIES.JENJANG:
        return useStoreSelectors.cascade.jenjangOptions();
      case ENTITIES.MATA_PELAJARAN:
        return useStoreSelectors.cascade.mataPelajaranOptions(dependsOn?.jenjang);
      case ENTITIES.KELAS:
        return useStoreSelectors.cascade.kelasOptions(dependsOn?.jenjang);
      case ENTITIES.MATERI:
        return useStoreSelectors.cascade.materiOptions(dependsOn?.mataPelajaran, dependsOn?.kelas);
      default:
        return [];
    }
  }, [entityType, dependsOn]);
  
  // ==================== LOCAL STATE ====================
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [animationValue] = useState(new Animated.Value(0));
  
  // ==================== COMPUTED VALUES ====================
  
  // Get selected option details
  const currentOption = useMemo(() => {
    return options.find(opt => opt.value?.toString() === value?.toString()) || null;
  }, [options, value]);
  
  // Check if dropdown should be disabled based on dependencies
  const isDisabledByDependency = useMemo(() => {
    if (entityType === ENTITIES.MATA_PELAJARAN || entityType === ENTITIES.KELAS) {
      return !dependsOn?.jenjang;
    }
    if (entityType === ENTITIES.MATERI) {
      return !dependsOn?.mataPelajaran || !dependsOn?.kelas;
    }
    return false;
  }, [entityType, dependsOn]);
  
  const isDropdownDisabled = disabled || isDisabledByDependency;
  
  // ==================== SEARCH LOGIC ====================
  
  const filterOptions = useCallback((text) => {
    if (!text.trim()) {
      setFilteredOptions(options);
      return;
    }
    
    const filtered = options.filter(option => 
      option.label?.toLowerCase().includes(text.toLowerCase()) ||
      option.subtitle?.toLowerCase().includes(text.toLowerCase()) ||
      option.badge?.toLowerCase().includes(text.toLowerCase())
    );
    
    setFilteredOptions(filtered);
    onSearch?.(text, filtered);
  }, [options, onSearch]);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      filterOptions(searchText);
    }, debounceMs);
    
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
    if (isDropdownDisabled) return;
    
    setIsOpen(true);
    setSearchText('');
    setFilteredOptions(options);
    
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
    
    onOpen?.();
  }, [isDropdownDisabled, options, animationValue, onOpen]);
  
  const handleClose = useCallback(() => {
    Animated.timing(animationValue, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true
    }).start(() => {
      setIsOpen(false);
      setSearchText('');
    });
    
    onClose?.();
  }, [animationValue, onClose]);
  
  const handleSelect = useCallback((option) => {
    setSelectedOption(option);
    onValueChange?.(option.value, option);
    
    // Update cascade store if this selection affects dependent dropdowns
    if (entityType === ENTITIES.JENJANG) {
      cascadeActions.setSelected('jenjang', option.value);
    } else if (entityType === ENTITIES.MATA_PELAJARAN) {
      cascadeActions.setSelected('mataPelajaran', option.value);
    } else if (entityType === ENTITIES.KELAS) {
      cascadeActions.setSelected('kelas', option.value);
    } else if (entityType === ENTITIES.MATERI) {
      cascadeActions.setSelected('materi', option.value);
    }
    
    handleClose();
  }, [onValueChange, entityType, cascadeActions, handleClose]);
  
  const handleClear = useCallback(() => {
    setSelectedOption(null);
    onValueChange?.(null, null);
    
    // Clear cascade dependencies
    if (entityType === ENTITIES.JENJANG) {
      cascadeActions.setSelected('jenjang', null);
    } else if (entityType === ENTITIES.MATA_PELAJARAN) {
      cascadeActions.setSelected('mataPelajaran', null);
    } else if (entityType === ENTITIES.KELAS) {
      cascadeActions.setSelected('kelas', null);
    } else if (entityType === ENTITIES.MATERI) {
      cascadeActions.setSelected('materi', null);
    }
  }, [onValueChange, entityType, cascadeActions]);
  
  // ==================== RENDER FUNCTIONS ====================
  
  const renderSelectedDisplay = () => {
    if (renderSelectedValue && currentOption) {
      return renderSelectedValue(currentOption);
    }
    
    if (currentOption) {
      return (
        <View style={styles.selectedContent}>
          <Text style={[styles.selectedText, textStyle]} numberOfLines={1}>
            {currentOption.label}
          </Text>
          {currentOption.subtitle && (
            <Text style={styles.selectedSubtitle} numberOfLines={1}>
              {currentOption.subtitle}
            </Text>
          )}
          {currentOption.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{currentOption.badge}</Text>
            </View>
          )}
        </View>
      );
    }
    
    return (
      <Text style={[styles.placeholderText, textStyle]}>
        {isDisabledByDependency ? getDependencyMessage() : placeholder}
      </Text>
    );
  };
  
  const getDependencyMessage = () => {
    if (entityType === ENTITIES.MATA_PELAJARAN || entityType === ENTITIES.KELAS) {
      return 'Pilih jenjang terlebih dahulu';
    }
    if (entityType === ENTITIES.MATERI) {
      return 'Pilih mata pelajaran dan kelas terlebih dahulu';
    }
    return placeholder;
  };
  
  const renderOptionItem = ({ item, index }) => {
    if (renderOption) {
      return renderOption(item, index, handleSelect);
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.option,
          item.value?.toString() === value?.toString() && styles.selectedOption
        ]}
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
        
        {item.value?.toString() === value?.toString() && (
          <Ionicons name="checkmark" size={20} color="#007bff" />
        )}
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={48} color="#ccc" />
      <Text style={styles.emptyText}>
        {searchText ? 'Tidak ada hasil pencarian' : 'Tidak ada data tersedia'}
      </Text>
      {isDisabledByDependency && (
        <Text style={styles.emptySubtext}>
          {getDependencyMessage()}
        </Text>
      )}
    </View>
  );
  
  // ==================== RENDER ====================
  
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={[
          styles.trigger,
          style,
          isDropdownDisabled && styles.disabled,
          error && styles.error
        ]}
        onPress={handleOpen}
        disabled={isDropdownDisabled}
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
          {allowClear && currentOption && !isDropdownDisabled && (
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
            color={isDropdownDisabled ? "#ccc" : "#666"}
          />
        </View>
      </TouchableOpacity>
      
      {/* Required indicator */}
      {required && (
        <Text style={styles.required}>*</Text>
      )}
      
      {/* Error message */}
      {(error || error_state) && (
        <Text style={[styles.errorText, errorStyle]}>
          {error || error_state}
        </Text>
      )}
      
      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.dropdown,
              dropdownStyle,
              {
                opacity: animationValue,
                transform: [{
                  scale: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1]
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
              
              {/* Options List */}
              {filteredOptions.length > 0 ? (
                <FlatList
                  data={filteredOptions}
                  renderItem={renderOptionItem}
                  keyExtractor={(item, index) => `${item.value}_${index}`}
                  style={styles.optionsList}
                  maxHeight={SCREEN_HEIGHT * 0.4}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={virtualizeList}
                  initialNumToRender={10}
                  windowSize={5}
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
  container: {
    position: 'relative'
  },
  
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  
  disabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0'
  },
  
  error: {
    borderColor: '#dc3545'
  },
  
  triggerContent: {
    flex: 1,
    justifyContent: 'center'
  },
  
  triggerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8
  },
  
  clearButton: {
    marginRight: 8
  },
  
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  
  selectedText: {
    fontSize: 16,
    color: '#333',
    marginRight: 8
  },
  
  selectedSubtitle: {
    fontSize: 12,
    color: '#666',
    marginRight: 8
  },
  
  badge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12
  },
  
  badgeText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '500'
  },
  
  placeholderText: {
    fontSize: 16,
    color: '#999'
  },
  
  required: {
    position: 'absolute',
    top: -5,
    right: -5,
    color: '#dc3545',
    fontSize: 18,
    fontWeight: 'bold'
  },
  
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#dc3545'
  },
  
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxWidth: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333'
  },
  
  optionsList: {
    maxHeight: SCREEN_HEIGHT * 0.4
  },
  
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  
  selectedOption: {
    backgroundColor: '#f8f9fa'
  },
  
  optionContent: {
    flex: 1
  },
  
  optionLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2
  },
  
  optionSubtitle: {
    fontSize: 12,
    color: '#666'
  },
  
  optionBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8
  },
  
  optionBadgeText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '500'
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center'
  },
  
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  }
});

export default CascadeDropdown;
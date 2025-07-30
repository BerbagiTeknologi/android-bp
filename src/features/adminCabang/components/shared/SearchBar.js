// src/features/adminCabang/components/shared/SearchBar.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, FlatList, Text,
  StyleSheet, Animated, Keyboard, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStoreSelectors } from '../../stores';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * SearchBar - Real-time search dengan Zustand integration dan history
 * Connects to cascadeStore filters and provides search functionality
 */
const SearchBar = ({
  // Core props
  value = '',
  onValueChange,
  onSearch,
  onClear,
  
  // UI props
  placeholder = 'Cari...',
  disabled = false,
  autoFocus = false,
  showHistory = true,
  showSuggestions = true,
  
  // Styling
  style,
  containerStyle,
  inputStyle,
  historyStyle,
  
  // Behavior
  debounceMs = 300,
  minLength = 2,
  maxHistory = 10,
  maxSuggestions = 5,
  
  // Storage
  historyKey = 'adminCabang_search_history',
  
  // Events
  onFocus,
  onBlur,
  onHistorySelect,
  onSuggestionSelect,
  
  // Custom rendering
  renderHistoryItem,
  renderSuggestionItem,
  
  // Filter integration
  entityType,
  applyToStore = true
}) => {
  // ==================== ZUSTAND STORES ====================
  const cascadeActions = useStoreSelectors.cascade.actions();
  const currentFilters = useStoreSelectors.cascade.filters();
  
  // ==================== STATE ====================
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const animationValue = useRef(new Animated.Value(0)).current;
  
  // ==================== EFFECTS ====================
  
  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);
  
  // Sync with prop value
  useEffect(() => {
    if (value !== searchValue) {
      setSearchValue(value);
    }
  }, [value]);
  
  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);
  
  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      handleDebouncedSearch(searchValue);
    }, debounceMs);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchValue, debounceMs]);
  
  // ==================== HANDLERS ====================
  
  const loadSearchHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(historyKey);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  };
  
  const saveSearchHistory = async (newHistory) => {
    try {
      await AsyncStorage.setItem(historyKey, JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  };
  
  const addToHistory = useCallback((searchText) => {
    if (!searchText.trim() || searchText.length < minLength) return;
    
    const newHistory = [
      searchText,
      ...searchHistory.filter(item => item !== searchText)
    ].slice(0, maxHistory);
    
    saveSearchHistory(newHistory);
  }, [searchHistory, minLength, maxHistory]);
  
  const handleDebouncedSearch = useCallback((text) => {
    // Apply to cascade store if enabled
    if (applyToStore) {
      cascadeActions.setFilter('search', text);
    }
    
    // Call external search handler
    onSearch?.(text);
    
    // Generate suggestions based on history and current text
    if (text.length >= minLength) {
      const filtered = searchHistory
        .filter(item => 
          item.toLowerCase().includes(text.toLowerCase()) && 
          item !== text
        )
        .slice(0, maxSuggestions);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [applyToStore, cascadeActions, onSearch, searchHistory, minLength, maxSuggestions]);
  
  const handleChangeText = useCallback((text) => {
    setSearchValue(text);
    onValueChange?.(text);
  }, [onValueChange]);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowDropdown(showHistory || showSuggestions);
    
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false
    }).start();
    
    onFocus?.(searchValue);
  }, [showHistory, showSuggestions, animationValue, onFocus, searchValue]);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    
    // Delay hiding dropdown to allow for item selection
    setTimeout(() => {
      setShowDropdown(false);
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false
      }).start();
    }, 150);
    
    onBlur?.(searchValue);
  }, [animationValue, onBlur, searchValue]);
  
  const handleSearch = useCallback(() => {
    if (searchValue.trim()) {
      addToHistory(searchValue.trim());
      handleDebouncedSearch(searchValue.trim());
      Keyboard.dismiss();
      inputRef.current?.blur();
    }
  }, [searchValue, addToHistory, handleDebouncedSearch]);
  
  const handleClear = useCallback(() => {
    setSearchValue('');
    setSuggestions([]);
    
    if (applyToStore) {
      cascadeActions.setFilter('search', '');
    }
    
    onValueChange?.('');
    onClear?.();
    inputRef.current?.focus();
  }, [applyToStore, cascadeActions, onValueChange, onClear]);
  
  const handleHistorySelect = useCallback((item) => {
    setSearchValue(item);
    setShowDropdown(false);
    
    onValueChange?.(item);
    onHistorySelect?.(item);
    handleDebouncedSearch(item);
    
    Keyboard.dismiss();
    inputRef.current?.blur();
  }, [onValueChange, onHistorySelect, handleDebouncedSearch]);
  
  const handleSuggestionSelect = useCallback((item) => {
    setSearchValue(item);
    setShowDropdown(false);
    
    onValueChange?.(item);
    onSuggestionSelect?.(item);
    addToHistory(item);
    handleDebouncedSearch(item);
    
    Keyboard.dismiss();
    inputRef.current?.blur();
  }, [onValueChange, onSuggestionSelect, addToHistory, handleDebouncedSearch]);
  
  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(historyKey);
      setSearchHistory([]);
    } catch (error) {
      console.warn('Failed to clear history:', error);
    }
  }, [historyKey]);
  
  // ==================== RENDER FUNCTIONS ====================
  
  const renderHistoryItem = useCallback(({ item, index }) => {
    if (renderHistoryItem) {
      return renderHistoryItem(item, index, handleHistorySelect);
    }
    
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => handleHistorySelect(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.dropdownItemText} numberOfLines={1}>
          {item}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            const newHistory = searchHistory.filter(h => h !== item);
            saveSearchHistory(newHistory);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={14} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [renderHistoryItem, handleHistorySelect, searchHistory]);
  
  const renderSuggestionItem = useCallback(({ item, index }) => {
    if (renderSuggestionItem) {
      return renderSuggestionItem(item, index, handleSuggestionSelect);
    }
    
    return (
      <TouchableOpacity
        style={styles.dropdownItem}
        onPress={() => handleSuggestionSelect(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="search-outline" size={16} color="#666" />
        <Text style={styles.dropdownItemText} numberOfLines={1}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  }, [renderSuggestionItem, handleSuggestionSelect]);
  
  const getDropdownData = () => {
    const data = [];
    
    if (isFocused && searchValue.length < minLength && searchHistory.length > 0) {
      // Show history when no search text
      data.push(
        { type: 'header', title: 'Pencarian Terakhir' },
        ...searchHistory.slice(0, 5).map(item => ({ type: 'history', item }))
      );
      
      if (searchHistory.length > 0) {
        data.push({ type: 'action', title: 'Hapus Riwayat', action: clearHistory });
      }
    } else if (suggestions.length > 0) {
      // Show suggestions when searching
      data.push(
        { type: 'header', title: 'Saran' },
        ...suggestions.map(item => ({ type: 'suggestion', item }))
      );
    }
    
    return data;
  };
  
  const renderDropdownItem = ({ item, index }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.dropdownHeader}>
          <Text style={styles.dropdownHeaderText}>{item.title}</Text>
        </View>
      );
    }
    
    if (item.type === 'action') {
      return (
        <TouchableOpacity
          style={styles.dropdownAction}
          onPress={item.action}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownActionText}>{item.title}</Text>
        </TouchableOpacity>
      );
    }
    
    if (item.type === 'history') {
      return renderHistoryItem({ item: item.item, index });
    }
    
    if (item.type === 'suggestion') {
      return renderSuggestionItem({ item: item.item, index });
    }
    
    return null;
  };
  
  // ==================== RENDER ====================
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.searchContainer, style, isFocused && styles.focused]}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        
        <TextInput
          ref={inputRef}
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          value={searchValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSearch}
          editable={!disabled}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
        />
        
        {searchValue.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Dropdown */}
      {showDropdown && (
        <Animated.View
          style={[
            styles.dropdown,
            historyStyle,
            {
              opacity: animationValue,
              maxHeight: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300]
              })
            }
          ]}
        >
          <FlatList
            data={getDropdownData()}
            renderItem={renderDropdownItem}
            keyExtractor={(item, index) => `${item.type}_${index}`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </Animated.View>
      )}
    </View>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { position: 'relative', zIndex: 1000 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa',
    borderRadius: 25, paddingHorizontal: 15, minHeight: 44,
    borderWidth: 1, borderColor: 'transparent'
  },
  focused: { borderColor: '#007bff', backgroundColor: '#fff' },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 8 },
  clearButton: { marginLeft: 10 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 12, marginTop: 4,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, maxHeight: 300, overflow: 'hidden'
  },
  dropdownHeader: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  dropdownHeaderText: { fontSize: 12, color: '#999', fontWeight: '600' },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8f9fa'
  },
  dropdownItemText: { flex: 1, marginLeft: 10, fontSize: 14, color: '#333' },
  removeButton: { padding: 4 },
  dropdownAction: {
    paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#f0f0f0'
  },
  dropdownActionText: { fontSize: 14, color: '#007bff' }
});

export default SearchBar;
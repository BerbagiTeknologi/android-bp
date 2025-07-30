import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ActionButton = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, danger, outline
  size = 'medium', // small, medium, large
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle
}) => {
  const getButtonStyle = () => {
    let baseStyle = [styles.button, styles[size]];
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    } else {
      baseStyle.push(styles[variant]);
    }
    
    if (style) baseStyle.push(style);
    return baseStyle;
  };

  const getTextStyle = () => {
    let baseStyle = [styles.text, styles[`${size}Text`]];
    
    if (disabled || loading) {
      baseStyle.push(styles.disabledText);
    } else {
      baseStyle.push(styles[`${variant}Text`]);
    }
    
    if (textStyle) baseStyle.push(textStyle);
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? '#007bff' : '#fff'} 
        />
      ) : (
        <>
          {icon && (
            <Ionicons 
              name={icon} 
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
              color={getTextStyle()[getTextStyle().length - 1]?.color || '#fff'}
              style={title ? styles.iconWithText : null}
            />
          )}
          {title && <Text style={getTextStyle()}>{title}</Text>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  
  // Sizes
  small: { paddingVertical: 8, minHeight: 32 },
  medium: { paddingVertical: 12, minHeight: 44 },
  large: { paddingVertical: 16, minHeight: 52 },
  
  // Variants
  primary: { backgroundColor: '#007bff' },
  secondary: { backgroundColor: '#6c757d' },
  danger: { backgroundColor: '#dc3545' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007bff' },
  
  // Disabled
  disabled: { backgroundColor: '#e9ecef', opacity: 0.6 },
  
  // Text styles
  text: { fontWeight: '600' },
  smallText: { fontSize: 14 },
  mediumText: { fontSize: 16 },
  largeText: { fontSize: 18 },
  
  // Text variants
  primaryText: { color: '#fff' },
  secondaryText: { color: '#fff' },
  dangerText: { color: '#fff' },
  outlineText: { color: '#007bff' },
  disabledText: { color: '#6c757d' },
  
  // Icon spacing
  iconWithText: { marginRight: 8 }
});

export default ActionButton;
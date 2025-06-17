import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.7;

const QrScanner = ({ onScan, onClose, isLoading = false }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Check permissions every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkPermission = async () => {
        await requestPermission();
      };
      
      checkPermission();
    }, [requestPermission])
  );

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned || isLoading) return;
    
    setScanned(true);
    
    try {
      // Try to parse as JSON
      const qrData = JSON.parse(data);
      onScan(qrData);
    } catch (error) {
      // If not JSON, check for token format
      if (data.includes('token')) {
        try {
          const tokenMatch = data.match(/"token":"([^"]+)"/);
          if (tokenMatch && tokenMatch[1]) {
            onScan({ token: tokenMatch[1] });
            return;
          }
        } catch (err) {
          console.error('Error extracting token:', err);
        }
      }
      
      // Default fallback
      onScan({ token: data });
    }
    
    // Reset scanned state after delay
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr']
        }}
        facing="back"
      />
      
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
            {/* Scanner corners */}
            <View style={[styles.cornerTopLeft, styles.corner]} />
            <View style={[styles.cornerTopRight, styles.corner]} />
            <View style={[styles.cornerBottomLeft, styles.corner]} />
            <View style={[styles.cornerBottomRight, styles.corner]} />
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}>
          <Text style={styles.scanText}>Position QR code within frame</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
      >
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5,
  },
  focusedContainer: {
    flex: 6,
    height: SCANNER_SIZE,
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
  }
});

export default QrScanner;
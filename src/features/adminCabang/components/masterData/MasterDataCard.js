import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MasterDataCard = ({
  title,
  icon,
  statistics,
  loading = false,
  error = null,
  onPress,
  onAddNew,
  primaryColor = '#3498db',
  testID,
}) => {
  const cardStyle = [
    styles.card,
    { borderLeftColor: primaryColor },
    loading && styles.cardLoading,
    error && styles.cardError,
  ];

  const renderStatistics = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={primaryColor} />
          <Text style={styles.loadingText}>Memuat...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color="#e74c3c" />
          <Text style={styles.errorText}>Error loading data</Text>
        </View>
      );
    }

    return (
      <View style={styles.statisticsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: primaryColor }]}>
            {statistics?.total || 0}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#27ae60' }]}>
            {statistics?.active || 0}
          </Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
      </View>
    );
  };

  const renderActions = () => {
    if (loading || error) return null;

    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton, { backgroundColor: primaryColor }]}
          onPress={onAddNew}
          activeOpacity={0.7}
          testID={`${testID}-add-button`}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton, { borderColor: primaryColor }]}
          onPress={onPress}
          activeOpacity={0.7}
          testID={`${testID}-view-button`}
        >
          <Ionicons name="list" size={16} color={primaryColor} />
          <Text style={[styles.viewButtonText, { color: primaryColor }]}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={cardStyle}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading || error}
      testID={testID}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: primaryColor + '20' }]}>
            <Ionicons name={icon} size={24} color={primaryColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        {!loading && !error && (
          <Ionicons name="chevron-forward" size={20} color="#bdc3c7" />
        )}
      </View>

      {renderStatistics()}
      {renderActions()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardLoading: {
    opacity: 0.7,
  },
  cardError: {
    borderLeftColor: '#e74c3c',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  statisticsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ecf0f1',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  addButton: {
    backgroundColor: '#3498db',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MasterDataCard;
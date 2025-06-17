import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RaportCard = ({ 
  raport, 
  onPress, 
  onPublish,
  onArchive,
  onDelete,
  showActions = true 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#2ecc71';
      case 'draft': return '#f39c12';
      case 'archived': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return 'checkmark-circle';
      case 'draft': return 'document-text';
      case 'archived': return 'archive';
      default: return 'help-circle';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return '#2ecc71';
    if (percentage >= 75) return '#3498db';
    if (percentage >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statusBar}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(raport.status) }]}>
          <Ionicons name={getStatusIcon(raport.status)} size={16} color="#ffffff" />
          <Text style={styles.statusText}>{raport.status.toUpperCase()}</Text>
        </View>
        {raport.ranking && (
          <View style={styles.rankingBadge}>
            <Ionicons name="trophy" size={14} color="#f39c12" />
            <Text style={styles.rankingText}>Ranking {raport.ranking}</Text>
          </View>
        )}
      </View>

      <View style={styles.header}>
        <Text style={styles.semesterName}>
          {raport.semester?.nama_semester} - {raport.semester?.tahun_ajaran}
        </Text>
        <Text style={styles.publishDate}>
          {raport.tanggal_terbit ? formatDate(raport.tanggal_terbit) : 'Belum diterbitkan'}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={20} color="#3498db" />
          <Text style={styles.statLabel}>Kehadiran</Text>
          <Text style={[
            styles.statValue, 
            { color: getAttendanceColor(raport.persentase_kehadiran) }
          ]}>
            {raport.persentase_kehadiran}%
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="school-outline" size={20} color="#3498db" />
          <Text style={styles.statLabel}>Nilai Rata-rata</Text>
          <Text style={styles.statValue}>
            {raport.nilai_rata_rata ? raport.nilai_rata_rata.toFixed(2) : '-'}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Ionicons name="document-text-outline" size={20} color="#3498db" />
          <Text style={styles.statLabel}>Mata Pelajaran</Text>
          <Text style={styles.statValue}>
            {raport.raportDetail?.length || 0}
          </Text>
        </View>
      </View>

      {showActions && raport.status === 'draft' && (
        <View style={styles.actions}>
          {onPublish && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.publishButton]}
              onPress={onPublish}
            >
              <Ionicons name="send" size={16} color="#ffffff" />
              <Text style={styles.publishText}>Publish</Text>
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <Ionicons name="trash" size={16} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {showActions && raport.status === 'published' && onArchive && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.archiveButton]}
            onPress={onArchive}
          >
            <Ionicons name="archive" size={16} color="#ffffff" />
            <Text style={styles.archiveText}>Archive</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 6,
  },
  rankingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f39c12',
    marginLeft: 4,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  semesterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  publishDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 12,
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  publishButton: {
    backgroundColor: '#2ecc71',
    flex: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  archiveButton: {
    backgroundColor: '#95a5a6',
    flex: 1,
    justifyContent: 'center',
  },
  publishText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 6,
  },
  archiveText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default RaportCard;
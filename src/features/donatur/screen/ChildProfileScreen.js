import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import { donaturAnakApi } from '../api/donaturAnakApi';

const { width } = Dimensions.get('window');

const ChildProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { childId } = route.params;
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchChildData = async () => {
    try {
      setError(null);
      const response = await donaturAnakApi.getChildDetails(childId);
      setChild(response.data.data);
    } catch (err) {
      console.error('Error fetching child data:', err);
      setError('Gagal memuat profil anak. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchChildData(); }, [childId]);

  const handleRefresh = () => { setRefreshing(true); fetchChildData(); };

  const navigateToSurat = () => navigation.navigate('SuratList', { childId, childName: child.full_name });
  const navigateToPrestasi = () => navigation.navigate('ChildPrestasiList', { childId, childName: child.full_name });
  const navigateToRaport = () => navigation.navigate('ChildRaportList', { childId, childName: child.full_name });
  const navigateToAktivitas = () => navigation.navigate('ChildAktivitasList', { childId, childName: child.full_name });

  if (loading && !refreshing) return <LoadingSpinner fullScreen message="Memuat profil anak..." />;

  if (!child) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error || "Profil anak tidak ditemukan"} onRetry={fetchChildData} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header Profile */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {child.foto_url ? (
            <Image source={{ uri: child.foto_url }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={60} color="#ffffff" />
            </View>
          )}
        </View>
        
        <Text style={styles.childName}>{child.full_name}</Text>
        <Text style={styles.childNickname}>"{child.nick_name}"</Text>
        
        <View style={styles.basicInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Umur</Text>
            <Text style={styles.infoValue}>{child.umur || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Jenis Kelamin</Text>
            <Text style={styles.infoValue}>
              {child.jenis_kelamin === 'Laki-laki' ? 'Laki-laki' : child.jenis_kelamin === 'Perempuan' ? 'Perempuan' : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: '#2ecc71' }]}>{child.status_cpb}</Text>
          </View>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={navigateToSurat}>
          <View style={[styles.menuIcon, { backgroundColor: '#9b59b6' }]}>
            <Ionicons name="mail" size={24} color="#ffffff" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Surat</Text>
            <Text style={styles.menuSubtitle}>Tukar pesan dengan admin shelter</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#cccccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={navigateToPrestasi}>
          <View style={[styles.menuIcon, { backgroundColor: '#f39c12' }]}>
            <Ionicons name="trophy" size={24} color="#ffffff" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Prestasi</Text>
            <Text style={styles.menuSubtitle}>Lihat pencapaian anak</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#cccccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={navigateToRaport}>
          <View style={[styles.menuIcon, { backgroundColor: '#3498db' }]}>
            <Ionicons name="document-text" size={24} color="#ffffff" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Raport</Text>
            <Text style={styles.menuSubtitle}>Laporan kemajuan akademik</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#cccccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={navigateToAktivitas}>
          <View style={[styles.menuIcon, { backgroundColor: '#2ecc71' }]}>
            <Ionicons name="calendar" size={24} color="#ffffff" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Aktivitas</Text>
            <Text style={styles.menuSubtitle}>Kegiatan belajar dan kehadiran</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#cccccc" />
        </TouchableOpacity>
      </View>

      {/* Detailed Information */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Informasi Pribadi</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tempat Lahir</Text>
            <Text style={styles.detailValue}>{child.tempat_lahir || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tanggal Lahir</Text>
            <Text style={styles.detailValue}>{child.tanggal_lahir || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Agama</Text>
            <Text style={styles.detailValue}>{child.agama || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Anak Ke</Text>
            <Text style={styles.detailValue}>
              {child.anak_ke && child.dari_bersaudara ? `${child.anak_ke} dari ${child.dari_bersaudara}` : '-'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tinggal Bersama</Text>
            <Text style={styles.detailValue}>{child.tinggal_bersama || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Jarak ke Shelter</Text>
            <Text style={styles.detailValue}>{child.jarak_rumah || '-'}</Text>
          </View>
        </View>
      </View>

      {/* Educational Information */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Informasi Pendidikan</Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Pelajaran Favorit</Text>
            <Text style={styles.detailValue}>{child.pelajaran_favorit || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Hafalan</Text>
            <Text style={styles.detailValue}>{child.hafalan || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Hobi</Text>
            <Text style={styles.detailValue}>{child.hobi || '-'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Prestasi</Text>
            <Text style={styles.detailValue}>{child.prestasi || '-'}</Text>
          </View>
        </View>
      </View>

      {/* Shelter Information */}
      {child.shelter && (
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Informasi Shelter</Text>
          <View style={styles.shelterInfo}>
            <Text style={styles.shelterName}>{child.shelter.nama_shelter}</Text>
            <Text style={styles.shelterAddress}>{child.shelter.alamat}</Text>
            {child.kelompok && (
              <Text style={styles.kelompokInfo}>
                Kelompok: {child.kelompok.nama_kelompok} (Level {child.kelompok.level})
              </Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { paddingBottom: 20 },
  profileHeader: { backgroundColor: '#9b59b6', padding: 20, alignItems: 'center', paddingBottom: 40 },
  profileImageContainer: { 
    width: 120, height: 120, borderRadius: 60, marginBottom: 16, 
    borderWidth: 4, borderColor: '#fff', overflow: 'hidden' 
  },
  profileImage: { width: '100%', height: '100%' },
  profileImagePlaceholder: { 
    width: '100%', height: '100%', backgroundColor: '#8e44ad', 
    justifyContent: 'center', alignItems: 'center' 
  },
  childName: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  childNickname: { fontSize: 16, color: '#fff', opacity: 0.8, fontStyle: 'italic', marginBottom: 20 },
  basicInfo: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  infoItem: { alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#fff', opacity: 0.8 },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  menuContainer: { 
    backgroundColor: '#fff', marginTop: -20, borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, paddingTop: 20, paddingHorizontal: 20 
  },
  menuItem: { 
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, 
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0' 
  },
  menuIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 },
  menuSubtitle: { fontSize: 14, color: '#666' },
  detailsContainer: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  detailsGrid: { gap: 16 },
  detailItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' 
  },
  detailLabel: { fontSize: 14, color: '#666', flex: 1 },
  detailValue: { fontSize: 14, color: '#333', fontWeight: '500', flex: 1, textAlign: 'right' },
  shelterInfo: { backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8 },
  shelterName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  shelterAddress: { fontSize: 14, color: '#666', marginBottom: 8 },
  kelompokInfo: { fontSize: 14, color: '#9b59b6', fontWeight: '500' },
});

export default ChildProfileScreen;
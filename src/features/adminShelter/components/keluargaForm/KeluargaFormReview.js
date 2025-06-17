import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { formatDateToIndonesian } from '../../../../common/utils/dateFormatter';

const KeluargaFormReview = ({ formData, dropdownData, isEditMode }) => {
  const findKacabName = (id) => {
    const kacab = dropdownData.kacab.find(k => k.id_kacab.toString() === id);
    return kacab ? kacab.nama_kacab : '-';
  };
  
  const findWilbinName = (id) => {
    const wilbin = dropdownData.wilbin.find(w => w.id_wilbin.toString() === id);
    return wilbin ? wilbin.nama_wilbin : '-';
  };
  
  const findBankName = (id) => {
    const bank = dropdownData.bank.find(b => b.id_bank.toString() === id);
    return bank ? bank.nama_bank : '-';
  };
  
  const formatEducationLevel = (level) => {
    const levelMap = {
      'belum_sd': 'Belum Sekolah',
      'sd': 'SD / Sederajat',
      'smp': 'SMP / Sederajat',
      'sma': 'SMA / Sederajat',
      'perguruan_tinggi': 'Perguruan Tinggi'
    };
    
    return levelMap[level] || level;
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.reviewTitle}>Silakan tinjau semua informasi sebelum {isEditMode ? 'memperbarui' : 'menyimpan'}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Keluarga</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nomor KK:</Text>
          <Text style={styles.infoValue}>{formData.no_kk || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kepala Keluarga:</Text>
          <Text style={styles.infoValue}>{formData.kepala_keluarga || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={styles.infoValue}>{formData.status_ortu || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kacab:</Text>
          <Text style={styles.infoValue}>{findKacabName(formData.id_kacab)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wilbin:</Text>
          <Text style={styles.infoValue}>{findWilbinName(formData.id_wilbin)}</Text>
        </View>
        
        {formData.bank_choice === 'yes' && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bank:</Text>
              <Text style={styles.infoValue}>{findBankName(formData.id_bank)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rekening:</Text>
              <Text style={styles.infoValue}>{formData.no_rek ? `${formData.no_rek} (${formData.an_rek || 'T/A'})` : '-'}</Text>
            </View>
          </>
        )}
        
        {formData.telp_choice === 'yes' && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Telepon:</Text>
            <Text style={styles.infoValue}>{formData.no_tlp ? `${formData.no_tlp} (${formData.an_tlp || 'T/A'})` : '-'}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Ayah</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>NIK:</Text>
          <Text style={styles.infoValue}>{formData.nik_ayah || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama:</Text>
          <Text style={styles.infoValue}>{formData.nama_ayah || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Agama:</Text>
          <Text style={styles.infoValue}>{formData.agama_ayah || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kelahiran:</Text>
          <Text style={styles.infoValue}>
            {formData.tempat_lahir_ayah ? `${formData.tempat_lahir_ayah}, ${formatDateToIndonesian(formData.tanggal_lahir_ayah)}` : '-'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Alamat:</Text>
          <Text style={styles.infoValue}>{formData.alamat_ayah || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Penghasilan:</Text>
          <Text style={styles.infoValue}>{formData.penghasilan_ayah || '-'}</Text>
        </View>
        
        {formData.tanggal_kematian_ayah && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Meninggal:</Text>
              <Text style={styles.infoValue}>{formatDateToIndonesian(formData.tanggal_kematian_ayah)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sebab:</Text>
              <Text style={styles.infoValue}>{formData.penyebab_kematian_ayah || '-'}</Text>
            </View>
          </>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Ibu</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>NIK:</Text>
          <Text style={styles.infoValue}>{formData.nik_ibu || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama:</Text>
          <Text style={styles.infoValue}>{formData.nama_ibu || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Agama:</Text>
          <Text style={styles.infoValue}>{formData.agama_ibu || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kelahiran:</Text>
          <Text style={styles.infoValue}>
            {formData.tempat_lahir_ibu ? `${formData.tempat_lahir_ibu}, ${formatDateToIndonesian(formData.tanggal_lahir_ibu)}` : '-'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Alamat:</Text>
          <Text style={styles.infoValue}>{formData.alamat_ibu || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Penghasilan:</Text>
          <Text style={styles.infoValue}>{formData.penghasilan_ibu || '-'}</Text>
        </View>
        
        {formData.tanggal_kematian_ibu && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Meninggal:</Text>
              <Text style={styles.infoValue}>{formatDateToIndonesian(formData.tanggal_kematian_ibu)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sebab:</Text>
              <Text style={styles.infoValue}>{formData.penyebab_kematian_ibu || '-'}</Text>
            </View>
          </>
        )}
      </View>
      
      {formData.nik_wali || formData.nama_wali ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Wali</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NIK:</Text>
            <Text style={styles.infoValue}>{formData.nik_wali || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama:</Text>
            <Text style={styles.infoValue}>{formData.nama_wali || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hubungan:</Text>
            <Text style={styles.infoValue}>{formData.hub_kerabat_wali || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Agama:</Text>
            <Text style={styles.infoValue}>{formData.agama_wali || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kelahiran:</Text>
            <Text style={styles.infoValue}>
              {formData.tempat_lahir_wali ? `${formData.tempat_lahir_wali}, ${formatDateToIndonesian(formData.tanggal_lahir_wali)}` : '-'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alamat:</Text>
            <Text style={styles.infoValue}>{formData.alamat_wali || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Penghasilan:</Text>
            <Text style={styles.infoValue}>{formData.penghasilan_wali || '-'}</Text>
          </View>
        </View>
      ) : null}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Anak</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>NIK:</Text>
          <Text style={styles.infoValue}>{formData.nik_anak || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nama:</Text>
          <Text style={styles.infoValue}>{formData.full_name || '-'} ({formData.nick_name || '-'})</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kelahiran:</Text>
          <Text style={styles.infoValue}>
            {formData.tempat_lahir ? `${formData.tempat_lahir}, ${formatDateToIndonesian(formData.tanggal_lahir)}` : '-'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jenis Kelamin:</Text>
          <Text style={styles.infoValue}>{formData.jenis_kelamin === 'Laki-laki' ? 'Laki-laki' : (formData.jenis_kelamin === 'Perempuan' ? 'Perempuan' : '-')}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Agama:</Text>
          <Text style={styles.infoValue}>{formData.agama || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Anak Ke:</Text>
          <Text style={styles.infoValue}>{formData.anak_ke && formData.dari_bersaudara ? `${formData.anak_ke} dari ${formData.dari_bersaudara}` : '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tinggal Bersama:</Text>
          <Text style={styles.infoValue}>{formData.tinggal_bersama || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hafalan:</Text>
          <Text style={styles.infoValue}>{formData.hafalan || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hobi:</Text>
          <Text style={styles.infoValue}>{formData.hobi || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mata Pelajaran Favorit:</Text>
          <Text style={styles.infoValue}>{formData.pelajaran_favorit || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Prestasi:</Text>
          <Text style={styles.infoValue}>{formData.prestasi || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jarak:</Text>
          <Text style={styles.infoValue}>{formData.jarak_rumah ? `${formData.jarak_rumah} km` : '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Transportasi:</Text>
          <Text style={styles.infoValue}>{formData.transportasi || '-'}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Pendidikan</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jenjang:</Text>
          <Text style={styles.infoValue}>{formatEducationLevel(formData.jenjang) || '-'}</Text>
        </View>
        
        {formData.jenjang && formData.jenjang !== 'belum_sd' && formData.jenjang !== 'perguruan_tinggi' && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kelas:</Text>
              <Text style={styles.infoValue}>{formData.kelas || '-'}</Text>
            </View>
            
            {formData.jenjang === 'sma' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jurusan:</Text>
                <Text style={styles.infoValue}>{formData.jurusan || '-'}</Text>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sekolah:</Text>
              <Text style={styles.infoValue}>{formData.nama_sekolah || '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alamat:</Text>
              <Text style={styles.infoValue}>{formData.alamat_sekolah || '-'}</Text>
            </View>
          </>
        )}
        
        {formData.jenjang === 'perguruan_tinggi' && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Semester:</Text>
              <Text style={styles.infoValue}>{formData.semester || '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jurusan:</Text>
              <Text style={styles.infoValue}>{formData.jurusan || '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Perguruan Tinggi:</Text>
              <Text style={styles.infoValue}>{formData.nama_pt || '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alamat:</Text>
              <Text style={styles.infoValue}>{formData.alamat_pt || '-'}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Survei - Informasi Dasar</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pekerjaan Kepala Keluarga:</Text>
          <Text style={styles.infoValue}>{formData.pekerjaan_kepala_keluarga || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pendidikan Kepala Keluarga:</Text>
          <Text style={styles.infoValue}>{formData.pendidikan_kepala_keluarga || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jumlah Tanggungan:</Text>
          <Text style={styles.infoValue}>{formData.jumlah_tanggungan || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status Anak:</Text>
          <Text style={styles.infoValue}>{formData.status_anak || '-'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Survei - Informasi Keuangan</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Penghasilan:</Text>
          <Text style={styles.infoValue}>{formData.penghasilan || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tabungan:</Text>
          <Text style={styles.infoValue}>{formData.kepemilikan_tabungan || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Biaya Pendidikan:</Text>
          <Text style={styles.infoValue}>{formData.biaya_pendidikan_perbulan ? `Rp ${formData.biaya_pendidikan_perbulan}` : '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bantuan Lain:</Text>
          <Text style={styles.infoValue}>{formData.bantuan_lembaga_formal_lain || '-'}</Text>
        </View>
        
        {formData.bantuan_lembaga_formal_lain === 'Ya' && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jumlah Bantuan:</Text>
            <Text style={styles.infoValue}>{formData.bantuan_lembaga_formal_lain_sebesar ? `Rp ${formData.bantuan_lembaga_formal_lain_sebesar}` : '-'}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Survei - Informasi Aset</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kepemilikan Tanah:</Text>
          <Text style={styles.infoValue}>{formData.kepemilikan_tanah || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kepemilikan Rumah:</Text>
          <Text style={styles.infoValue}>{formData.kepemilikan_rumah || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kondisi Dinding:</Text>
          <Text style={styles.infoValue}>{formData.kondisi_rumah_dinding || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kondisi Lantai:</Text>
          <Text style={styles.infoValue}>{formData.kondisi_rumah_lantai || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kendaraan:</Text>
          <Text style={styles.infoValue}>{formData.kepemilikan_kendaraan || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Elektronik:</Text>
          <Text style={styles.infoValue}>{formData.kepemilikan_elektronik || '-'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Survei - Informasi Kesehatan</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jumlah Makan per Hari:</Text>
          <Text style={styles.infoValue}>{formData.jumlah_makan || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sumber Air Bersih:</Text>
          <Text style={styles.infoValue}>{formData.sumber_air_bersih || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jamban:</Text>
          <Text style={styles.infoValue}>{formData.jamban_limbah || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tempat Sampah:</Text>
          <Text style={styles.infoValue}>{formData.tempat_sampah || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Perokok:</Text>
          <Text style={styles.infoValue}>{formData.perokok || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Konsumen Minuman Keras:</Text>
          <Text style={styles.infoValue}>{formData.konsumen_miras || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kotak P3K:</Text>
          <Text style={styles.infoValue}>{formData.persediaan_p3k || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Buah & Sayuran:</Text>
          <Text style={styles.infoValue}>{formData.makan_buah_sayur || '-'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Survei - Keagamaan & Sosial</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sholat Lima Waktu:</Text>
          <Text style={styles.infoValue}>{formData.solat_lima_waktu || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membaca Al-Quran:</Text>
          <Text style={styles.infoValue}>{formData.membaca_alquran || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Majelis Taklim:</Text>
          <Text style={styles.infoValue}>{formData.majelis_taklim || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membaca Berita:</Text>
          <Text style={styles.infoValue}>{formData.membaca_koran || '-'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pengurus Organisasi:</Text>
          <Text style={styles.infoValue}>{formData.pengurus_organisasi || '-'}</Text>
        </View>
        
        {formData.pengurus_organisasi === 'Ya' && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jabatan:</Text>
            <Text style={styles.infoValue}>{formData.pengurus_organisasi_sebagai || '-'}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kondisi Penerima Manfaat:</Text>
          <Text style={styles.infoValue}>{formData.kondisi_penerima_manfaat || '-'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 90,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
});

export default KeluargaFormReview;
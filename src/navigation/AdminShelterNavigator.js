import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AdminShelterDashboardScreen from '../features/adminShelter/screens/AdminShelterDashboardScreen';
import AdminShelterProfileScreen from '../features/adminShelter/screens/AdminShelterProfileScreen';
import ShelterGpsSettingScreen from '../features/adminShelter/screens/ShelterGpsSettingScreen';
import AnakManagementScreen from '../features/adminShelter/screens/AnakManagementScreen';
import AnakDetailScreen from '../features/adminShelter/screens/AnakDetailScreen';
import AnakFormScreen from '../features/adminShelter/screens/AnakFormScreen';

import QrScannerScreen from '../features/adminShelter/screens/attendance/QrScannerScreen';
import AttendanceListScreen from '../features/adminShelter/screens/attendance/AttendanceListScreen';
import AttendanceDetailScreen from '../features/adminShelter/screens/attendance/AttendanceDetailScreen';
import ManualAttendanceScreen from '../features/adminShelter/screens/attendance/ManualAttendanceScreen';
import AttendanceReportScreen from '../features/adminShelter/screens/attendance/AttendanceReportScreen';
import ActivitiesListScreen from '../features/adminShelter/screens/attendance/ActivitiesListScreen';
import ActivityFormScreen from '../features/adminShelter/screens/attendance/ActivityFormScreen';
import ActivityDetailScreen from '../features/adminShelter/screens/attendance/ActivityDetailScreen';
import ActivityReportScreen from '../features/adminShelter/screens/attendance/ActivityReportScreen';
import ViewReportScreen from '../features/adminShelter/screens/attendance/ViewReportScreen';
import QrTokenGenerationScreen from '../features/adminShelter/screens/attendance/QrTokenGenerationScreen';
import AttendanceManagementScreen from '../features/adminShelter/screens/attendance/AttendanceManagementScreen';

import InformasiAnakScreen from '../features/adminShelter/screens/anakDetail/InformasiAnakScreen';
import RaportScreen from '../features/adminShelter/screens/anakDetail/RaportScreen';
import AddRaportScreen from '../features/adminShelter/screens/anakDetail/AddRaportScreen';
import RaportDetailScreen from '../features/adminShelter/screens/anakDetail/RaportDetailScreen';
import PrestasiScreen from '../features/adminShelter/screens/anakDetail/PrestasiScreen';
import PrestasiDetailScreen from '../features/adminShelter/screens/anakDetail/PrestasiDetailScreen';
import PrestasiFormScreen from '../features/adminShelter/screens/anakDetail/PrestasiFormScreen';
import SuratScreen from '../features/adminShelter/screens/anakDetail/SuratScreen';
import SuratListScreen from '../features/adminShelter/screens/anakDetail/SuratListScreen';
import SuratDetailScreen from '../features/adminShelter/screens/anakDetail/SuratDetailScreen';
import SuratFormScreen from '../features/adminShelter/screens/anakDetail/SuratFormScreen';
import RiwayatScreen from '../features/adminShelter/screens/anakDetail/RiwayatScreen';
import RiwayatDetailScreen from '../features/adminShelter/screens/anakDetail/RiwayatDetailScreen';
import RiwayatFormScreen from '../features/adminShelter/screens/anakDetail/RiwayatFormScreen';
import NilaiAnakScreen from '../features/adminShelter/screens/anakDetail/NilaiAnakScreen';
import RaporShelterScreen from '../features/adminShelter/screens/anakDetail/RaporShelterScreen';
import RaportFormalScreen from '../features/adminShelter/screens/anakDetail/RaportFormalScreen';
import RaportFormalDetailScreen from '../features/adminShelter/screens/anakDetail/RaportFormalDetailScreen';
import RaportFormalFormScreen from '../features/adminShelter/screens/anakDetail/RaportFormalFormScreen';

import TutorManagementScreen from '../features/adminShelter/screens/TutorManagementScreen';
import TutorFormScreen from '../features/adminShelter/screens/TutorFormScreen';
import TutorDetailScreen from '../features/adminShelter/screens/TutorDetailScreen';
import TutorHonorScreen from '../features/adminShelter/screens/TutorHonorScreen';
import TutorHonorDetailScreen from '../features/adminShelter/screens/TutorHonorDetailScreen';
import TutorActivityHistoryScreen from '../features/adminShelter/screens/TutorActivityHistoryScreen';
import TutorHonorHistoryScreen from '../features/adminShelter/screens/TutorHonorHistoryScreen';
import HonorCalculationScreen from '../features/adminShelter/screens/HonorCalculationScreen';
import TutorCompetencyListScreen from '../features/adminShelter/screens/TutorCompetencyListScreen';
import TutorCompetencyFormScreen from '../features/adminShelter/screens/TutorCompetencyFormScreen';
import TutorCompetencyDetailScreen from '../features/adminShelter/screens/TutorCompetencyDetailScreen';

import KelompokManagementScreen from '../features/adminShelter/screens/KelompokManagementScreen';
import KelompokFormScreen from '../features/adminShelter/screens/KelompokFormScreen';
import KelompokDetailScreen from '../features/adminShelter/screens/KelompokDetailScreen';
import AddChildrenToKelompokScreen from '../features/adminShelter/screens/AddChildrenToKelompokScreen';

import KeluargaManagementScreen from '../features/adminShelter/screens/KeluargaManagementScreen';
import KeluargaDetailScreen from '../features/adminShelter/screens/KeluargaDetailScreen';
import KeluargaFormScreen from '../features/adminShelter/screens/KeluargaFormScreen';
import PengajuanAnakSearchScreen from '../features/adminShelter/screens/PengajuanAnakSearchScreen';
import PengajuanAnakFormScreen from '../features/adminShelter/screens/PengajuanAnakFormScreen';

import PenilaianListScreen from '../features/adminShelter/screens/PenilaianListScreen';
import PenilaianFormScreen from '../features/adminShelter/screens/PenilaianFormScreen';
import RaportViewScreen from '../features/adminShelter/screens/RaportViewScreen';
import RaportGenerateScreen from '../features/adminShelter/screens/RaportGenerateScreen';
import SemesterManagementScreen from '../features/adminShelter/screens/SemesterManagementScreen';
import KurikulumSelectionScreen from '../features/adminShelter/screens/KurikulumSelectionScreen';
import KurikulumHomeScreen from '../features/adminShelter/screens/kelola/KurikulumHomeScreen';
import KurikulumBrowserScreen from '../features/adminShelter/screens/kelola/KurikulumBrowserScreen';
import KurikulumAssignmentScreen from '../features/adminShelter/screens/kelola/KurikulumAssignmentScreen';
import ProgressTrackingScreen from '../features/adminShelter/screens/kelola/ProgressTrackingScreen';
import KelompokReportingScreen from '../features/adminShelter/screens/kelola/KelompokReportingScreen';

import KeuanganListScreen from '../features/adminShelter/screens/KeuanganListScreen';
import KeuanganFormScreen from '../features/adminShelter/screens/KeuanganFormScreen';
import KeuanganDetailScreen from '../features/adminShelter/screens/KeuanganDetailScreen';

import LaporanKegiatanMainScreen from '../features/adminShelter/screens/reports/LaporanKegiatanMainScreen';
import LaporanAnakBinaanScreen from '../features/adminShelter/screens/reports/LaporanAnakBinaanScreen';
import LaporanTutorScreen from '../features/adminShelter/screens/reports/LaporanTutorScreen';
import ShelterReportScreen from '../features/adminShelter/screens/reports/ShelterReportScreen';
import CPBReportScreen from '../features/adminShelter/screens/reports/CPBReportScreen';
import LaporanRaportAnakScreen from '../features/adminShelter/screens/reports/LaporanRaportAnakScreen';
import LaporanHistoriAnakScreen from '../features/adminShelter/screens/reports/LaporanHistoriAnakScreen';
import LaporanAktivitasScreen from '../features/adminShelter/screens/reports/LaporanAktivitasScreen';
import LaporanSuratAnakScreen from '../features/adminShelter/screens/reports/LaporanSuratAnakScreen';
import RaportChildDetailScreen from '../features/adminShelter/screens/reports/RaportChildDetailScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ManagementStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const AttendanceStack = createStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="Dashboard" 
      component={AdminShelterDashboardScreen} 
      options={{ headerTitle: 'Dashboard Admin Shelter' }} 
    />
    <HomeStack.Screen 
      name="AttendanceStack" 
      component={AttendanceStackNavigator} 
      options={{ headerShown: false }} 
    />
    <HomeStack.Screen 
      name="KurikulumHome" 
      component={KurikulumHomeScreen} 
      options={{ headerTitle: 'Kelola Kurikulum' }} 
    />
    <HomeStack.Screen 
      name="KurikulumBrowser" 
      component={KurikulumBrowserScreen} 
      options={{ headerTitle: 'Browser Kurikulum' }} 
    />
    <HomeStack.Screen 
      name="KurikulumAssignment" 
      component={KurikulumAssignmentScreen} 
      options={{ headerTitle: 'Assign Kurikulum' }} 
    />
    <HomeStack.Screen 
      name="ProgressTracking" 
      component={ProgressTrackingScreen} 
      options={{ headerTitle: 'Progress Tracking' }} 
    />
    <HomeStack.Screen 
      name="KelompokReporting" 
      component={KelompokReportingScreen} 
      options={{ headerTitle: 'Kelompok Report' }} 
    />
  </HomeStack.Navigator>
);

const AttendanceStackNavigator = () => (
  <AttendanceStack.Navigator>
    <AttendanceStack.Screen 
      name="ActivitiesList" 
      component={ActivitiesListScreen} 
      options={{ headerTitle: 'Activities' }} 
    />
    <AttendanceStack.Screen 
      name="ActivityForm" 
      component={ActivityFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.activity ? 'Edit Aktivitas' : 'Buat Aktivitas' 
      })} 
    />
    <AttendanceStack.Screen 
      name="ActivityDetail" 
      component={ActivityDetailScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.activityName || 'Detail Aktivitas' 
      })} 
    />
    <AttendanceStack.Screen 
      name="AttendanceManagement" 
      component={AttendanceManagementScreen} 
      options={{ headerTitle: 'Kelola Kehadiran' }} 
    />
    <AttendanceStack.Screen 
      name="AttendanceList" 
      component={AttendanceListScreen} 
      options={{ headerTitle: 'Attendance Records' }} 
    />
    <AttendanceStack.Screen 
      name="AttendanceDetail" 
      component={AttendanceDetailScreen} 
      options={{ headerTitle: 'Attendance Details' }} 
    />
    <AttendanceStack.Screen 
      name="QrScanner" 
      component={QrScannerScreen} 
      options={{ headerTitle: 'Scan QR Code', headerShown: false }} 
    />
    <AttendanceStack.Screen 
      name="ManualAttendance" 
      component={ManualAttendanceScreen} 
      options={{ headerTitle: 'Manual Attendance Entry' }} 
    />
    <AttendanceStack.Screen 
      name="AttendanceReport" 
      component={AttendanceReportScreen} 
      options={{ headerTitle: 'Attendance Report' }} 
    />
    <AttendanceStack.Screen 
      name="ActivityReport" 
      component={ActivityReportScreen} 
      options={{ headerTitle: 'Laporan Kegiatan' }} 
    />
    <AttendanceStack.Screen 
      name="ViewReportScreen" 
      component={ViewReportScreen} 
      options={{ headerTitle: 'Lihat Laporan' }} 
    />
    <AttendanceStack.Screen 
      name="QrTokenGeneration" 
      component={QrTokenGenerationScreen} 
      options={{ headerTitle: 'Generate QR Codes' }} 
    />
  </AttendanceStack.Navigator>
);

const ManagementStackNavigator = () => (
  <ManagementStack.Navigator>
    <ManagementStack.Screen 
      name="LaporanKegiatanMain" 
      component={LaporanKegiatanMainScreen} 
      options={{ headerTitle: 'Laporan Kegiatan' }} 
    />
    <ManagementStack.Screen 
      name="LaporanAnakBinaan" 
      component={LaporanAnakBinaanScreen} 
      options={{ headerTitle: 'Laporan Anak Binaan' }} 
    />
    <ManagementStack.Screen 
      name="LaporanTutor" 
      component={LaporanTutorScreen} 
      options={{ headerTitle: 'Laporan Tutor' }} 
    />
    <ManagementStack.Screen 
      name="ShelterReport" 
      component={ShelterReportScreen} 
      options={{ headerTitle: 'Shelter Report' }} 
    />
    <ManagementStack.Screen 
      name="CPBReport" 
      component={CPBReportScreen} 
      options={{ headerTitle: 'CPB Report' }} 
    />
    <ManagementStack.Screen 
      name="LaporanRaportAnak" 
      component={LaporanRaportAnakScreen} 
      options={{ headerTitle: 'Laporan Raport Anak' }} 
    />
    <ManagementStack.Screen 
      name="LaporanHistoriAnak" 
      component={LaporanHistoriAnakScreen} 
      options={{ headerTitle: 'Laporan Histori Anak' }} 
    />
    <ManagementStack.Screen 
      name="LaporanAktivitas" 
      component={LaporanAktivitasScreen} 
      options={{ headerTitle: 'Laporan Aktivitas' }} 
    />
    <ManagementStack.Screen 
      name="LaporanSuratAnak" 
      component={LaporanSuratAnakScreen} 
      options={{ headerTitle: 'Laporan Surat Anak' }} 
    />
    
    <ManagementStack.Screen 
      name="TutorActivityHistory" 
      component={TutorActivityHistoryScreen} 
      options={{ headerTitle: 'Riwayat Aktivitas Tutor' }} 
    />
    <ManagementStack.Screen 
      name="TutorHonorHistory" 
      component={TutorHonorHistoryScreen} 
      options={{ headerTitle: 'Riwayat Honor Tutor' }} 
    />
    <ManagementStack.Screen 
      name="Surat" 
      component={SuratScreen} 
      options={{ headerTitle: 'Surat Anak' }} 
    />
    <ManagementStack.Screen 
      name="SuratList" 
      component={SuratListScreen} 
      options={{ headerTitle: 'Daftar Surat' }} 
    />
    <ManagementStack.Screen 
      name="SuratDetail" 
      component={SuratDetailScreen} 
      options={{ headerTitle: 'Detail Surat' }} 
    />
    <ManagementStack.Screen 
      name="SuratForm" 
      component={SuratFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.isEdit ? 'Edit Surat' : 'Tulis Surat' 
      })} 
    />
    <ManagementStack.Screen 
      name="SemesterManagement" 
      component={SemesterManagementScreen} 
      options={{ headerTitle: 'Semester' }} 
    />
 
    <ManagementStack.Screen 
      name="KurikulumSelection" 
      component={KurikulumSelectionScreen} 
      options={{ headerTitle: 'Pilih Kurikulum' }} 
    />
    <ManagementStack.Screen 
      name="PenilaianList" 
      component={PenilaianListScreen} 
      options={{ headerTitle: 'Nilai Anak' }} 
    />
    <ManagementStack.Screen 
      name="PenilaianForm" 
      component={PenilaianFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.penilaian ? 'Edit Nilai' : 'Input Nilai' 
      })} 
    />
    <ManagementStack.Screen 
      name="RaportView" 
      component={RaportViewScreen} 
      options={{ headerTitle: 'Raport Anak' }} 
    />
    <ManagementStack.Screen 
      name="RaportGenerate" 
      component={RaportGenerateScreen} 
      options={{ headerTitle: 'Generate Raport' }} 
    />
    <ManagementStack.Screen 
      name="KeluargaManagement" 
      component={KeluargaManagementScreen} 
      options={{ headerTitle: 'Keluarga' }} 
    />
    <ManagementStack.Screen 
      name="KeluargaDetail" 
      component={KeluargaDetailScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.title || 'Detail Keluarga' 
      })} 
    />
    <ManagementStack.Screen 
      name="KeluargaForm" 
      component={KeluargaFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.isEdit ? 'Edit Family' : 'Add New Family' 
      })} 
    />
    <ManagementStack.Screen 
      name="PengajuanAnakSearch" 
      component={PengajuanAnakSearchScreen} 
      options={{ headerTitle: 'Pengajuan Anak Binaan' }} 
    />
    <ManagementStack.Screen 
      name="PengajuanAnakForm" 
      component={PengajuanAnakFormScreen} 
      options={{ headerTitle: 'Tambah Anak' }} 
    />
    <ManagementStack.Screen 
      name="AnakManagement" 
      component={AnakManagementScreen} 
      options={{ headerTitle: 'Anak' }} 
    />
    <ManagementStack.Screen 
      name="AnakDetail" 
      component={AnakDetailScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.isNew ? 'Tambah Anak' : (route.params?.title || 'Detail Anak') 
      })} 
    />
    <ManagementStack.Screen 
      name="AnakForm" 
      component={AnakFormScreen} 
      options={{ headerTitle: 'Edit Anak' }} 
    />
    <ManagementStack.Screen 
      name="InformasiAnak" 
      component={InformasiAnakScreen} 
      options={{ headerTitle: 'Informasi Anak' }} 
    />
    <ManagementStack.Screen 
      name="Raport" 
      component={RaportScreen} 
      options={{ headerTitle: 'Raport Anak' }} 
    />
    <ManagementStack.Screen 
      name="AddRaport" 
      component={AddRaportScreen} 
      options={{ headerTitle: 'Tambah Raport' }} 
    />
    <ManagementStack.Screen 
      name="RaportDetail" 
      component={RaportDetailScreen} 
      options={{ headerTitle: 'Detail Raport' }} 
    />
    <ManagementStack.Screen 
      name="Prestasi" 
      component={PrestasiScreen} 
      options={{ headerTitle: 'Prestasi Anak' }} 
    />
    <ManagementStack.Screen 
      name="PrestasiDetail" 
      component={PrestasiDetailScreen} 
      options={{ headerTitle: 'Detail Prestasi' }} 
    />
    <ManagementStack.Screen 
      name="PrestasiForm" 
      component={PrestasiFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.isEdit ? 'Edit Prestasi' : 'Tambah Prestasi' 
      })} 
    />
    <ManagementStack.Screen 
      name="Riwayat" 
      component={RiwayatScreen} 
      options={{ headerTitle: 'Riwayat Anak' }} 
    />
    <ManagementStack.Screen 
      name="RiwayatDetail" 
      component={RiwayatDetailScreen} 
      options={{ headerTitle: 'Detail Riwayat' }} 
    />
    <ManagementStack.Screen 
      name="RiwayatForm" 
      component={RiwayatFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.isEdit ? 'Edit Riwayat' : 'Tambah Riwayat' 
      })} 
    />
    <ManagementStack.Screen 
      name="NilaiAnak" 
      component={NilaiAnakScreen} 
      options={{ headerTitle: 'Nilai Anak' }} 
    />
    <ManagementStack.Screen 
      name="RaporShelter" 
      component={RaporShelterScreen} 
      options={{ headerTitle: 'Rapor Shelter' }} 
    />
    <ManagementStack.Screen 
      name="TutorManagement" 
      component={TutorManagementScreen} 
      options={{ headerTitle: 'Tutor' }} 
    />
    <ManagementStack.Screen 
      name="TutorForm" 
      component={TutorFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.tutor ? 'Edit Tutor' : 'Add New Tutor' 
      })} 
    />
    <ManagementStack.Screen 
      name="TutorDetail" 
      component={TutorDetailScreen} 
      options={{ headerTitle: 'Detail Tutor' }} 
    />
    <ManagementStack.Screen 
      name="TutorHonor" 
      component={TutorHonorScreen} 
      options={{ headerTitle: 'Honor Tutor' }} 
    />
    <ManagementStack.Screen 
      name="TutorHonorDetail" 
      component={TutorHonorDetailScreen} 
      options={{ headerTitle: 'Detail Honor' }} 
    />
    <ManagementStack.Screen 
      name="TutorCompetencyList" 
      component={TutorCompetencyListScreen} 
      options={{ headerTitle: 'Kompetensi Tutor' }} 
    />
    <ManagementStack.Screen 
      name="TutorCompetencyForm" 
      component={TutorCompetencyFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.isEdit ? 'Edit Kompetensi' : 'Tambah Kompetensi' 
      })} 
    />
    <ManagementStack.Screen 
      name="TutorCompetencyDetail" 
      component={TutorCompetencyDetailScreen} 
      options={{ headerTitle: 'Detail Kompetensi' }} 
    />
    <ManagementStack.Screen 
      name="KelompokManagement" 
      component={KelompokManagementScreen} 
      options={{ headerTitle: 'Kelompok Anak Binaan' }} 
    />
    <ManagementStack.Screen 
      name="HonorCalculation" 
      component={HonorCalculationScreen} 
      options={{ title: 'Hitung Honor' }} 
    />
    <ManagementStack.Screen 
      name="KelompokForm" 
      component={KelompokFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.kelompok ? 'Edit Kelompok' : 'Buat Kelompok' 
      })} 
    />
    <ManagementStack.Screen 
      name="KelompokDetail" 
      component={KelompokDetailScreen} 
      options={{ headerTitle: 'Detail Grup' }} 
    />
    <ManagementStack.Screen 
      name="AddChildrenToKelompok" 
      component={AddChildrenToKelompokScreen} 
      options={{ headerTitle: 'Tambah Anak Ke Grup' }} 
    />
    <ManagementStack.Screen 
      name="ActivitiesList" 
      component={ActivitiesListScreen} 
      options={{ headerTitle: 'Activitas' }} 
    />
    <ManagementStack.Screen 
      name="ActivityForm" 
      component={ActivityFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.activity ? 'Edit Aktivitas' : 'Buat Aktivitas' 
      })} 
    />
 
    <ManagementStack.Screen 
      name="AttendanceManagement" 
      component={AttendanceManagementScreen} 
      options={{ headerTitle: 'Kelola Kehadiran' }} 
    />
    <ManagementStack.Screen 
      name="AttendanceList" 
      component={AttendanceListScreen} 
      options={{ headerTitle: 'Riwayat Aktivitas' }} 
    />
    <ManagementStack.Screen 
      name="AttendanceDetail" 
      component={AttendanceDetailScreen} 
      options={{ headerTitle: 'Detail Aktivitas' }} 
    />
    <ManagementStack.Screen 
      name="QrScanner" 
      component={QrScannerScreen} 
      options={{ headerTitle: 'Scan QR Code', headerShown: false }} 
    />
    <ManagementStack.Screen 
      name="ManualAttendance" 
      component={ManualAttendanceScreen} 
      options={{ headerTitle: 'Absen Manual' }} 
    />
    <ManagementStack.Screen 
      name="AttendanceReport" 
      component={AttendanceReportScreen} 
      options={{ headerTitle: 'Laporan Aktivitas' }} 
    />
    <ManagementStack.Screen 
      name="RaportFormal" 
      component={RaportFormalScreen} 
      options={{ headerTitle: 'Raport Formal' }} 
    />
    <ManagementStack.Screen 
      name="RaportFormalDetail" 
      component={RaportFormalDetailScreen} 
      options={{ headerTitle: 'Detail Raport Formal' }} 
    />
    <ManagementStack.Screen 
      name="RaportFormalForm" 
      component={RaportFormalFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.isEdit ? 'Edit Raport Formal' : 'Tambah Raport Formal' 
      })} 
    />
    <ManagementStack.Screen 
      name="KeuanganList" 
      component={KeuanganListScreen} 
      options={{ headerTitle: 'Laporan Keuangan' }} 
    />
    <ManagementStack.Screen 
      name="KeuanganForm" 
      component={KeuanganFormScreen} 
      options={({ route }) => ({ 
        headerTitle: route.params?.isEdit ? 'Edit Keuangan' : 'Tambah Keuangan' 
      })} 
    />
    <ManagementStack.Screen 
      name="KeuanganDetail" 
      component={KeuanganDetailScreen} 
      options={{ headerTitle: 'Detail Keuangan' }} 
    />
    <ManagementStack.Screen 
      name="RaportChildDetail" 
      component={RaportChildDetailScreen} 
      options={{ headerTitle: 'Detail Raport Anak' }} 
    />
  </ManagementStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="Profile" 
      component={AdminShelterProfileScreen} 
      options={{ headerTitle: 'Profil' }} 
    />
    <ProfileStack.Screen 
      name="ShelterGpsSettingScreen" 
      component={ShelterGpsSettingScreen} 
      options={{ headerTitle: 'GPS Setting Shelter' }} 
    />
  </ProfileStack.Navigator>
);

const AdminShelterNavigator = () => {
  const getTabBarIcon = (route, focused, color, size) => {
    const icons = {
      Home: focused ? 'home' : 'home-outline',
      Management: focused ? 'people' : 'people-outline',
      ProfileTab: focused ? 'person' : 'person-outline',
      DevTab: focused ? 'code-working' : 'code-outline',
      Attendance: focused ? 'calendar' : 'calendar-outline'
    };
    return <Ionicons name={icons[route.name]} size={size} color={color} />;
  };

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({ 
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route, focused, color, size), 
        tabBarActiveTintColor: '#e74c3c', 
        tabBarInactiveTintColor: 'gray', 
        headerShown: false 
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="Management" 
        component={ManagementStackNavigator} 
        options={{ tabBarLabel: 'Manajemen' }} 
      />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceStackNavigator} 
        options={{ tabBarLabel: 'Aktivitas' }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStackNavigator} 
        options={{ tabBarLabel: 'Profil' }} 
      />
    </Tab.Navigator>
  );
};

export default AdminShelterNavigator;
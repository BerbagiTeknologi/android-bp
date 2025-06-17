import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import AdminShelterDashboardScreen from '../features/adminShelter/screens/AdminShelterDashboardScreen';
import AdminShelterProfileScreen from '../features/adminShelter/screens/AdminShelterProfileScreen';
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

import TutorManagementScreen from '../features/adminShelter/screens/TutorManagementScreen';
import TutorFormScreen from '../features/adminShelter/screens/TutorFormScreen';
import TutorDetailScreen from '../features/adminShelter/screens/TutorDetailScreen';
import TutorHonorScreen from '../features/adminShelter/screens/TutorHonorScreen';
import TutorHonorDetailScreen from '../features/adminShelter/screens/TutorHonorDetailScreen';
import TutorActivityHistoryScreen from '../features/adminShelter/screens/TutorActivityHistoryScreen';
import TutorHonorHistory from '../features/adminShelter/screens/TutorHonorHistoryScreen';
import HonorCalculation from '../features/adminShelter/screens/HonorCalculationScreen';

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

import QrTokenGenerationScreen from '../features/adminShelter/screens/attendance/QrTokenGenerationScreen';

import PenilaianListScreen from '../features/adminShelter/screens/PenilaianListScreen';
import PenilaianFormScreen from '../features/adminShelter/screens/PenilaianFormScreen';
import RaportViewScreen from '../features/adminShelter/screens/RaportViewScreen';
import RaportGenerateScreen from '../features/adminShelter/screens/RaportGenerateScreen';
import SemesterManagementScreen from '../features/adminShelter/screens/SemesterManagementScreen';
import SemesterFormScreen from '../features/adminShelter/screens/SemesterFormScreen';
import SemesterDetailScreen from '../features/adminShelter/screens/SemesterDetailScreen';

import RaportFormalScreen from '../features/adminShelter/screens/anakDetail/RaportFormalScreen';
import RaportFormalDetailScreen from '../features/adminShelter/screens/anakDetail/RaportFormalDetailScreen';
import RaportFormalFormScreen from '../features/adminShelter/screens/anakDetail/RaportFormalFormScreen';
import TutorHonorHistoryScreen from '../features/adminShelter/screens/TutorHonorHistoryScreen';
import HonorCalculationScreen from '../features/adminShelter/screens/HonorCalculationScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ManagementStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const AttendanceStack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
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
    </HomeStack.Navigator>
  );
};

const AttendanceStackNavigator = () => {
  return (
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
        options={{ 
          headerTitle: 'Scan QR Code',
          headerShown: false
        }}
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
        name="QrTokenGeneration"
        component={QrTokenGenerationScreen}
        options={{ headerTitle: 'Generate QR Codes' }}
      />
    </AttendanceStack.Navigator>
  );
};

const ManagementStackNavigator = () => {
  return (
    <ManagementStack.Navigator>
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
        name="SemesterForm" 
        component={SemesterFormScreen} 
        options={({ route }) => ({ 
          headerTitle: route.params?.semester ? 'Edit Semester' : 'Tambah Semester'
        })}
      />
      <ManagementStack.Screen 
        name="SemesterDetail" 
        component={SemesterDetailScreen} 
        options={{ headerTitle: 'Detail Semester' }}
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
        name="ActivityDetail"
        component={ActivityDetailScreen}
        options={({ route }) => ({ 
          headerTitle: route.params?.activityName || 'Detail Aktivitas'
        })}
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
        options={{ 
          headerTitle: 'Scan QR Code',
          headerShown: false 
        }}
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
    </ManagementStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="Profile" 
        component={AdminShelterProfileScreen} 
        options={{ headerTitle: 'Profil' }}
      />
    </ProfileStack.Navigator>
  );
};

const AdminShelterNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Management') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'DevTab') {
            iconName = focused ? 'code-working' : 'code-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
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
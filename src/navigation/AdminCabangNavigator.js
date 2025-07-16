import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Dashboard screens
import AdminCabangDashboardScreen from '../features/adminCabang/screens/AdminCabangDashboardScreen';
import AdminCabangProfileScreen from '../features/adminCabang/screens/AdminCabangProfileScreen';
import SurveyStatusFilterScreen from '../features/adminCabang/screens/SurveyStatusFilterScreen';
import SurveyApprovalDetailScreen from '../features/adminCabang/screens/SurveyApprovalDetailScreen';
import AdminCabangPengajuanDonaturScreen from '../features/adminCabang/screens/AdminCabangPengajuanDonaturScreen';
import DonaturSelectionScreen from '../features/adminCabang/screens/DonaturSelectionScreen';
import ChildDetailScreen from '../features/adminCabang/screens/ChildDetailScreen';
import AdminCabangDonaturListScreen from '../features/adminCabang/screens/AdminCabangDonaturListScreen';
import AdminCabangDonaturFormScreen from '../features/adminCabang/screens/AdminCabangDonaturFormScreen';
import AdminCabangDonaturDetailScreen from '../features/adminCabang/screens/AdminCabangDonaturDetailScreen';
import DonaturFilterScreen from '../features/adminCabang/screens/DonaturFilterScreen';

// Master Data screens
import MasterDataMenuScreen from '../features/adminCabang/screens/MasterDataMenuScreen';
import JenjangListScreen from '../features/adminCabang/screens/masterData/jenjang/JenjangListScreen';
import JenjangFormScreen from '../features/adminCabang/screens/masterData/jenjang/JenjangFormScreen';
import JenjangDetailScreen from '../features/adminCabang/screens/masterData/jenjang/JenjangDetailScreen';
import MataPelajaranListScreen from '../features/adminCabang/screens/masterData/mataPelajaran/MataPelajaranListScreen';
import MataPelajaranFormScreen from '../features/adminCabang/screens/masterData/mataPelajaran/MataPelajaranFormScreen';
import MataPelajaranDetailScreen from '../features/adminCabang/screens/masterData/mataPelajaran/MataPelajaranDetailScreen';
import KelasListScreen from '../features/adminCabang/screens/masterData/kelas/KelasListScreen';
import KelasFormScreen from '../features/adminCabang/screens/masterData/kelas/KelasFormScreen';
import KelasDetailScreen from '../features/adminCabang/screens/masterData/kelas/KelasDetailScreen';
import MateriListScreen from '../features/adminCabang/screens/masterData/materi/MateriListScreen';
import MateriFormScreen from '../features/adminCabang/screens/masterData/materi/MateriFormScreen';
import MateriDetailScreen from '../features/adminCabang/screens/masterData/materi/MateriDetailScreen';

// Akademik screens
import AkademikMenuScreen from '../features/adminCabang/screens/AkademikMenuScreen';
import KurikulumListScreen from '../features/adminCabang/screens/akademik/kurikulum/KurikulumListScreen';
import KurikulumFormScreen from '../features/adminCabang/screens/akademik/kurikulum/KurikulumFormScreen';
import KurikulumDetailScreen from '../features/adminCabang/screens/akademik/kurikulum/KurikulumDetailScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createStackNavigator();
const MasterDataStack = createStackNavigator();
const AkademikStack = createStackNavigator();

// Dashboard Stack Navigator
const DashboardStackNavigator = () => (
  <DashboardStack.Navigator>
    <DashboardStack.Screen
      name="DashboardHome"
      component={AdminCabangDashboardScreen}
      options={{ headerTitle: 'Dashboard' }}
    />
    <DashboardStack.Screen
      name="Profile"
      component={AdminCabangProfileScreen}
      options={{ headerTitle: 'Profil' }}
    />
    <DashboardStack.Screen
      name="SurveyStatusFilter"
      component={SurveyStatusFilterScreen}
      options={{ headerTitle: 'Status Survey' }}
    />
    <DashboardStack.Screen
      name="SurveyApprovalDetail"
      component={SurveyApprovalDetailScreen}
      options={{ headerTitle: 'Detail Persetujuan Survey' }}
    />
    <DashboardStack.Screen
      name="PengajuanDonatur"
      component={AdminCabangPengajuanDonaturScreen}
      options={{ headerTitle: 'Pengajuan Donatur' }}
    />
    <DashboardStack.Screen
      name="DonaturSelection"
      component={DonaturSelectionScreen}
      options={{ headerTitle: 'Pilih Donatur' }}
    />
    <DashboardStack.Screen
      name="ChildDetail"
      component={ChildDetailScreen}
      options={{ headerTitle: 'Detail Anak' }}
    />
    <DashboardStack.Screen
      name="DonaturList"
      component={AdminCabangDonaturListScreen}
      options={{ headerTitle: 'Daftar Donatur' }}
    />
    <DashboardStack.Screen
      name="DonaturForm"
      component={AdminCabangDonaturFormScreen}
      options={{ headerTitle: 'Form Donatur' }}
    />
    <DashboardStack.Screen
      name="DonaturDetail"
      component={AdminCabangDonaturDetailScreen}
      options={{ headerTitle: 'Detail Donatur' }}
    />
    <DashboardStack.Screen
      name="DonaturFilter"
      component={DonaturFilterScreen}
      options={{ headerTitle: 'Filter Donatur' }}
    />
  </DashboardStack.Navigator>
);

// Master Data Stack Navigator
const MasterDataStackNavigator = () => (
  <MasterDataStack.Navigator>
    <MasterDataStack.Screen
      name="MasterDataMenu"
      component={MasterDataMenuScreen}
      options={{ headerTitle: 'Master Data' }}
    />
    <MasterDataStack.Screen
      name="JenjangList"
      component={JenjangListScreen}
      options={{ headerTitle: 'Daftar Jenjang' }}
    />
    <MasterDataStack.Screen
      name="JenjangForm"
      component={JenjangFormScreen}
      options={({ route }) => ({
        headerTitle: route.params?.isEdit ? 'Edit Jenjang' : 'Tambah Jenjang',
      })}
    />
    <MasterDataStack.Screen
      name="JenjangDetail"
      component={JenjangDetailScreen}
      options={{ headerTitle: 'Detail Jenjang' }}
    />
    <MasterDataStack.Screen
      name="MataPelajaranList"
      component={MataPelajaranListScreen}
      options={{ headerTitle: 'Daftar Mata Pelajaran' }}
    />
    <MasterDataStack.Screen
      name="MataPelajaranForm"
      component={MataPelajaranFormScreen}
      options={({ route }) => ({
        headerTitle: route.params?.isEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran',
      })}
    />
    <MasterDataStack.Screen
      name="MataPelajaranDetail"
      component={MataPelajaranDetailScreen}
      options={{ headerTitle: 'Detail Mata Pelajaran' }}
    />
    <MasterDataStack.Screen
      name="KelasList"
      component={KelasListScreen}
      options={{ headerTitle: 'Daftar Kelas' }}
    />
    <MasterDataStack.Screen
      name="KelasForm"
      component={KelasFormScreen}
      options={({ route }) => ({
        headerTitle: route.params?.isEdit ? 'Edit Kelas' : 'Tambah Kelas',
      })}
    />
    <MasterDataStack.Screen
      name="KelasDetail"
      component={KelasDetailScreen}
      options={{ headerTitle: 'Detail Kelas' }}
    />
    <MasterDataStack.Screen
      name="MateriList"
      component={MateriListScreen}
      options={{ headerTitle: 'Daftar Materi' }}
    />
    <MasterDataStack.Screen
      name="MateriForm"
      component={MateriFormScreen}
      options={({ route }) => ({
        headerTitle: route.params?.isEdit ? 'Edit Materi' : 'Tambah Materi',
      })}
    />
    <MasterDataStack.Screen
      name="MateriDetail"
      component={MateriDetailScreen}
      options={{ headerTitle: 'Detail Materi' }}
    />
  </MasterDataStack.Navigator>
);

// Akademik Stack Navigator
const AkademikStackNavigator = () => (
  <AkademikStack.Navigator>
    <AkademikStack.Screen
      name="AkademikMenu"
      component={AkademikMenuScreen}
      options={{ headerTitle: 'Akademik' }}
    />
    <AkademikStack.Screen
      name="KurikulumList"
      component={KurikulumListScreen}
      options={{ headerTitle: 'Daftar Kurikulum' }}
    />
    <AkademikStack.Screen
      name="KurikulumForm"
      component={KurikulumFormScreen}
      options={({ route }) => ({
        headerTitle: route.params?.isEdit ? 'Edit Kurikulum' : 'Tambah Kurikulum',
      })}
    />
    <AkademikStack.Screen
      name="KurikulumDetail"
      component={KurikulumDetailScreen}
      options={{ headerTitle: 'Detail Kurikulum' }}
    />
  </AkademikStack.Navigator>
);

const AdminCabangNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = focused ? 'grid' : 'grid-outline';
        else if (route.name === 'MasterData') iconName = focused ? 'library' : 'library-outline';
        else if (route.name === 'Akademik') iconName = focused ? 'school' : 'school-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007bff',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen
      name="Home"
      component={DashboardStackNavigator}
      options={{ tabBarLabel: 'Dashboard' }}
    />
    <Tab.Screen
      name="MasterData"
      component={MasterDataStackNavigator}
      options={{ tabBarLabel: 'Master Data' }}
    />
    <Tab.Screen
      name="Akademik"
      component={AkademikStackNavigator}
      options={{ tabBarLabel: 'Akademik' }}
    />
  </Tab.Navigator>
);

export default AdminCabangNavigator;

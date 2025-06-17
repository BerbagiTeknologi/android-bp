import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import AdminPusatDashboardScreen from '../features/adminPusat/screens/AdminPusatDashboardScreen';
import AdminPusatProfileScreen from '../features/adminPusat/screens/AdminPusatProfileScreen';

// Import User Management Screens
//import UserManagementScreen from '../features/adminPusat/screens/UserManagementScreen';
//import UserFormScreen from '../features/adminPusat/screens/UserFormScreen';
//import UserDetailScreen from '../features/adminPusat/screens/UserDetailScreen';

// Import Kacab Management Screens
// import KacabManagementScreen from '../features/adminPusat/screens/KacabManagementScreen';
// import KacabFormScreen from '../features/adminPusat/screens/KacabFormScreen';
// import KacabDetailScreen from '../features/adminPusat/screens/KacabDetailScreen';

// Import Keluarga Management Screens
import KeluargaManagementScreen from '../features/adminPusat/screens/KeluargaManagementScreen';
import KeluargaDetailScreen from '../features/adminPusat/screens/KeluargaDetailScreen';
import KeluargaFormScreen from '../features/adminPusat/screens/KeluargaFormScreen';

// Import Anak Management Screens
import AnakManagementScreen from '../features/adminPusat/screens/AnakManagementScreen';
import AnakDetailScreen from '../features/adminPusat/screens/AnakDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={AdminPusatDashboardScreen} 
        options={{ headerTitle: 'Admin Pusat Dashboard' }}
      />
    </Stack.Navigator>
  );
};

// Management Stack Navigator
const ManagementStackNavigator = () => {
  return (
    <Stack.Navigator>
      {/* Users */}
      {/* <Stack.Screen 
        name="UserManagement" 
        component={UserManagementScreen} 
        options={{ headerTitle: 'Manajemen Pengguna' }}
      /> */}
      {/* <Stack.Screen 
        name="UserForm" 
        component={UserFormScreen} 
        options={({ route }) => ({ 
          headerTitle: route.params?.isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'
        })}
      /> */}
      {/* <Stack.Screen 
        name="UserDetail" 
        component={UserDetailScreen} 
        options={{ headerTitle: 'Detail Pengguna' }}
      /> */}
      
      {/* Kacab */}
      {/* <Stack.Screen 
        name="KacabManagement" 
        component={KacabManagementScreen} 
        options={{ headerTitle: 'Manajemen Cabang' }}
      />
      <Stack.Screen 
        name="KacabForm" 
        component={KacabFormScreen} 
        options={({ route }) => ({ 
          headerTitle: route.params?.isEdit ? 'Edit Cabang' : 'Tambah Cabang'
        })}
      />
      <Stack.Screen 
        name="KacabDetail" 
        component={KacabDetailScreen} 
        options={{ headerTitle: 'Detail Cabang' }}
      /> */}
      
      {/* Keluarga */}
      <Stack.Screen 
        name="KeluargaManagement" 
        component={KeluargaManagementScreen} 
        options={{ headerTitle: 'Manajemen Keluarga' }}
      />
      <Stack.Screen 
        name="KeluargaForm" 
        component={KeluargaFormScreen} 
        options={({ route }) => ({ 
          headerTitle: route.params?.isEdit ? 'Edit Keluarga' : 'Tambah Keluarga'
        })}
      />
      <Stack.Screen 
        name="KeluargaDetail" 
        component={KeluargaDetailScreen} 
        options={({ route }) => ({ 
          headerTitle: route.params?.title || 'Detail Keluarga'
        })}
      />
      
      {/* Anak */}
      <Stack.Screen 
        name="AnakManagement" 
        component={AnakManagementScreen} 
        options={{ headerTitle: 'Manajemen Anak' }}
      />
      <Stack.Screen 
        name="AnakDetail" 
        component={AnakDetailScreen} 
        options={{ headerTitle: 'Detail Anak' }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Profile" 
        component={AdminPusatProfileScreen} 
        options={{ headerTitle: 'Profile Saya' }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator for Admin Pusat
const AdminPusatNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Management') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
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
        name="ProfileTab" 
        component={ProfileStackNavigator} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default AdminPusatNavigator;
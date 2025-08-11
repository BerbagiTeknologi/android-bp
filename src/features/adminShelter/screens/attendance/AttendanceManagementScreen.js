import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';

import QrTokenGenerationTab from './components/QrTokenGenerationTab';
import QrScannerTab from './components/QrScannerTab';
import AttendanceListTab from './components/AttendanceListTab';

const Tab = createMaterialTopTabNavigator();

const AttendanceManagementScreen = ({ navigation, route }) => {
  const { 
    id_aktivitas, activityName, activityDate, activityType, 
    kelompokId, kelompokName, level, completeActivity, initialTab
  } = route.params || {};

  const [initialRouteName, setInitialRouteName] = useState('QrScanner');

  useEffect(() => {
    if (initialTab) {
      setInitialRouteName(initialTab);
    }
  }, [initialTab]);

  const tabBarStyle = {
    backgroundColor: '#3498db',
    elevation: 0,
    shadowOpacity: 0,
  };

  const tabBarLabelStyle = {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'none',
  };

  const tabBarIndicatorStyle = {
    backgroundColor: '#fff',
    height: 3,
  };

  const getTabBarIcon = (iconName) => ({ color }) => (
    <Ionicons name={iconName} size={20} color={color} />
  );

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
          tabBarStyle: tabBarStyle,
          tabBarLabelStyle: tabBarLabelStyle,
          tabBarIndicatorStyle: tabBarIndicatorStyle,
          tabBarShowIcon: true,
          tabBarIconStyle: { marginBottom: 2 },
        }}
      >
        <Tab.Screen
          name="QrTokenGeneration"
          options={{
            tabBarLabel: 'Buat QR',
            tabBarIcon: getTabBarIcon('qr-code-outline'),
          }}
        >
          {(props) => (
            <QrTokenGenerationTab
              {...props}
              id_aktivitas={id_aktivitas}
              activityName={activityName}
              activityDate={activityDate}
              activityType={activityType}
              kelompokId={kelompokId}
              kelompokName={kelompokName}
              level={level}
              completeActivity={completeActivity}
            />
          )}
        </Tab.Screen>
        
        <Tab.Screen
          name="QrScanner"
          options={{
            tabBarLabel: 'Scan QR',
            tabBarIcon: getTabBarIcon('scan-outline'),
          }}
        >
          {(props) => (
            <QrScannerTab
              {...props}
              navigation={navigation}
              id_aktivitas={id_aktivitas}
              activityName={activityName}
              activityDate={activityDate}
              activityType={activityType}
              kelompokId={kelompokId}
              kelompokName={kelompokName}
            />
          )}
        </Tab.Screen>
        
        <Tab.Screen
          name="AttendanceList"
          options={{
            tabBarLabel: 'Daftar',
            tabBarIcon: getTabBarIcon('list-outline'),
          }}
        >
          {(props) => (
            <AttendanceListTab
              {...props}
              navigation={navigation}
              id_aktivitas={id_aktivitas}
              activityName={activityName}
              activityDate={activityDate}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default AttendanceManagementScreen;
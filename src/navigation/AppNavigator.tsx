import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ExchangeScreen from '../screens/ExchangeScreen';
import WalletScreen from '../screens/WalletScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CurrencyDetailScreen from '../screens/CurrencyDetailScreen';
import TransactionScreen from '../screens/TransactionScreen';
import Settings from '../screens/Settings';

// Type definitions for navigation
export type RootStackParamList = {
  Main: undefined;
  CurrencyDetail: { currencyCode: string };
  Transaction: { type: 'buy' | 'sell' | 'exchange'; currencyCode?: string };
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Exchange: undefined;
  Wallet: undefined;
  Analytics: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Main tab navigator
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
          position: 'absolute',
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView tint="dark" intensity={90} style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: '#00E5FF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontWeight: '600' }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Exchange" 
        component={ExchangeScreen} 
        options={{
          tabBarIcon: ({color}) => <Ionicons name="swap-horizontal" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen} 
        options={{
          tabBarIcon: ({color}) => <Ionicons name="wallet" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{
          tabBarIcon: ({color}) => <Ionicons name="stats-chart" size={24} color={color} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({color}) => <Ionicons name="person" size={24} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

// Root stack navigator
const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="CurrencyDetail" component={CurrencyDetailScreen} />
      <Stack.Screen name="Transaction" component={TransactionScreen} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    margin: 10,
    borderRadius: 20,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
});

export default AppNavigator;
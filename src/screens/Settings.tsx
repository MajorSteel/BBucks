import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Custom components
import { Card, Button, TextBlock, Separator } from '../components/UIComponents';
import { useTheme, ThemeType } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';

const Settings = () => {
  const navigation = useNavigation();
  const { colors, isDark, setTheme, theme } = useTheme();
  
  // State
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState<boolean>(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [isRateAlertsEnabled, setIsRateAlertsEnabled] = useState<boolean>(true);
  const [isPromoNotificationsEnabled, setIsPromoNotificationsEnabled] = useState<boolean>(false);
  const [currencyFormat, setCurrencyFormat] = useState<'symbol' | 'code'>('symbol');
  const [defaultCurrency, setDefaultCurrency] = useState<string>('INR');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  
  // Animate elements when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
      
      return () => {
        fadeAnim.setValue(0);
        translateY.setValue(30);
      };
    }, [])
  );

  // Toggle theme
  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
  };

  // Currency format toggle
  const toggleCurrencyFormat = () => {
    setCurrencyFormat(prev => prev === 'symbol' ? 'code' : 'symbol');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <Card style={styles.settingsCard}>
            <Text style={[styles.settingGroupTitle, { color: colors.text }]}>Theme Mode</Text>
            
            <View style={styles.themeSelector}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === 'light' && styles.themeOptionSelected,
                  {
                    backgroundColor: theme === 'light' 
                      ? `${colors.primary}20` 
                      : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  }
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <Ionicons
                  name="sunny"
                  size={24}
                  color={theme === 'light' ? colors.primary : colors.subtext}
                  style={{ marginBottom: 4 }}
                />
                <Text style={{
                  color: theme === 'light' ? colors.primary : colors.subtext,
                  fontWeight: theme === 'light' ? 'bold' : 'normal',
                }}>
                  Light
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === 'dark' && styles.themeOptionSelected,
                  {
                    backgroundColor: theme === 'dark' 
                      ? `${colors.primary}20` 
                      : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  }
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <Ionicons
                  name="moon"
                  size={24}
                  color={theme === 'dark' ? colors.primary : colors.subtext}
                  style={{ marginBottom: 4 }}
                />
                <Text style={{
                  color: theme === 'dark' ? colors.primary : colors.subtext,
                  fontWeight: theme === 'dark' ? 'bold' : 'normal',
                }}>
                  Dark
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === 'system' && styles.themeOptionSelected,
                  {
                    backgroundColor: theme === 'system' 
                      ? `${colors.primary}20` 
                      : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  }
                ]}
                onPress={() => handleThemeChange('system')}
              >
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={theme === 'system' ? colors.primary : colors.subtext}
                  style={{ marginBottom: 4 }}
                />
                <Text style={{
                  color: theme === 'system' ? colors.primary : colors.subtext,
                  fontWeight: theme === 'system' ? 'bold' : 'normal',
                }}>
                  System
                </Text>
              </TouchableOpacity>
            </View>
            
            <Separator />
            
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Currency Format
                </Text>
                <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                  {currencyFormat === 'symbol' ? 'Display currency as symbol (e.g. $)' : 'Display currency as code (e.g. USD)'}
                </Text>
              </View>
              <View style={styles.formatSelector}>
                <TouchableOpacity
                  style={[
                    styles.formatOption,
                    currencyFormat === 'symbol' && styles.formatOptionSelected,
                    {
                      backgroundColor: currencyFormat === 'symbol' 
                        ? `${colors.primary}20` 
                        : 'transparent'
                    }
                  ]}
                  onPress={() => setCurrencyFormat('symbol')}
                >
                  <Text style={{
                    color: currencyFormat === 'symbol' ? colors.primary : colors.subtext,
                    fontWeight: 'bold',
                  }}>
                    $
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.formatOption,
                    currencyFormat === 'code' && styles.formatOptionSelected,
                    {
                      backgroundColor: currencyFormat === 'code' 
                        ? `${colors.primary}20` 
                        : 'transparent'
                    }
                  ]}
                  onPress={() => setCurrencyFormat('code')}
                >
                  <Text style={{
                    color: currencyFormat === 'code' ? colors.primary : colors.subtext,
                    fontWeight: 'bold',
                  }}>
                    USD
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </Animated.View>
        
        {/* Notification Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          
          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Enable Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                  Receive important updates and alerts
                </Text>
              </View>
              <Switch
                value={isNotificationsEnabled}
                onValueChange={setIsNotificationsEnabled}
                trackColor={{ false: '#767577', true: `${colors.primary}80` }}
                thumbColor={isNotificationsEnabled ? colors.primary : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
            
            <Separator />
            
            <View style={[styles.settingRow, !isNotificationsEnabled && { opacity: 0.5 }]}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Rate Alerts
                </Text>
                <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                  Notify when exchange rates change significantly
                </Text>
              </View>
              <Switch
                value={isRateAlertsEnabled}
                onValueChange={setIsRateAlertsEnabled}
                disabled={!isNotificationsEnabled}
                trackColor={{ false: '#767577', true: `${colors.primary}80` }}
                thumbColor={isRateAlertsEnabled ? colors.primary : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
            
            <Separator />
            
            <View style={[styles.settingRow, !isNotificationsEnabled && { opacity: 0.5 }]}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Promotional Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                  Receive offers, discounts, and promotional material
                </Text>
              </View>
              <Switch
                value={isPromoNotificationsEnabled}
                onValueChange={setIsPromoNotificationsEnabled}
                disabled={!isNotificationsEnabled}
                trackColor={{ false: '#767577', true: `${colors.primary}80` }}
                thumbColor={isPromoNotificationsEnabled ? colors.primary : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          </Card>
        </Animated.View>
        
        {/* Security Settings */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
          
          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Biometric Authentication
                </Text>
                <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                  Use fingerprint or face ID for secure login
                </Text>
              </View>
              <Switch
                value={isBiometricEnabled}
                onValueChange={setIsBiometricEnabled}
                trackColor={{ false: '#767577', true: `${colors.primary}80` }}
                thumbColor={isBiometricEnabled ? colors.primary : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
            
            <Separator />
            
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Change PIN
                </Text>
                <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                  Update your security PIN
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
            
            <Separator />
            
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Transaction Authentication
                </Text>
                <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                  Configure authentication for transactions
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
          </Card>
        </Animated.View>
        
        {/* About & Legal */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About & Legal</Text>
          
          <Card style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Terms of Service
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
            
            <Separator />
            
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Privacy Policy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
            
            <Separator />
            
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  About Bharat Bucks
                </Text>
                <Text style={[styles.settingDescription, { color: colors.subtext }]}>
                  Version 1.0.0 (Build 2025.05.29)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
          </Card>
        </Animated.View>
        
        {/* Account Actions */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <Card style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.primary }]}>
                Send Feedback
              </Text>
              <Ionicons name="paper-plane" size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <Separator />
            
            <TouchableOpacity style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.error }]}>
                Log Out
              </Text>
              <Ionicons name="log-out" size={20} color={colors.error} />
            </TouchableOpacity>
          </Card>
        </Animated.View>
        
        {/* App Credits */}
        <Animated.View
          style={[
            styles.creditsSection,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <Text style={[styles.creditsText, { color: colors.subtext }]}>
            Bharat Bucks © 2025
          </Text>
          <Text style={[styles.creditsText, { color: colors.subtext }]}>
            Made with ❤️ in India
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
  },
  themeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  themeOption: {
    width: '30%',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionSelected: {
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  formatSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  formatOption: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatOptionSelected: {
    borderRadius: 4,
  },
  creditsSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  creditsText: {
    fontSize: 12,
    marginVertical: 2,
  },
});

export default Settings;
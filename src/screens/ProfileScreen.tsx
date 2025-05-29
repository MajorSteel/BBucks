import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Animated,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

// Custom components
import { Card, Button, TextBlock, Separator } from '../components/UIComponents';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';

const { width } = Dimensions.get('window');

// Mock user data
const userData = {
  name: 'Ayush Sharma',
  email: 'ayush.sharma@example.com',
  photo: 'https://api.a0.dev/assets/image?text=Professional+Indian+male+business+person+profile+photo&aspect=1:1&seed=1234',
  kycVerified: true,
  joinedDate: 'Jan 2023',
  tier: 'Premium',
  referralCode: 'AYUSH2023',
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark, setTheme, theme } = useTheme();
  const { wallet, currencies } = useCurrency();
  
  // State
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const profileImageScale = useRef(new Animated.Value(0.8)).current;
  
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
        Animated.spring(profileImageScale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
      
      return () => {
        fadeAnim.setValue(0);
        translateY.setValue(30);
        profileImageScale.setValue(0.8);
      };
    }, [])
  );

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Calculate total balance
  const getTotalBalance = () => {
    return Object.entries(wallet).reduce((total, [code, amount]) => {
      const currency = currencies.find(c => c.code === code);
      if (currency) {
        if (code === 'INR') {
          return total + amount;
        } else {
          // Convert to INR
          const inrValue = amount / currency.rate;
          return total + inrValue;
        }
      }
      return total;
    }, 0);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="settings-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View style={[
          styles.profileCardContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Card gradient style={styles.profileCard}>
            <LinearGradient
              colors={colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileGradient}
            />
            
            <View style={styles.profileContent}>
              <Animated.View style={[
                styles.profileImageContainer,
                { transform: [{ scale: profileImageScale }] }
              ]}>
                <Image
                  source={{ uri: userData.photo }}
                  style={styles.profileImage}
                />
                {userData.kycVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  </View>
                )}
              </Animated.View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData.name}</Text>
                <Text style={styles.profileEmail}>{userData.email}</Text>
                
                <View style={styles.profileStats}>
                  <View style={styles.profileStat}>
                    <Text style={styles.profileStatValue}>
                      ₹{getTotalBalance().toFixed(2)}
                    </Text>
                    <Text style={styles.profileStatLabel}>Total Balance</Text>
                  </View>
                  <View style={styles.statsVerticalDivider} />
                  <View style={styles.profileStat}>
                    <Text style={styles.profileStatValue}>
                      {userData.tier}
                    </Text>
                    <Text style={styles.profileStatLabel}>Member Tier</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>
        
        {/* Account Section */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          
          <Card style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="person-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Personal Information
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
            
            <Separator />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: `${colors.accent}20` }]}>
                  <Ionicons name="card-outline" size={22} color={colors.accent} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Payment Methods
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
            
            <Separator />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: `${colors.secondary}20` }]}>
                  <Ionicons name="shield-checkmark-outline" size={22} color={colors.secondary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  KYC Verification
                </Text>
              </View>
              {userData.kycVerified ? (
                <View style={styles.verifiedLabel}>
                  <Text style={styles.verifiedLabelText}>Verified</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
              )}
            </TouchableOpacity>
          </Card>
        </Animated.View>
        
        {/* App Settings */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
          
          <Card style={styles.sectionCard}>
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: isDark ? '#FFFFFF20' : '#00000010' }]}>
                  <Ionicons 
                    name={isDark ? "moon" : "sunny"} 
                    size={22} 
                    color={isDark ? "#FFFFFF" : "#FFA500"} 
                  />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: `${colors.primary}80` }}
                thumbColor={isDark ? colors.primary : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
            
            <Separator />
            
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: `${colors.success}20` }]}>
                  <Ionicons name="notifications-outline" size={22} color={colors.success} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Notifications
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
            
            <View style={styles.settingsItem}>
              <View style={styles.settingsItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: `${colors.warning}20` }]}>
                  <Ionicons name="finger-print" size={22} color={colors.warning} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Biometric Authentication
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
          </Card>
        </Animated.View>
        
        {/* Referral Card */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Refer & Earn</Text>
          
          <Card gradient style={styles.referralCard}>
            <View style={styles.referralContent}>
              <View style={styles.referralImageContainer}>
                <Image
                  source={{ uri: 'https://api.a0.dev/assets/image?text=3D+gift+box+with+sparkling+effect&aspect=1:1&seed=9283' }}
                  style={styles.referralImage}
                  resizeMode="contain"
                />
              </View>
              
              <View style={styles.referralInfo}>
                <Text style={styles.referralTitle}>
                  Invite Friends & Earn Rewards
                </Text>
                <Text style={styles.referralDescription}>
                  Share your referral code and both of you will earn ₹100 when they make their first exchange
                </Text>
                
                <View style={styles.referralCodeContainer}>
                  <Text style={styles.referralCode}>{userData.referralCode}</Text>
                  <TouchableOpacity style={styles.copyButton}>
                    <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                
                <Button
                  title="Share Referral Code"
                  icon="share-social-outline"
                  onPress={() => {}}
                  type="primary"
                  size="small"
                  style={styles.shareButton}
                />
              </View>
            </View>
          </Card>
        </Animated.View>
        
        {/* Support and Help */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support & Help</Text>
          
          <Card style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Help Center
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
            
            <Separator />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: `${colors.success}20` }]}>
                  <Ionicons name="chatbubble-outline" size={22} color={colors.success} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Contact Support
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
            
            <Separator />
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuItemIcon, { backgroundColor: `${colors.secondary}20` }]}>
                  <Ionicons name="document-text-outline" size={22} color={colors.secondary} />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Terms & Privacy Policy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </TouchableOpacity>
          </Card>
        </Animated.View>
        
        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={() => {}}
            type="outline"
            size="medium"
            icon="log-out-outline"
            style={{ width: '100%' }}
          />
          
          <Text style={[styles.versionText, { color: colors.subtext }]}>
            Version 1.0.0
          </Text>
        </View>
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
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerAction: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCardContainer: {
    padding: 20,
  },
  profileCard: {
    padding: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 20,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#28C76F',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileStat: {
    flex: 1,
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  statsVerticalDivider: {
    width: 1,
    backgroundColor: '#FFFFFF40',
    marginHorizontal: 12,
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
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  verifiedLabel: {
    backgroundColor: '#28C76F20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedLabelText: {
    color: '#28C76F',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralCard: {
    padding: 0,
    overflow: 'hidden',
  },
  referralContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  referralImageContainer: {
    marginRight: 16,
  },
  referralImage: {
    width: 80,
    height: 80,
  },
  referralInfo: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  referralDescription: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 12,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  referralCode: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  copyButton: {
    padding: 4,
  },
  shareButton: {
    alignSelf: 'flex-start',
  },
  logoutContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    marginTop: 12,
  },
});

export default ProfileScreen;
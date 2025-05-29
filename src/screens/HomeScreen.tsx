import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  RefreshControl,
  Platform,
  ImageBackground,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Custom components and hooks
import { Card, Button, TextBlock, Badge } from '../components/UIComponents';
import { CurrencyCard, RateTicker } from '../components/CurrencyComponents';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency, Currency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/helpers';
import { useNavigation } from '@react-navigation/native';

// Screen dimensions
const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { 
    currencies, 
    wallet, 
    refreshRates, 
    loading,
    getFavorites, 
    convertCurrency
  } = useCurrency();
  
  const [refreshing, setRefreshing] = useState(false);
  const [inrBalance, setInrBalance] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [inrBalanceWidth, setInrBalanceWidth] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const translateYCards = useRef(new Animated.Value(100)).current;
  
  // Get the 3D globe image
  const globeImage = 'https://api.a0.dev/assets/image?text=3D+rotating+currency+globe+with+markers+for+international+currencies&aspect=1:1&seed=7382';

  // Prepare rate data for ticker
  const tickerData = currencies
    .filter(c => c.code !== 'INR')
    .map(currency => ({
      fromCurrency: 'INR',
      toCurrency: currency.code,
      rate: currency.rate,
      change: currency.change24h,
    }));
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshRates();
    setRefreshing(false);
  };
  
  // Calculate balances when currencies or wallet changes
  useEffect(() => {
    // Calculate INR balance
    const inr = wallet.INR || 0;
    setInrBalance(inr);
    
    // Calculate total balance in INR
    let total = inr;
    Object.entries(wallet).forEach(([code, amount]) => {
      if (code !== 'INR' && amount > 0) {
        total += convertCurrency(amount, code, 'INR');
      }
    });
    
    setTotalBalance(total);
    
    // Calculate percentage of INR in total balance
    const inrPercentage = totalBalance > 0 ? (inrBalance / totalBalance) * 100 : 0;
    setInrBalanceWidth(inrPercentage);
  }, [currencies, wallet]);
  
  // Animate elements when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Run entry animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(translateYCards, {
          toValue: 0,
          duration: 1000,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      return () => {
        // Reset animations when screen loses focus
        fadeAnim.setValue(0);
        translateY.setValue(50);
        translateYCards.setValue(100);
      };
    }, [])
  );
  
  // Go to currency detail
  const handleCurrencyPress = (currencyCode: string) => {
    navigation.navigate('CurrencyDetail' as never, { currencyCode } as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header with App Name and User Profile */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY }] 
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.appName, { color: colors.text }]}>Bharat Bucks</Text>
            <Text style={[styles.appTagline, { color: colors.subtext }]}>
              Real-time currency exchange
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Ionicons name="person-circle" size={40} color={colors.primary} />
            <Badge value="2" size="small" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Balance Summary Card */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Card gradient blurred style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceTitle}>Total Balance</Text>
              <TouchableOpacity style={styles.balanceActions}>
                <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.totalBalance}>
              ₹{totalBalance.toFixed(2)}
            </Text>
            
            <View style={styles.balanceBreakdown}>
              <View style={styles.balanceBar}>
                <View 
                  style={[
                    styles.balanceBarInr, 
                    { width: `${inrBalanceWidth}%` }
                  ]} 
                />
              </View>
              
              <View style={styles.balanceLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                  <Text style={styles.legendText}>INR: ₹{inrBalance.toFixed(2)}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#FFFFFF30' }]} />
                  <Text style={styles.legendText}>Foreign: ₹{(totalBalance - inrBalance).toFixed(2)}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.balanceActions}>
              <Button 
                title="Deposit" 
                icon="arrow-down" 
                onPress={() => navigation.navigate('Transaction' as never, { type: 'buy', currencyCode: 'INR' } as never)}
                type="outline"
                size="small"
                style={{ marginRight: 8 }}
              />
              <Button 
                title="Exchange" 
                icon="swap-horizontal" 
                onPress={() => navigation.navigate('Exchange' as never)}
                type="accent" 
                size="small"
              />
            </View>
          </Card>
        </Animated.View>
        
        {/* Live Rates Ticker */}
        <Animated.View style={[
          { 
            opacity: fadeAnim,
            transform: [{ translateY }],
            width: '100%',
          }
        ]}>
          <RateTicker rates={tickerData} speed="medium" />
        </Animated.View>
        
        {/* 3D Globe Visualization */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYCards }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Global Currency Map
          </Text>
          
          <Card style={styles.globeCard} gradient>
            <ImageBackground 
              source={{ uri: globeImage }}
              style={styles.globeImage}
              resizeMode="cover"
            >
              <LinearGradient 
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.globeGradient}
              />
              
              <View style={styles.globeContent}>
                <Text style={styles.globeTitle}>Explore Global Currencies</Text>
                <Text style={styles.globeSubtitle}>
                  Track live exchanges across the world
                </Text>
                
                <Button 
                  title="View All Currencies" 
                  type="primary"
                  size="small"
                  onPress={() => navigation.navigate('Exchange' as never)}
                  style={{ alignSelf: 'flex-start', marginTop: 12 }}
                />
              </View>
            </ImageBackground>
          </Card>
        </Animated.View>
        
        {/* Recent Currency List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Favorite Currencies
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Exchange' as never)}>
              <Text style={[styles.sectionAction, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <Animated.View style={[
            styles.currencyListWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYCards }]
            }
          ]}>
            <FlatList
              horizontal
              data={getFavorites()}
              keyExtractor={(item) => item.code}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.currencyList}
              renderItem={({ item }) => (
                <CurrencyCard 
                  currency={item} 
                  balance={wallet[item.code] || 0}
                  showBalance={wallet[item.code] > 0}
                  onPress={() => handleCurrencyPress(item.code)}
                  favorite={true}
                  style={{ marginRight: 16 }}
                />
              )}
            />
          </Animated.View>
        </View>
        
        {/* Quick Actions */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYCards }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Transaction' as never, { type: 'buy' } as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="arrow-down" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Buy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Transaction' as never, { type: 'sell' } as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.accent }]}>
                <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Sell</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Transaction' as never, { type: 'exchange' } as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Exchange</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Analytics' as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warning }]}>
                <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>Analytics</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  appTagline: {
    fontSize: 14,
    opacity: 0.7,
  },
  profileButton: {
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  balanceCard: {
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  totalBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  balanceBreakdown: {
    marginBottom: 20,
  },
  balanceBar: {
    height: 8,
    backgroundColor: '#FFFFFF30',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  balanceBarInr: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 4,
  },
  balanceLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  currencyListWrapper: {
    marginLeft: -20, // Offset for container padding
    width: width,
  },
  currencyList: {
    paddingLeft: 20,
    paddingRight: 4,
  },
  globeCard: {
    padding: 0,
    overflow: 'hidden',
  },
  globeImage: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-end',
  },
  globeGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '80%',
  },
  globeContent: {
    padding: 16,
  },
  globeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  globeSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: (width - 40) / 4, // Adjust for screen width and padding
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HomeScreen;
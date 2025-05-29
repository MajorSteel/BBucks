import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Custom components
import { Card, Button, TextBlock, Separator } from '../components/UIComponents';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency } from '../utils/helpers';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Time range options for charts
const timeRanges = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '1Y', value: '1y' },
  { label: 'All', value: 'all' },
];

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { currencies, wallet } = useCurrency();
  
  // State
  const [selectedTimeRange, setSelectedTimeRange] = useState('1m');
  const [walletDistribution, setWalletDistribution] = useState<{ code: string; value: number; percentage: number }[]>([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  
  // Images for the charts
  const lineChartImage = 'https://api.a0.dev/assets/image?text=3D+currency+exchange+line+chart+with+glowing+lines+and+grid&aspect=2:1&seed=9284';
  const pieChartImage = 'https://api.a0.dev/assets/image?text=3D+pie+chart+showing+currency+distribution&aspect=1:1&seed=4731';
  const barChartImage = 'https://api.a0.dev/assets/image?text=3D+bar+chart+showing+currency+performance&aspect=3:2&seed=1267';
  const forecastImage = 'https://api.a0.dev/assets/image?text=3D+AI+forecast+model+for+currency+exchange+rates&aspect=2:1&seed=7655';
  
  // Calculate wallet distribution when wallet changes
  useEffect(() => {
    const totalInINR = Object.entries(wallet).reduce((total, [code, amount]) => {
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
    
    const distribution = Object.entries(wallet)
      .filter(([_, amount]) => amount > 0)
      .map(([code, amount]) => {
        const currency = currencies.find(c => c.code === code);
        if (!currency) return { code, value: amount, percentage: 0 };
        
        let inrValue = code === 'INR' ? amount : amount / currency.rate;
        const percentage = (inrValue / totalInINR) * 100;
        
        return {
          code,
          value: amount,
          percentage,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
    
    setWalletDistribution(distribution);
  }, [wallet, currencies]);
  
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

  // Get color for currency by code
  const getCurrencyColor = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.color : colors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
            Track your currency performance
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerAction}
          onPress={() => navigation.navigate('Settings' as never)}
        >
          <Ionicons name="options-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Exchange Rate Chart */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Exchange Rate Trends
            </Text>
            <TouchableOpacity style={styles.currencySelector}>
              <Text style={{ color: colors.primary }}>USD/INR</Text>
              <Ionicons name="chevron-down" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          
          <Card style={styles.chartCard}>
            <Image
              source={{ uri: lineChartImage }}
              style={styles.chartImage}
              resizeMode="cover"
            />
            
            <View style={styles.timeRangeContainer}>
              {timeRanges.map(range => (
                <TouchableOpacity
                  key={range.value}
                  style={[
                    styles.timeRangeButton,
                    selectedTimeRange === range.value && {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                    }
                  ]}
                  onPress={() => setSelectedTimeRange(range.value)}
                >
                  <Text
                    style={[
                      styles.timeRangeText,
                      { color: selectedTimeRange === range.value ? colors.primary : colors.subtext }
                    ]}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Current</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>₹82.25</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Change</Text>
                <Text style={[styles.statChange, { color: colors.success }]}>+0.45%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>High</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>₹82.50</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Low</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>₹82.10</Text>
              </View>
            </View>
          </Card>
        </Animated.View>
        
        {/* Wallet Distribution */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Wallet Distribution
          </Text>
          
          <Card style={styles.walletDistributionCard}>
            <View style={styles.pieChartContainer}>
              <Image
                source={{ uri: pieChartImage }}
                style={styles.pieChartImage}
                resizeMode="contain"
              />
            </View>
            
            <View style={styles.distributionList}>
              {walletDistribution.map((item, index) => {
                const currency = currencies.find(c => c.code === item.code);
                if (!currency) return null;
                
                return (
                  <View key={item.code} style={styles.distributionItem}>
                    <View style={styles.distributionItemLeft}>
                      <View 
                        style={[
                          styles.colorIndicator, 
                          { backgroundColor: getCurrencyColor(item.code) }
                        ]} 
                      />
                      <Text style={[styles.distributionCurrency, { color: colors.text }]}>
                        {currency.code} - {currency.name}
                      </Text>
                    </View>
                    <Text style={[styles.distributionPercentage, { color: colors.primary }]}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </Animated.View>
        
        {/* Currency Performance */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Currency Performance (vs. INR)
          </Text>
          
          <Card style={styles.performanceCard}>
            <Image
              source={{ uri: barChartImage }}
              style={styles.barChartImage}
              resizeMode="contain"
            />
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.performanceList}>
              {currencies.filter(c => c.code !== 'INR').map((currency, index) => (
                <View key={currency.code} style={styles.performanceItem}>
                  <Text style={[styles.performanceCode, { color: colors.text }]}>
                    {currency.code}
                  </Text>
                  <View style={[
                    styles.performanceChangeContainer,
                    { 
                      backgroundColor: currency.change24h >= 0 
                        ? colors.success + '20' 
                        : colors.error + '20'
                    }
                  ]}>
                    <Text style={[
                      styles.performanceChange,
                      { 
                        color: currency.change24h >= 0 
                          ? colors.success 
                          : colors.error
                      }
                    ]}>
                      {currency.change24h >= 0 ? '+' : ''}{currency.change24h.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Card>
        </Animated.View>
        
        {/* AI Forecast */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              AI Forecast
            </Text>
            <Badge value="BETA" color={colors.secondary} />
          </View>
          
          <Card style={styles.forecastCard} gradient>
            <Image
              source={{ uri: forecastImage }}
              style={styles.forecastImage}
              resizeMode="cover"
            />
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.forecastOverlay}
            />
            
            <View style={styles.forecastContent}>
              <Text style={styles.forecastTitle}>
                USD/INR Trend Prediction
              </Text>
              <Text style={styles.forecastSubtitle}>
                Next 7 days outlook: <Text style={{ color: colors.success }}>Bullish</Text>
              </Text>
              
              <View style={styles.forecastStats}>
                <View style={styles.forecastStat}>
                  <Text style={styles.forecastStatLabel}>Predicted Range</Text>
                  <Text style={styles.forecastStatValue}>₹82.10 - ₹82.95</Text>
                </View>
                <View style={styles.forecastStat}>
                  <Text style={styles.forecastStatLabel}>Confidence</Text>
                  <Text style={styles.forecastStatValue}>78%</Text>
                </View>
              </View>
              
              <Button
                title="View Detailed Forecast"
                type="primary"
                size="small"
                onPress={() => {}}
                style={{ alignSelf: 'flex-start', marginTop: 16 }}
              />
            </View>
          </Card>
        </Animated.View>
        
        {/* Market Sentiment */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Market Sentiment
          </Text>
          
          <Card style={styles.sentimentCard}>
            <View style={styles.sentimentHeader}>
              <Text style={[styles.sentimentCurrency, { color: colors.text }]}>
                USD/INR
              </Text>
              <View style={styles.sentimentIndicator}>
                <View
                  style={[
                    styles.sentimentBar,
                    { width: '65%', backgroundColor: colors.success }
                  ]}
                />
              </View>
              <Text style={{ color: colors.success, fontWeight: '600' }}>
                Bullish (65%)
              </Text>
            </View>
            
            <Separator />
            
            <View style={styles.sentimentHeader}>
              <Text style={[styles.sentimentCurrency, { color: colors.text }]}>
                EUR/INR
              </Text>
              <View style={styles.sentimentIndicator}>
                <View
                  style={[
                    styles.sentimentBar,
                    { width: '45%', backgroundColor: colors.warning }
                  ]}
                />
              </View>
              <Text style={{ color: colors.warning, fontWeight: '600' }}>
                Neutral (45%)
              </Text>
            </View>
            
            <Separator />
            
            <View style={styles.sentimentHeader}>
              <Text style={[styles.sentimentCurrency, { color: colors.text }]}>
                GBP/INR
              </Text>
              <View style={styles.sentimentIndicator}>
                <View
                  style={[
                    styles.sentimentBar,
                    { width: '35%', backgroundColor: colors.error }
                  ]}
                />
              </View>
              <Text style={{ color: colors.error, fontWeight: '600' }}>
                Bearish (35%)
              </Text>
            </View>
          </Card>
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
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
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
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartCard: {
    padding: 0,
    overflow: 'hidden',
  },
  chartImage: {
    width: '100%',
    height: 200,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statChange: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  walletDistributionCard: {
    padding: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pieChartImage: {
    width: width - 72,
    height: width - 72,
    maxWidth: 300,
    maxHeight: 300,
  },
  distributionList: {
    marginTop: 8,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  distributionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  distributionCurrency: {
    fontSize: 14,
    fontWeight: '500',
  },
  distributionPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  performanceCard: {
    padding: 16,
  },
  barChartImage: {
    width: '100%',
    height: 180,
    marginBottom: 16,
  },
  performanceList: {
    marginTop: 8,
  },
  performanceItem: {
    marginRight: 16,
    alignItems: 'center',
  },
  performanceCode: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  performanceChangeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  performanceChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  forecastCard: {
    padding: 0,
    overflow: 'hidden',
  },
  forecastImage: {
    width: '100%',
    height: 200,
  },
  forecastOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  forecastContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  forecastSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 16,
    opacity: 0.9,
  },
  forecastStats: {
    flexDirection: 'row',
  },
  forecastStat: {
    marginRight: 24,
  },
  forecastStatLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 4,
  },
  forecastStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sentimentCard: {
    padding: 16,
  },
  sentimentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sentimentCurrency: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
  },
  sentimentIndicator: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sentimentBar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default AnalyticsScreen;
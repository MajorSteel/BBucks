import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Custom components and hooks
import { Card, Button, TextBlock, Separator } from '../components/UIComponents';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency, Currency } from '../contexts/CurrencyContext';
import { RateTickerProps } from '../components/CurrencyComponents';
import { formatCurrency, calculatePercentageChange } from '../utils/helpers';

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

// Chart data for each time range (mock data)
const chartImages = {
  '1d': 'https://api.a0.dev/assets/image?text=3D+daily+currency+chart+with+glowing+line&aspect=2:1&seed=8271',
  '1w': 'https://api.a0.dev/assets/image?text=3D+weekly+currency+chart+with+glowing+line&aspect=2:1&seed=8272',
  '1m': 'https://api.a0.dev/assets/image?text=3D+monthly+currency+chart+with+glowing+line&aspect=2:1&seed=8273',
  '3m': 'https://api.a0.dev/assets/image?text=3D+quarterly+currency+chart+with+glowing+line&aspect=2:1&seed=8274',
  '1y': 'https://api.a0.dev/assets/image?text=3D+yearly+currency+chart+with+glowing+line&aspect=2:1&seed=8275',
  'all': 'https://api.a0.dev/assets/image?text=3D+all+time+currency+chart+with+glowing+line&aspect=2:1&seed=8276',
};

// Types for route params
type CurrencyDetailScreenRouteProp = RouteProp<
  { CurrencyDetail: { currencyCode: string } },
  'CurrencyDetail'
>;

const CurrencyDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<CurrencyDetailScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const { currencies, wallet, convertCurrency } = useCurrency();
  
  // Get currency code from route params
  const { currencyCode } = route.params;
  
  // State
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [inrValue, setInrValue] = useState<number>(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1m');
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [stats, setStats] = useState<{ high: number; low: number; volume: string; marketCap: string }>({
    high: 0,
    low: 0,
    volume: '0',
    marketCap: '0',
  });
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Get currency data and set balance
  useEffect(() => {
    const currencyData = currencies.find(c => c.code === currencyCode);
    if (currencyData) {
      setCurrency(currencyData);
      const userBalance = wallet[currencyCode] || 0;
      setBalance(userBalance);
      
      // Calculate value in INR
      if (currencyCode === 'INR') {
        setInrValue(userBalance);
      } else {
        const valueInInr = userBalance / currencyData.rate;
        setInrValue(valueInInr);
      }
      
      // Set mock stats
      const high = currencyData.rate * 1.05;
      const low = currencyData.rate * 0.95;
      const volume = currencyData.code === 'INR' ? '₹4.2B' : `${currencyData.symbol}1.2B`;
      const marketCap = currencyData.code === 'INR' ? '₹89T' : `${currencyData.symbol}25B`;
      
      setStats({
        high,
        low,
        volume,
        marketCap,
      });
      
      // Set favorite status (in a real app, this would come from user settings)
      setIsFavorite(currencyCode === 'USD' || currencyCode === 'EUR');
    }
  }, [currencyCode, currencies, wallet]);
  
  // Animation effect when component mounts
  useEffect(() => {
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle favorite toggle
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  // Navigate to transaction screen
  const handleTransaction = (type: 'buy' | 'sell' | 'exchange') => {
    navigation.navigate(
      'Transaction' as never, 
      { type, currencyCode } as never
    );
  };

  // No currency data
  if (!currency) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateY }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.currencyHeader}>
          <Text style={styles.currencyFlag}>{currency.flag}</Text>
          <View>
            <Text style={[styles.currencyCode, { color: colors.text }]}>
              {currency.code}
            </Text>
            <Text style={[styles.currencyName, { color: colors.subtext }]}>
              {currency.name}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
        >
          <Ionicons 
            name={isFavorite ? "star" : "star-outline"} 
            size={24} 
            color={isFavorite ? "#FFD700" : colors.text} 
          />
        </TouchableOpacity>
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Rate Card */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY }, { scale: scaleAnim }],
          padding: 20,
        }}>
          <Card gradient style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <View>
                <Text style={styles.rateLabel}>
                  Current Rate
                </Text>
                <View style={styles.rateValueContainer}>
                  <Text style={styles.rateValue}>
                    {currency.code === 'INR' 
                      ? 'Base Currency' 
                      : `₹1 = ${currency.symbol}${currency.rate.toFixed(4)}`
                    }
                  </Text>
                  <View style={[
                    styles.changeContainer,
                    {
                      backgroundColor: currency.change24h >= 0 
                        ? 'rgba(40, 199, 111, 0.3)' 
                        : 'rgba(255, 71, 87, 0.3)'
                    }
                  ]}>
                    <Ionicons
                      name={currency.change24h >= 0 ? "arrow-up" : "arrow-down"}
                      size={12}
                      color={currency.change24h >= 0 ? "#28C76F" : "#FF4757"}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[
                      styles.changeText,
                      { color: currency.change24h >= 0 ? "#28C76F" : "#FF4757" }
                    ]}>
                      {Math.abs(currency.change24h).toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </View>
              
              {balance > 0 && (
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>Your Balance</Text>
                  <Text style={styles.balanceValue}>
                    {currency.symbol}{balance.toFixed(2)}
                  </Text>
                  <Text style={styles.inrValue}>
                    ≈ ₹{inrValue.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionButtons}>
              <Button
                title="Buy"
                icon="arrow-down"
                onPress={() => handleTransaction('buy')}
                type="primary"
                size="small"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Sell"
                icon="arrow-up"
                onPress={() => handleTransaction('sell')}
                type="outline"
                size="small"
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
            
            <View style={styles.exchangeButton}>
              <Button
                title="Exchange"
                icon="swap-horizontal"
                onPress={() => handleTransaction('exchange')}
                type="accent"
                size="small"
              />
            </View>
          </Card>
        </Animated.View>
        
        {/* Chart Section */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Price Chart
            </Text>
          </View>
          
          <Card style={styles.chartCard}>
            <Image
              source={{ uri: chartImages[selectedTimeRange as keyof typeof chartImages] }}
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
                <Text style={[styles.statLabel, { color: colors.subtext }]}>24h High</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {currency.symbol}{stats.high.toFixed(4)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>24h Low</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {currency.symbol}{stats.low.toFixed(4)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Volume</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.volume}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Market Cap</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.marketCap}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>
        
        {/* Quick Conversion */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Conversion
          </Text>
          
          <Card style={styles.conversionCard}>
            <View style={styles.conversionRow}>
              <Text style={[styles.conversionLabel, { color: colors.text }]}>
                1 {currency.code} =
              </Text>
              <Text style={[styles.conversionValue, { color: colors.primary }]}>
                ₹{(1 / currency.rate).toFixed(4)}
              </Text>
            </View>
            
            <Separator />
            
            <View style={styles.conversionRow}>
              <Text style={[styles.conversionLabel, { color: colors.text }]}>
                1000 {currency.code} =
              </Text>
              <Text style={[styles.conversionValue, { color: colors.primary }]}>
                ₹{(1000 / currency.rate).toFixed(2)}
              </Text>
            </View>
            
            <Separator />
            
            <View style={styles.conversionRow}>
              <Text style={[styles.conversionLabel, { color: colors.text }]}>
                ₹1 =
              </Text>
              <Text style={[styles.conversionValue, { color: colors.primary }]}>
                {currency.symbol}{currency.rate.toFixed(4)}
              </Text>
            </View>
            
            <Separator />
            
            <View style={styles.conversionRow}>
              <Text style={[styles.conversionLabel, { color: colors.text }]}>
                ₹10,000 =
              </Text>
              <Text style={[styles.conversionValue, { color: colors.primary }]}>
                {currency.symbol}{(10000 * currency.rate).toFixed(2)}
              </Text>
            </View>
          </Card>
        </Animated.View>
        
        {/* Market Information */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Market Information
          </Text>
          
          <Card style={styles.marketCard}>
            <View style={styles.marketInfoItem}>
              <Text style={[styles.marketInfoLabel, { color: colors.subtext }]}>
                Issued By
              </Text>
              <Text style={[styles.marketInfoValue, { color: colors.text }]}>
                {currency.code === 'INR' ? 'Reserve Bank of India' 
                  : currency.code === 'USD' ? 'Federal Reserve'
                  : currency.code === 'EUR' ? 'European Central Bank'
                  : currency.code === 'GBP' ? 'Bank of England'
                  : currency.code === 'JPY' ? 'Bank of Japan'
                  : currency.code === 'AUD' ? 'Reserve Bank of Australia'
                  : currency.code === 'CAD' ? 'Bank of Canada'
                  : currency.code === 'SGD' ? 'Monetary Authority of Singapore'
                  : currency.code === 'AED' ? 'Central Bank of UAE'
                  : 'Central Bank'
                }
              </Text>
            </View>
            
            <Separator />
            
            <View style={styles.marketInfoItem}>
              <Text style={[styles.marketInfoLabel, { color: colors.subtext }]}>
                Volatility (30d)
              </Text>
              <Text style={[styles.marketInfoValue, { color: colors.text }]}>
                {currency.code === 'INR' ? 'Low' 
                  : currency.code === 'USD' ? 'Low'
                  : currency.code === 'EUR' ? 'Medium'
                  : currency.code === 'GBP' ? 'Medium'
                  : currency.code === 'JPY' ? 'Low'
                  : 'Medium'
                }
              </Text>
            </View>
            
            <Separator />
            
            <View style={styles.marketInfoItem}>
              <Text style={[styles.marketInfoLabel, { color: colors.subtext }]}>
                Currency Ranking
              </Text>
              <Text style={[styles.marketInfoValue, { color: colors.text }]}>
                {currency.code === 'USD' ? '#1 Most Traded'
                  : currency.code === 'EUR' ? '#2 Most Traded'
                  : currency.code === 'JPY' ? '#3 Most Traded'
                  : currency.code === 'GBP' ? '#4 Most Traded'
                  : currency.code === 'INR' ? '#16 Most Traded'
                  : 'Top 20 Most Traded'
                }
              </Text>
            </View>
            
            <Separator />
            
            <View style={styles.marketInfoItem}>
              <Text style={[styles.marketInfoLabel, { color: colors.subtext }]}>
                Trading Hours
              </Text>
              <Text style={[styles.marketInfoValue, { color: colors.text }]}>
                24/7 International Forex Market
              </Text>
            </View>
          </Card>
        </Animated.View>
        
        {/* Related Currencies */}
        <Animated.View style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Related Currencies
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Exchange' as never)}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedCurrenciesList}
          >
            {currencies
              .filter(c => c.code !== currency.code)
              .slice(0, 5)
              .map(relatedCurrency => (
                <TouchableOpacity
                  key={relatedCurrency.code}
                  style={[
                    styles.relatedCurrencyCard,
                    { backgroundColor: isDark ? colors.cardAlt : '#F5F7FA' }
                  ]}
                  onPress={() => navigation.navigate(
                    'CurrencyDetail' as never,
                    { currencyCode: relatedCurrency.code } as never
                  )}
                >
                  <View style={styles.relatedCurrencyHeader}>
                    <Text style={styles.relatedCurrencyFlag}>
                      {relatedCurrency.flag}
                    </Text>
                    <Text style={[styles.relatedCurrencyCode, { color: colors.text }]}>
                      {relatedCurrency.code}
                    </Text>
                  </View>
                  
                  <Text style={[styles.relatedCurrencyRate, { color: colors.primary }]}>
                    {relatedCurrency.code === 'INR' 
                      ? 'Base' 
                      : `₹1 = ${relatedCurrency.symbol}${relatedCurrency.rate.toFixed(4)}`
                    }
                  </Text>
                  
                  <View style={[
                    styles.relatedCurrencyChange,
                    {
                      backgroundColor: relatedCurrency.change24h >= 0 
                        ? 'rgba(40, 199, 111, 0.2)' 
                        : 'rgba(255, 71, 87, 0.2)'
                    }
                  ]}>
                    <Ionicons
                      name={relatedCurrency.change24h >= 0 ? "arrow-up" : "arrow-down"}
                      size={12}
                      color={relatedCurrency.change24h >= 0 ? "#28C76F" : "#FF4757"}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={{
                      color: relatedCurrency.change24h >= 0 ? "#28C76F" : "#FF4757",
                      fontWeight: '600',
                      fontSize: 12,
                    }}>
                      {Math.abs(relatedCurrency.change24h).toFixed(2)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            }
          </ScrollView>
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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  currencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyFlag: {
    fontSize: 24,
    marginRight: 8,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  currencyName: {
    fontSize: 14,
  },
  favoriteButton: {
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
  rateCard: {
    padding: 20,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rateLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 6,
  },
  rateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inrValue: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  exchangeButton: {
    alignItems: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  conversionCard: {
    padding: 0,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  conversionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  conversionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  marketCard: {
    padding: 0,
  },
  marketInfoItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  marketInfoLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  marketInfoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  relatedCurrenciesList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  relatedCurrencyCard: {
    width: 140,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  relatedCurrencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  relatedCurrencyFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  relatedCurrencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  relatedCurrencyRate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  relatedCurrencyChange: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});

export default CurrencyDetailScreen;
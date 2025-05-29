import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Custom components and hooks
import { Card, Button, TextBlock, Loading } from '../components/UIComponents';
import { CurrencyCard } from '../components/CurrencyComponents';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency, Currency } from '../contexts/CurrencyContext';
import { formatCurrency, validateCurrencyInput } from '../utils/helpers';

// Screen dimensions
const { width, height } = Dimensions.get('window');

const ExchangeScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { currencies, wallet, convertCurrency, executeTrade, loading } = useCurrency();
  
  // Exchange states
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [inSelectMode, setInSelectMode] = useState<'from' | 'to' | null>(null);
  const [isExchanging, setIsExchanging] = useState<boolean>(false);
  const [exchangeSuccess, setExchangeSuccess] = useState<boolean>(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Get INR as default currency when component mounts
  useEffect(() => {
    const inr = currencies.find(c => c.code === 'INR');
    const usd = currencies.find(c => c.code === 'USD');
    
    if (inr) setFromCurrency(inr);
    if (usd) setToCurrency(usd);
  }, [currencies]);

  // Filter currencies based on search
  const filteredCurrencies = useMemo(() => {
    if (!searchText) return currencies;
    
    const search = searchText.toLowerCase();
    return currencies.filter(
      currency => 
        currency.code.toLowerCase().includes(search) ||
        currency.name.toLowerCase().includes(search)
    );
  }, [currencies, searchText]);

  // Handle amount change
  const handleAmountChange = (text: string) => {
    if (validateCurrencyInput(text) || text === '') {
      setAmount(text);
      
      if (fromCurrency && toCurrency && text) {
        const value = parseFloat(text);
        const converted = convertCurrency(value, fromCurrency.code, toCurrency.code);
        setConvertedAmount(converted);
      } else {
        setConvertedAmount(0);
      }
    }
  };

  // Switch currencies
  const handleSwitchCurrencies = () => {
    // Animate rotation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // Reset rotation for next press
      rotateAnim.setValue(0);
    });
    
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    
    // Recalculate converted amount if needed
    if (amount && fromCurrency && toCurrency) {
      const value = parseFloat(amount);
      const converted = convertCurrency(value, toCurrency!.code, fromCurrency!.code);
      setConvertedAmount(converted);
    }
  };

  // Handle currency selection
  const handleCurrencySelect = (currency: Currency) => {
    if (inSelectMode === 'from') {
      setFromCurrency(currency);
    } else if (inSelectMode === 'to') {
      setToCurrency(currency);
    }
    
    // Close selection mode
    setInSelectMode(null);
    setSearchText('');
    
    // Recalculate conversion if amount is entered
    if (amount) {
      const value = parseFloat(amount);
      const fromCode = inSelectMode === 'from' ? currency.code : fromCurrency?.code;
      const toCode = inSelectMode === 'to' ? currency.code : toCurrency?.code;
      
      if (fromCode && toCode) {
        const converted = convertCurrency(value, fromCode, toCode);
        setConvertedAmount(converted);
      }
    }
  };

  // Handle exchange execution
  const handleExchange = async () => {
    if (!fromCurrency || !toCurrency || !amount) return;
    
    setIsExchanging(true);
    
    const value = parseFloat(amount);
    const result = await executeTrade('exchange', fromCurrency.code, toCurrency.code, value);
    
    setIsExchanging(false);
    
    if (result) {
      setExchangeSuccess(true);
      
      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Reset after success
      setTimeout(() => {
        setAmount('');
        setConvertedAmount(0);
        setExchangeSuccess(false);
        successAnim.setValue(0);
      }, 2000);
    }
  };

  // Open selection mode
  const openCurrencySelection = (mode: 'from' | 'to') => {
    setInSelectMode(mode);
    
    // Animate slide in
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Close selection mode
  const closeCurrencySelection = () => {
    // Animate slide out
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setInSelectMode(null);
      setSearchText('');
    });
  };

  // Calculate balance display
  const getBalanceDisplay = () => {
    if (!fromCurrency) return '';
    
    const balance = wallet[fromCurrency.code] || 0;
    return `Balance: ${fromCurrency.symbol}${balance.toFixed(2)}`;
  };

  // Calculate exchange rate info
  const getExchangeRateInfo = () => {
    if (!fromCurrency || !toCurrency) return '';
    
    const rate = convertCurrency(1, fromCurrency.code, toCurrency.code);
    return `1 ${fromCurrency.code} = ${rate.toFixed(4)} ${toCurrency.code}`;
  };

  // Rotation animation
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Selection panel slide animation
  const selectionTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0]
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Exchange Currencies</Text>
        <TouchableOpacity>
          <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exchange Card */}
        <Animated.View
          style={[
            styles.exchangeContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Card gradient blurred style={styles.exchangeCard}>
            {/* From Currency */}
            <View style={styles.currencySection}>
              <Text style={styles.sectionLabel}>From</Text>
              
              <TouchableOpacity
                style={[
                  styles.currencySelector,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                onPress={() => openCurrencySelection('from')}
              >
                {fromCurrency ? (
                  <View style={styles.selectedCurrency}>
                    <Text style={styles.currencyFlag}>{fromCurrency.flag}</Text>
                    <Text style={styles.currencyCode}>{fromCurrency.code}</Text>
                    <Text style={styles.currencyName}>{fromCurrency.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Select currency</Text>
                )}
                <Ionicons name="chevron-down" size={18} color={colors.text} />
              </TouchableOpacity>
              
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  {fromCurrency && (
                    <Text style={styles.currencySymbol}>{fromCurrency.symbol}</Text>
                  )}
                  <TextInput
                    style={[styles.amountInput, { color: colors.text }]}
                    value={amount}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={colors.subtext}
                  />
                </View>
                <Text style={styles.balanceText}>{getBalanceDisplay()}</Text>
              </View>
            </View>
            
            {/* Switch Button */}
            <View style={styles.switchContainer}>
              <TouchableOpacity
                style={styles.switchButton}
                onPress={handleSwitchCurrencies}
              >
                <Animated.View
                  style={{ transform: [{ rotate: rotation }] }}
                >
                  <LinearGradient
                    colors={colors.gradient}
                    style={styles.switchGradient}
                  >
                    <Ionicons name="swap-vertical" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
              
              <View style={styles.rateInfoContainer}>
                <Text style={styles.rateInfoText}>{getExchangeRateInfo()}</Text>
              </View>
            </View>
            
            {/* To Currency */}
            <View style={styles.currencySection}>
              <Text style={styles.sectionLabel}>To</Text>
              
              <TouchableOpacity
                style={[
                  styles.currencySelector,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                onPress={() => openCurrencySelection('to')}
              >
                {toCurrency ? (
                  <View style={styles.selectedCurrency}>
                    <Text style={styles.currencyFlag}>{toCurrency.flag}</Text>
                    <Text style={styles.currencyCode}>{toCurrency.code}</Text>
                    <Text style={styles.currencyName}>{toCurrency.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Select currency</Text>
                )}
                <Ionicons name="chevron-down" size={18} color={colors.text} />
              </TouchableOpacity>
              
              <View style={styles.convertedContainer}>
                <Text style={styles.amountLabel}>You'll receive approximately</Text>
                <Text style={styles.convertedAmount}>
                  {toCurrency ? `${toCurrency.symbol}${convertedAmount.toFixed(2)}` : '0.00'}
                </Text>
              </View>
            </View>
            
            {/* Exchange Button */}
            <Button
              title={isExchanging ? "Exchanging..." : "Exchange Now"}
              onPress={handleExchange}
              type="primary"
              size="large"
              loading={isExchanging}
              disabled={!fromCurrency || !toCurrency || !amount || parseFloat(amount) <= 0}
              style={styles.exchangeButton}
            />
            
            {/* Success Animation */}
            {exchangeSuccess && (
              <Animated.View 
                style={[
                  styles.successOverlay,
                  { opacity: successAnim }
                ]}
              >
                <View style={styles.successContent}>
                  <Ionicons name="checkmark-circle" size={50} color="#28C76F" />
                  <Text style={styles.successText}>
                    Exchange Successful!
                  </Text>
                </View>
              </Animated.View>
            )}
          </Card>
        </Animated.View>
        
        {/* Recent Exchanges Section */}
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Popular Currency Pairs
          </Text>
          
          <View style={styles.pairsContainer}>
            {/* USD/INR */}
            <TouchableOpacity 
              style={[
                styles.currencyPair,
                { backgroundColor: isDark ? colors.cardAlt : '#F8F9FA' }
              ]}
              onPress={() => {
                const inr = currencies.find(c => c.code === 'INR');
                const usd = currencies.find(c => c.code === 'USD');
                if (inr && usd) {
                  setFromCurrency(inr);
                  setToCurrency(usd);
                }
              }}
            >
              <View style={styles.pairFlags}>
                <Text style={styles.pairFlag}>🇮🇳</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.subtext} />
                <Text style={styles.pairFlag}>🇺🇸</Text>
              </View>
              <Text style={[styles.pairText, { color: colors.text }]}>INR / USD</Text>
            </TouchableOpacity>
            
            {/* EUR/INR */}
            <TouchableOpacity 
              style={[
                styles.currencyPair,
                { backgroundColor: isDark ? colors.cardAlt : '#F8F9FA' }
              ]}
              onPress={() => {
                const inr = currencies.find(c => c.code === 'INR');
                const eur = currencies.find(c => c.code === 'EUR');
                if (inr && eur) {
                  setFromCurrency(inr);
                  setToCurrency(eur);
                }
              }}
            >
              <View style={styles.pairFlags}>
                <Text style={styles.pairFlag}>🇮🇳</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.subtext} />
                <Text style={styles.pairFlag}>🇪🇺</Text>
              </View>
              <Text style={[styles.pairText, { color: colors.text }]}>INR / EUR</Text>
            </TouchableOpacity>
            
            {/* GBP/INR */}
            <TouchableOpacity 
              style={[
                styles.currencyPair,
                { backgroundColor: isDark ? colors.cardAlt : '#F8F9FA' }
              ]}
              onPress={() => {
                const inr = currencies.find(c => c.code === 'INR');
                const gbp = currencies.find(c => c.code === 'GBP');
                if (inr && gbp) {
                  setFromCurrency(inr);
                  setToCurrency(gbp);
                }
              }}
            >
              <View style={styles.pairFlags}>
                <Text style={styles.pairFlag}>🇮🇳</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.subtext} />
                <Text style={styles.pairFlag}>🇬🇧</Text>
              </View>
              <Text style={[styles.pairText, { color: colors.text }]}>INR / GBP</Text>
            </TouchableOpacity>
            
            {/* AED/INR */}
            <TouchableOpacity 
              style={[
                styles.currencyPair,
                { backgroundColor: isDark ? colors.cardAlt : '#F8F9FA' }
              ]}
              onPress={() => {
                const inr = currencies.find(c => c.code === 'INR');
                const aed = currencies.find(c => c.code === 'AED');
                if (inr && aed) {
                  setFromCurrency(inr);
                  setToCurrency(aed);
                }
              }}
            >
              <View style={styles.pairFlags}>
                <Text style={styles.pairFlag}>🇮🇳</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.subtext} />
                <Text style={styles.pairFlag}>🇦🇪</Text>
              </View>
              <Text style={[styles.pairText, { color: colors.text }]}>INR / AED</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Currency Selection Panel */}
      {inSelectMode && (
        <Animated.View
          style={[
            styles.selectionPanel,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: selectionTranslateY }]
            }
          ]}
        >
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={closeCurrencySelection}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.selectionTitle, { color: colors.text }]}>
              Select {inSelectMode === 'from' ? 'Source' : 'Target'} Currency
            </Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.subtext} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search currency by name or code"
              placeholderTextColor={colors.subtext}
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={colors.subtext} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <FlatList
            data={filteredCurrencies}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.currencyListItem,
                  {
                    backgroundColor: (
                      (inSelectMode === 'from' && fromCurrency?.code === item.code) ||
                      (inSelectMode === 'to' && toCurrency?.code === item.code)
                    ) 
                      ? `${colors.primary}30` 
                      : 'transparent'
                  }
                ]}
                onPress={() => handleCurrencySelect(item)}
              >
                <Text style={styles.currencyItemFlag}>{item.flag}</Text>
                <View style={styles.currencyItemInfo}>
                  <Text style={[styles.currencyItemCode, { color: colors.text }]}>
                    {item.code}
                  </Text>
                  <Text style={[styles.currencyItemName, { color: colors.subtext }]}>
                    {item.name}
                  </Text>
                </View>
                <Text style={[styles.currencyItemRate, { color: colors.primary }]}>
                  {item.code === 'INR' ? 'Base' : `${item.rate.toFixed(4)}`}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </KeyboardAvoidingView>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  exchangeContainer: {
    padding: 20,
  },
  exchangeCard: {
    padding: 20,
  },
  currencySection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 8,
  },
  currencySelector: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectedCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  currencyName: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  placeholderText: {
    color: '#FFFFFF',
    opacity: 0.5,
  },
  amountContainer: {
    width: '100%',
  },
  amountLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  balanceText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'right',
  },
  switchContainer: {
    alignItems: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  switchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF20',
  },
  switchGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateInfoContainer: {
    marginTop: 8,
  },
  rateInfoText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },
  convertedContainer: {
    width: '100%',
  },
  convertedAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exchangeButton: {
    marginTop: 20,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  recentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pairsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  currencyPair: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  pairFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pairFlag: {
    fontSize: 20,
    marginHorizontal: 4,
  },
  pairText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectionPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    paddingVertical: 4,
  },
  currencyListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  currencyItemFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  currencyItemInfo: {
    flex: 1,
  },
  currencyItemCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  currencyItemName: {
    fontSize: 14,
    opacity: 0.7,
  },
  currencyItemRate: {
    fontSize: 14,
    fontWeight: '600',
  }
});

export default ExchangeScreen;
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Custom components and hooks
import { Card, Button, TextBlock, Separator } from '../components/UIComponents';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency, Currency } from '../contexts/CurrencyContext';
import { validateCurrencyInput } from '../utils/helpers';

// Screen dimensions
const { width, height } = Dimensions.get('window');

// Types
type TransactionScreenRouteProp = RouteProp<
  {
    Transaction: {
      type: 'buy' | 'sell' | 'exchange';
      currencyCode?: string;
    };
  },
  'Transaction'
>;

const TransactionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<TransactionScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const { currencies, wallet, convertCurrency, executeTrade } = useCurrency();
  
  // Get params
  const { type, currencyCode } = route.params;
  
  // State
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null);
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [estimatedAmount, setEstimatedAmount] = useState<number>(0);
  const [fromBalance, setFromBalance] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quickAmounts, setQuickAmounts] = useState<number[]>([100, 500, 1000, 5000]);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  
  // Set up initial currencies based on transaction type
  useEffect(() => {
    let fromCurr: Currency | undefined;
    let toCurr: Currency | undefined;
    
    if (type === 'buy') {
      // For buying, use INR as source and specified currency or USD as target
      fromCurr = currencies.find(c => c.code === 'INR');
      toCurr = currencyCode 
        ? currencies.find(c => c.code === currencyCode)
        : currencies.find(c => c.code === 'USD');
    } else if (type === 'sell') {
      // For selling, use specified currency or USD as source and INR as target
      fromCurr = currencyCode 
        ? currencies.find(c => c.code === currencyCode)
        : currencies.find(c => c.code === 'USD');
      toCurr = currencies.find(c => c.code === 'INR');
    } else {
      // For exchange, use specified currency or USD as source and EUR as target
      fromCurr = currencyCode 
        ? currencies.find(c => c.code === currencyCode)
        : currencies.find(c => c.code === 'USD');
      toCurr = currencies.find(c => c.code === 'EUR');
    }
    
    if (fromCurr) setFromCurrency(fromCurr);
    if (toCurr) setToCurrency(toCurr);
    
  }, [type, currencyCode, currencies]);
  
  // Update from balance when currency changes
  useEffect(() => {
    if (fromCurrency) {
      const balance = wallet[fromCurrency.code] || 0;
      setFromBalance(balance);
      
      // Set quick amounts based on balance
      if (balance > 0) {
        const maxBalance = Math.min(balance, 100000);
        if (fromCurrency.code === 'INR') {
          setQuickAmounts([
            Math.round(maxBalance * 0.1),
            Math.round(maxBalance * 0.25),
            Math.round(maxBalance * 0.5),
            Math.round(maxBalance * 0.75),
          ]);
        } else {
          // For other currencies, use smaller amounts
          setQuickAmounts([
            Math.round(maxBalance * 0.1 * 100) / 100,
            Math.round(maxBalance * 0.25 * 100) / 100,
            Math.round(maxBalance * 0.5 * 100) / 100,
            Math.round(maxBalance * 0.75 * 100) / 100,
          ]);
        }
      }
    }
  }, [fromCurrency, wallet]);
  
  // Update estimated amount when input changes
  useEffect(() => {
    if (fromCurrency && toCurrency && amount && !isNaN(parseFloat(amount))) {
      const fromAmount = parseFloat(amount);
      const convertedAmount = convertCurrency(fromAmount, fromCurrency.code, toCurrency.code);
      setEstimatedAmount(convertedAmount);
      
      // Calculate fee (0.2% for exchange, 0.5% for buy/sell)
      const feeRate = type === 'exchange' ? 0.002 : 0.005;
      setFee(fromAmount * feeRate);
    } else {
      setEstimatedAmount(0);
      setFee(0);
    }
  }, [amount, fromCurrency, toCurrency, type, convertCurrency]);
  
  // Animation setup
  useEffect(() => {
    // Entry animations
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
    
    // Set up spin animation for the loading spinner
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  // Handle amount input
  const handleAmountChange = (text: string) => {
    if (validateCurrencyInput(text) || text === '') {
      setAmount(text);
      setSelectedQuickAmount(null);
    }
  };
  
  // Handle quick amount selection
  const handleQuickAmountSelect = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    setSelectedQuickAmount(quickAmount);
  };
  
  // Handle max amount selection
  const handleMaxAmount = () => {
    if (fromCurrency && fromBalance > 0) {
      setAmount(fromBalance.toString());
      setSelectedQuickAmount(null);
    }
  };
  
  // Handle transaction execution
  const handleTransaction = async () => {
    if (!fromCurrency || !toCurrency || !amount) return;
    
    // Validate amount
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Validate balance
    if (amountVal > fromBalance) {
      setError('Insufficient balance');
      return;
    }
    
    // Clear errors
    setError(null);
    
    // Start processing
    setProcessing(true);
    
    // Execute trade
    const result = await executeTrade(type, fromCurrency.code, toCurrency.code, amountVal);
    
    // Handle result
    setProcessing(false);
    if (result) {
      setSuccess(true);
      
      // Animate success
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Return to previous screen after delay
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } else {
      setError('Transaction failed. Please try again.');
    }
  };
  
  // Calculate spinner rotation
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Get transaction title based on type
  const getTransactionTitle = () => {
    switch (type) {
      case 'buy':
        return 'Buy Currency';
      case 'sell':
        return 'Sell Currency';
      case 'exchange':
        return 'Exchange Currency';
      default:
        return 'Transaction';
    }
  };
  
  // Get button text based on type
  const getButtonText = () => {
    switch (type) {
      case 'buy':
        return `Buy ${toCurrency?.code}`;
      case 'sell':
        return `Sell ${fromCurrency?.code}`;
      case 'exchange':
        return `Exchange to ${toCurrency?.code}`;
      default:
        return 'Continue';
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {getTransactionTitle()}
        </Text>
        
        <View style={{ width: 32 }} />
      </Animated.View>
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Transaction Card */}
          <Animated.View
            style={[
              styles.transactionCardWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY }, { scale: scaleAnim }]
              }
            ]}
          >
            <Card gradient style={styles.transactionCard}>
              {/* From Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>From</Text>
                
                <View style={styles.currencyRow}>
                  <View style={styles.currencyInfo}>
                    {fromCurrency && (
                      <>
                        <View style={[styles.currencyFlag, { backgroundColor: `${fromCurrency.color}30` }]}>
                          <Text style={{ fontSize: 20 }}>{fromCurrency.flag}</Text>
                        </View>
                        <View>
                          <Text style={styles.currencyCode}>{fromCurrency.code}</Text>
                          <Text style={styles.currencyName}>{fromCurrency.name}</Text>
                        </View>
                      </>
                    )}
                  </View>
                  
                  <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>Available</Text>
                    <Text style={styles.balanceValue}>
                      {fromCurrency ? `${fromCurrency.symbol}${fromBalance.toFixed(2)}` : '-'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <View style={styles.amountInputRow}>
                    <View style={styles.amountInputWrapper}>
                      <Text style={styles.amountSymbol}>
                        {fromCurrency?.symbol || ''}
                      </Text>
                      <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={handleAmountChange}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor="#FFFFFF80"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.maxButton}
                      onPress={handleMaxAmount}
                    >
                      <Text style={styles.maxButtonText}>MAX</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.quickAmountsContainer}>
                  {quickAmounts.map((quickAmount) => (
                    <TouchableOpacity
                      key={quickAmount}
                      style={[
                        styles.quickAmountButton,
                        selectedQuickAmount === quickAmount && styles.quickAmountButtonSelected
                      ]}
                      onPress={() => handleQuickAmountSelect(quickAmount)}
                    >
                      <Text style={[
                        styles.quickAmountText,
                        selectedQuickAmount === quickAmount && styles.quickAmountTextSelected
                      ]}>
                        {fromCurrency?.symbol}{quickAmount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Arrow Icon */}
              <View style={styles.arrowContainer}>
                <View style={styles.arrowCircle}>
                  <Ionicons
                    name={type === 'exchange' ? "swap-vertical" : "arrow-forward"}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
              </View>
              
              {/* To Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>To</Text>
                
                <View style={styles.currencyRow}>
                  <View style={styles.currencyInfo}>
                    {toCurrency && (
                      <>
                        <View style={[styles.currencyFlag, { backgroundColor: `${toCurrency.color}30` }]}>
                          <Text style={{ fontSize: 20 }}>{toCurrency.flag}</Text>
                        </View>
                        <View>
                          <Text style={styles.currencyCode}>{toCurrency.code}</Text>
                          <Text style={styles.currencyName}>{toCurrency.name}</Text>
                        </View>
                      </>
                    )}
                  </View>
                  
                  <View style={styles.estimatedAmount}>
                    <Text style={styles.estimatedLabel}>You'll receive</Text>
                    <Text style={styles.estimatedValue}>
                      {toCurrency ? `${toCurrency.symbol}${estimatedAmount.toFixed(4)}` : '-'}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Transaction Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Exchange Rate</Text>
                  <Text style={styles.detailValue}>
                    {fromCurrency && toCurrency
                      ? `1 ${fromCurrency.code} = ${convertCurrency(1, fromCurrency.code, toCurrency.code).toFixed(4)} ${toCurrency.code}`
                      : '-'
                    }
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fee</Text>
                  <Text style={styles.detailValue}>
                    {fromCurrency && fee > 0
                      ? `${fromCurrency.symbol}${fee.toFixed(4)} (${type === 'exchange' ? '0.2' : '0.5'}%)`
                      : '-'
                    }
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estimated Delivery</Text>
                  <Text style={styles.detailValue}>Instant</Text>
                </View>
              </View>
              
              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#FF4757" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              {/* Action Button */}
              <View style={styles.actionContainer}>
                <Button
                  title={processing ? 'Processing...' : getButtonText()}
                  onPress={handleTransaction}
                  type="primary"
                  size="large"
                  loading={processing}
                  disabled={
                    processing ||
                    success ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    parseFloat(amount) > fromBalance
                  }
                  style={styles.actionButton}
                />
              </View>
            </Card>
          </Animated.View>
          
          {/* Additional Information */}
          <Animated.View
            style={[
              styles.infoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY }]
              }
            ]}
          >
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Important Information
            </Text>
            
            <Text style={[styles.infoText, { color: colors.subtext }]}>
              • All transactions are subject to market conditions and rate fluctuations.
            </Text>
            <Text style={[styles.infoText, { color: colors.subtext }]}>
              • A {type === 'exchange' ? '0.2%' : '0.5%'} fee is charged on all {type} transactions.
            </Text>
            <Text style={[styles.infoText, { color: colors.subtext }]}>
              • Transactions are processed immediately and cannot be reversed.
            </Text>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
      
      {/* Success Overlay */}
      {success && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successAnim
            }
          ]}
        >
          <View style={styles.successContent}>
            <LinearGradient
              colors={['rgba(40, 199, 111, 0.8)', 'rgba(40, 199, 111, 0.6)']}
              style={styles.successIconContainer}
            >
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.successTitle}>Transaction Successful!</Text>
            <Text style={styles.successMessage}>
              {type === 'buy'
                ? `You've successfully purchased ${toCurrency?.code}`
                : type === 'sell'
                ? `You've successfully sold ${fromCurrency?.code}`
                : `You've successfully exchanged ${fromCurrency?.code} to ${toCurrency?.code}`
              }
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
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
  transactionCardWrapper: {
    padding: 20,
  },
  transactionCard: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 12,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyFlag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currencyName: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  amountContainer: {
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  amountSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    padding: 8,
  },
  maxButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  maxButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickAmountButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickAmountText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  quickAmountTextSelected: {
    fontWeight: 'bold',
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  estimatedAmount: {
    alignItems: 'flex-end',
  },
  estimatedLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 4,
  },
  estimatedValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  detailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF4757',
    marginLeft: 8,
  },
  actionContainer: {
    marginTop: 16,
  },
  actionButton: {
    width: '100%',
  },
  infoContainer: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginVertical: 4,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4A5568',
  },
});

export default TransactionScreen;
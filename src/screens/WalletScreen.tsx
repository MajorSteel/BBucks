import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Custom components
import { Card, Button, TextBlock, Badge, Separator } from '../components/UIComponents';
import { CurrencyCard } from '../components/CurrencyComponents';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency, Transaction } from '../contexts/CurrencyContext';
import { formatTimestamp, formatCurrency } from '../utils/helpers';

// Get screen dimensions
const { width } = Dimensions.get('window');

const WalletScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { currencies, wallet, transactions } = useCurrency();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  
  // Filter wallet to include only currencies with balances
  const walletCurrencies = currencies.filter(
    currency => wallet[currency.code] && wallet[currency.code] > 0
  );
  
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
  
  // Get transaction icon based on type
  const getTransactionIcon = (type: 'buy' | 'sell' | 'exchange') => {
    switch (type) {
      case 'buy':
        return 'arrow-down-circle';
      case 'sell':
        return 'arrow-up-circle';
      case 'exchange':
        return 'swap-horizontal-circle';
    }
  };
  
  // Get transaction color based on type
  const getTransactionColor = (type: 'buy' | 'sell' | 'exchange') => {
    switch (type) {
      case 'buy':
        return colors.success;
      case 'sell':
        return colors.error;
      case 'exchange':
        return colors.primary;
    }
  };
  
  // Format transaction description
  const getTransactionDescription = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'buy':
        return `Bought ${transaction.toCurrency}`;
      case 'sell':
        return `Sold ${transaction.fromCurrency}`;
      case 'exchange':
        return `${transaction.fromCurrency} to ${transaction.toCurrency}`;
    }
  };
  
  // Format transaction amount
  const getTransactionAmount = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'buy':
        return `+${transaction.toAmount.toFixed(2)} ${transaction.toCurrency}`;
      case 'sell':
        return `-${transaction.fromAmount.toFixed(2)} ${transaction.fromCurrency}`;
      case 'exchange':
        return `+${transaction.toAmount.toFixed(2)} ${transaction.toCurrency}`;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Wallet</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
            Manage your currencies
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerAction}
          onPress={() => navigation.navigate('Settings' as never)}
        >
          <Ionicons name="settings-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Balance Card */}
        <Animated.View style={[
          styles.balanceContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}>
          <Card gradient blurred style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceTitle}>Total Balance (INR)</Text>
            </View>
            
            <Text style={styles.balanceValue}>
              ₹{Object.entries(wallet).reduce((total, [code, amount]) => {
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
              }, 0).toFixed(2)}
            </Text>
            
            <View style={styles.balanceActions}>
              <Button
                title="Deposit"
                icon="arrow-down"
                onPress={() => navigation.navigate('Transaction' as never, { type: 'buy' } as never)}
                type="primary"
                size="small"
                style={{ marginRight: 8 }}
              />
              <Button
                title="Withdraw"
                icon="arrow-up"
                onPress={() => navigation.navigate('Transaction' as never, { type: 'sell' } as never)}
                type="outline"
                size="small"
              />
            </View>
          </Card>
        </Animated.View>
        
        {/* Currency Holdings */}
        <View style={styles.holdingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Holdings</Text>
          
          {walletCurrencies.length > 0 ? (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY }]
              }}
            >
              {walletCurrencies.map((currency, index) => {
                const amount = wallet[currency.code] || 0;
                const inrValue = currency.code === 'INR' 
                  ? amount 
                  : amount / currency.rate;
                
                return (
                  <TouchableOpacity
                    key={currency.code}
                    style={[
                      styles.currencyItem,
                      { backgroundColor: colors.cardAlt }
                    ]}
                    onPress={() => navigation.navigate('CurrencyDetail' as never, { currencyCode: currency.code } as never)}
                  >
                    <View style={styles.currencyItemLeft}>
                      <View style={[
                        styles.currencyIcon,
                        { backgroundColor: `${currency.color}30` }
                      ]}>
                        <Text style={styles.currencyFlag}>{currency.flag}</Text>
                      </View>
                      <View style={styles.currencyInfo}>
                        <Text style={[styles.currencyName, { color: colors.text }]}>
                          {currency.name}
                        </Text>
                        <Text style={[styles.currencyCode, { color: colors.subtext }]}>
                          {currency.code}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.currencyItemRight}>
                      <Text style={[styles.currencyAmount, { color: colors.text }]}>
                        {currency.symbol}{amount.toFixed(2)}
                      </Text>
                      <Text style={[styles.currencyValue, { color: colors.subtext }]}>
                        ≈ ₹{inrValue.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={50} color={colors.subtext} />
              <Text style={[styles.emptyStateText, { color: colors.subtext }]}>
                You don't have any currencies yet
              </Text>
              <Button
                title="Get Started"
                onPress={() => navigation.navigate('Exchange' as never)}
                type="primary"
                size="small"
                style={{ marginTop: 16 }}
              />
            </View>
          )}
        </View>
        
        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            {transactions.length > 0 && (
              <TouchableOpacity>
                <Text style={{ color: colors.primary }}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {transactions.length > 0 ? (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY }]
              }}
            >
              {transactions.slice(0, 5).map((transaction, index) => (
                <View key={transaction.id}>
                  <View style={styles.transactionItem}>
                    <View style={styles.transactionItemLeft}>
                      <View style={[
                        styles.transactionIcon,
                        { backgroundColor: `${getTransactionColor(transaction.type)}20` }
                      ]}>
                        <Ionicons
                          name={getTransactionIcon(transaction.type)}
                          size={24}
                          color={getTransactionColor(transaction.type)}
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={[styles.transactionTitle, { color: colors.text }]}>
                          {getTransactionDescription(transaction)}
                        </Text>
                        <Text style={[styles.transactionDate, { color: colors.subtext }]}>
                          {formatTimestamp(transaction.timestamp, 'datetime')}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.transactionItemRight}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          { 
                            color: transaction.type === 'sell'
                              ? colors.error
                              : colors.success
                          }
                        ]}
                      >
                        {getTransactionAmount(transaction)}
                      </Text>
                      {transaction.fee > 0 && (
                        <Text style={[styles.transactionFee, { color: colors.subtext }]}>
                          Fee: {transaction.fee.toFixed(4)}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {index < transactions.slice(0, 5).length - 1 && (
                    <Separator style={{ marginHorizontal: 16 }} />
                  )}
                </View>
              ))}
            </Animated.View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={50} color={colors.subtext} />
              <Text style={[styles.emptyStateText, { color: colors.subtext }]}>
                No transactions yet
              </Text>
            </View>
          )}
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
  balanceContainer: {
    padding: 20,
  },
  balanceCard: {
    padding: 20,
  },
  balanceHeader: {
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  balanceActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  holdingsSection: {
    paddingHorizontal: 20,
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
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  currencyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  currencyFlag: {
    fontSize: 24,
  },
  currencyInfo: {
  },
  currencyName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 14,
  },
  currencyItemRight: {
    alignItems: 'flex-end',
  },
  currencyAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  currencyValue: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  transactionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  transactionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
  },
  transactionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
  },
  transactionItemRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  transactionFee: {
    fontSize: 12,
  },
});

export default WalletScreen;
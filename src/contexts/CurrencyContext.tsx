import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Currency types and interfaces
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // Exchange rate to INR
  change24h: number; // 24h change percentage
  color: string; // For UI visualization
}

export interface Wallet {
  [key: string]: number; // Currency code to amount mapping
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'exchange';
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: number;
  fee: number;
}

interface CurrencyContextType {
  currencies: Currency[];
  wallet: Wallet;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refreshRates: () => Promise<void>;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number;
  executeTrade: (
    type: 'buy' | 'sell' | 'exchange',
    fromCurrency: string,
    toCurrency: string,
    fromAmount: number
  ) => Promise<boolean>;
  getFavorites: () => Currency[];
  addToFavorites: (currencyCode: string) => void;
  removeFromFavorites: (currencyCode: string) => void;
}

// Create context with default values
const CurrencyContext = createContext<CurrencyContextType>({
  currencies: [],
  wallet: { INR: 100000 }, // Starting with INR in wallet
  transactions: [],
  loading: false,
  error: null,
  refreshRates: async () => {},
  convertCurrency: () => 0,
  executeTrade: async () => false,
  getFavorites: () => [],
  addToFavorites: () => {},
  removeFromFavorites: () => {},
});

// Sample currency data - in a real app, this would come from an API
const sampleCurrencies: Currency[] = [
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    rate: 1, // Base currency
    change24h: 0,
    color: '#FF9933',
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    rate: 0.012, // 1 INR = 0.012 USD
    change24h: 0.45,
    color: '#0052B4',
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    rate: 0.011, // 1 INR = 0.011 EUR
    change24h: -0.2,
    color: '#003399',
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    rate: 0.0094, // 1 INR = 0.0094 GBP
    change24h: 0.1,
    color: '#00247D',
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flag: '🇯🇵',
    rate: 1.81, // 1 INR = 1.81 JPY
    change24h: -0.33,
    color: '#BC002D',
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    rate: 0.018, // 1 INR = 0.018 AUD
    change24h: 0.22,
    color: '#00008B',
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    rate: 0.016, // 1 INR = 0.016 CAD
    change24h: 0.15,
    color: '#FF0000',
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    rate: 0.016, // 1 INR = 0.016 SGD
    change24h: -0.18,
    color: '#EF3340',
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    flag: '🇦🇪',
    rate: 0.044, // 1 INR = 0.044 AED
    change24h: 0.05,
    color: '#00732F',
  },
];

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const [currencies, setCurrencies] = useState<Currency[]>(sampleCurrencies);
  const [wallet, setWallet] = useState<Wallet>({ INR: 100000 }); // Starting with INR
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['USD', 'EUR', 'GBP']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching exchange rates
  const refreshRates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to get latest rates
      // Here we'll simulate by adding small random changes
      setTimeout(() => {
        const updatedCurrencies = currencies.map(currency => {
          if (currency.code === 'INR') return currency; // Base currency doesn't change
          
          // Generate random change between -0.5% and +0.5%
          const randomChange = (Math.random() - 0.5) * 0.01;
          const newRate = currency.rate * (1 + randomChange);
          
          // Calculate new 24h change
          const new24hChange = currency.change24h + (Math.random() - 0.5) * 0.2;
          
          return {
            ...currency,
            rate: Number(newRate.toFixed(6)),
            change24h: Number(new24hChange.toFixed(2))
          };
        });
        
        setCurrencies(updatedCurrencies);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to refresh rates. Please try again.');
      setLoading(false);
    }
  };

  // Currency conversion helper
  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    const fromRate = currencies.find(c => c.code === fromCurrency)?.rate ?? 0;
    const toRate = currencies.find(c => c.code === toCurrency)?.rate ?? 0;
    
    if (fromCurrency === 'INR') {
      return amount * toRate;
    }
    
    if (toCurrency === 'INR') {
      return amount / fromRate;
    }
    
    // Convert through INR
    const amountInInr = amount / fromRate;
    return amountInInr * toRate;
  };

  // Execute a trade
  const executeTrade = async (
    type: 'buy' | 'sell' | 'exchange',
    fromCurrency: string,
    toCurrency: string,
    fromAmount: number
  ): Promise<boolean> => {
    try {
      // Validate trade
      if (!wallet[fromCurrency] || wallet[fromCurrency] < fromAmount) {
        throw new Error('Insufficient balance');
      }
      
      // Calculate exchange
      const toAmount = convertCurrency(fromAmount, fromCurrency, toCurrency);
      const fee = fromAmount * 0.002; // 0.2% fee
      
      // Update wallet balances
      setWallet(prev => ({
        ...prev,
        [fromCurrency]: (prev[fromCurrency] || 0) - fromAmount,
        [toCurrency]: (prev[toCurrency] || 0) + toAmount - (type === 'exchange' ? fee : 0)
      }));
      
      // Record transaction
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(2, 15),
        type,
        fromCurrency,
        toCurrency,
        fromAmount,
        toAmount,
        rate: convertCurrency(1, fromCurrency, toCurrency),
        timestamp: Date.now(),
        fee
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  // Favorite currencies management
  const getFavorites = (): Currency[] => {
    return currencies.filter(currency => favorites.includes(currency.code));
  };
  
  const addToFavorites = (currencyCode: string) => {
    if (!favorites.includes(currencyCode)) {
      setFavorites(prev => [...prev, currencyCode]);
    }
  };
  
  const removeFromFavorites = (currencyCode: string) => {
    setFavorites(prev => prev.filter(code => code !== currencyCode));
  };

  // Initial fetch of rates
  useEffect(() => {
    refreshRates();
    
    // Set up interval to refresh rates periodically (every 30 seconds)
    const intervalId = setInterval(() => {
      refreshRates();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const contextValue = {
    currencies,
    wallet,
    transactions,
    loading,
    error,
    refreshRates,
    convertCurrency,
    executeTrade,
    getFavorites,
    addToFavorites,
    removeFromFavorites
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook for using currency context
export const useCurrency = () => useContext(CurrencyContext);
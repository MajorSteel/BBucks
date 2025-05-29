import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing,
  Platform,
  ViewStyle,
  TextStyle,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Currency } from '../contexts/CurrencyContext';
import { Ionicons } from '@expo/vector-icons';

// Get screen dimensions
const { width } = Dimensions.get('window');
const cardWidth = width > 500 ? 220 : width * 0.45;

// Animated 3D Currency Card
interface CurrencyCardProps {
  currency: Currency;
  balance?: number;
  onPress?: () => void;
  style?: ViewStyle;
  showBalance?: boolean;
  favorite?: boolean;
  onToggleFavorite?: () => void;
}

export const CurrencyCard = ({ 
  currency, 
  balance = 0, 
  onPress, 
  style,
  showBalance = false,
  favorite = false, 
  onToggleFavorite
}: CurrencyCardProps) => {
  const { colors, isDark } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Animation for card hover/press
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      })
    ]).start();
  };
  
  const animateOut = () => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      })
    ]).start();
  };
  
  // Animation values for 3D transform
  const rotateX = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg']
  });
  
  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg']
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8]
  });
  
  // Card background colors
  const cardGradient = [
    currency.color,
    isDark 
      ? `${currency.color}90` // More transparent in dark mode
      : `${currency.color}60` // Less transparent in light mode
  ];
  
  return (
    <TouchableWithoutFeedback
      onPressIn={animateIn}
      onPressOut={animateOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.card,
          style,
          {
            transform: [
              { perspective: 800 },
              { rotateX },
              { rotateY },
              { scale: scaleAnim }
            ],
            width: cardWidth,
          }
        ]}
      >
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Card shadow glow */}
        <Animated.View
          style={[
            styles.cardGlow,
            {
              backgroundColor: currency.color,
              opacity: glowOpacity,
              shadowColor: currency.color,
            }
          ]}
        />
        
        {/* Card content */}
        <View style={styles.cardHeader}>
          <Text style={styles.currencyCode}>{currency.code}</Text>
          {onToggleFavorite && (
            <TouchableWithoutFeedback onPress={onToggleFavorite}>
              <View style={styles.favoriteIcon}>
                <Ionicons
                  name={favorite ? "star" : "star-outline"}
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
        
        <View style={styles.flagContainer}>
          <Text style={styles.flag}>{currency.flag}</Text>
        </View>
        
        <Text style={styles.currencyName}>{currency.name}</Text>
        
        {showBalance && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceAmount}>
              {currency.symbol}{balance.toFixed(2)}
            </Text>
          </View>
        )}
        
        <View style={styles.rateContainer}>
          <Text style={styles.rateLabel}>
            {currency.code === 'INR' ? 'Base Currency' : `1 INR = ${currency.rate.toFixed(4)} ${currency.code}`}
          </Text>
          
          <View style={[
            styles.changeContainer,
            { backgroundColor: currency.change24h >= 0 ? 'rgba(40, 199, 111, 0.3)' : 'rgba(255, 71, 87, 0.3)' }
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
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// 3D Rotating Currency Globe Marker
interface GlobeMarkerProps {
  currency: Currency;
  size?: number;
  style?: ViewStyle;
}

export const GlobeMarker = ({ currency, size = 50, style }: GlobeMarkerProps) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start spinning animation on mount
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    );
    
    spinAnimation.start();
    pulseAnimation.start();
    
    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View
      style={[
        styles.globeMarker,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: currency.color,
          transform: [
            { scale: pulseAnim },
            { rotateY: spin }
          ]
        },
        style
      ]}
    >
      <Text style={styles.markerText}>{currency.code}</Text>
    </Animated.View>
  );
};

// Animated rate ticker component for scrolling exchange rates
interface RateTickerProps {
  rates: Array<{
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    change: number;
  }>;
  speed?: 'slow' | 'medium' | 'fast';
  style?: ViewStyle;
}

export const RateTicker = ({ rates, speed = 'medium', style }: RateTickerProps) => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(width);
  
  const speedValue = {
    slow: 50,
    medium: 30,
    fast: 15,
  }[speed];
  
  useEffect(() => {
    if (contentWidth <= width) return;
    
    const duration = contentWidth * speedValue;
    
    const scrollAnimation = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -contentWidth,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    scrollAnimation.start();
    
    return () => {
      scrollAnimation.stop();
    };
  }, [contentWidth]);

  return (
    <View style={[styles.tickerContainer, style]}>
      <View style={styles.tickerGradientLeft} />
      <View style={styles.tickerGradientRight} />
      
      <View style={styles.tickerContent}>
        <Animated.View
          style={[
            styles.tickerScroller,
            {
              transform: [{ translateX: scrollAnim }]
            }
          ]}
          onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
        >
          {rates.map((item, index) => (
            <View key={index} style={styles.tickerItem}>
              <Text style={styles.tickerCode}>
                {item.fromCurrency}/{item.toCurrency}
              </Text>
              <Text style={styles.tickerRate}>
                {item.rate.toFixed(4)}
              </Text>
              <Text style={[
                styles.tickerChange,
                { color: item.change >= 0 ? "#28C76F" : "#FF4757" }
              ]}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </Text>
            </View>
          ))}
          
          {/* Duplicate first few items to make seamless loop */}
          {rates.slice(0, 3).map((item, index) => (
            <View key={`duplicate-${index}`} style={styles.tickerItem}>
              <Text style={styles.tickerCode}>
                {item.fromCurrency}/{item.toCurrency}
              </Text>
              <Text style={styles.tickerRate}>
                {item.rate.toFixed(4)}
              </Text>
              <Text style={[
                styles.tickerChange,
                { color: item.change >= 0 ? "#28C76F" : "#FF4757" }
              ]}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Currency Card styles
  card: {
    height: 200,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    shadowColor: '#FFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currencyCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  favoriteIcon: {
    padding: 4,
  },
  flagContainer: {
    marginBottom: 12,
  },
  flag: {
    fontSize: 32,
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.9,
  },
  balanceContainer: {
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rateContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    flex: 1,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Globe Marker styles
  globeMarker: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  // Rate Ticker styles
  tickerContainer: {
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 16,
  },
  tickerGradientLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 50,
    zIndex: 1,
    backgroundGradient: 'linear-gradient(to right, rgba(0,0,0,0.8), transparent)',
  },
  tickerGradientRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
    zIndex: 1,
    backgroundGradient: 'linear-gradient(to left, rgba(0,0,0,0.8), transparent)',
  },
  tickerContent: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  tickerScroller: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tickerCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  tickerRate: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 8,
  },
  tickerChange: {
    fontSize: 14,
    fontWeight: '600',
  },
});
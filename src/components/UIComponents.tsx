import React, { ReactNode } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Type definitions
interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  blurred?: boolean;
  gradient?: boolean;
  onPress?: () => void;
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}

interface TextBlockProps {
  title?: string;
  body: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  bodyStyle?: TextStyle;
}

// Glassmorphic Card Component
export const Card = ({ children, style, blurred = true, gradient = false, onPress }: CardProps) => {
  const { colors, isDark } = useTheme();
  
  const content = (
    <View style={[styles.card, { backgroundColor: colors.card }, style]}>
      {gradient && (
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          opacity={0.15}
        />
      )}
      {children}
    </View>
  );
  
  if (Platform.OS === 'web' || !blurred) {
    return onPress ? (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    ) : content;
  }
  
  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
        {content}
      </BlurView>
    </TouchableOpacity>
  ) : (
    <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
      {content}
    </BlurView>
  );
};

// Styled Button Component with loading state
export const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) => {
  const { colors } = useTheme();
  
  // Button style based on type
  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.secondary };
      case 'accent':
        return { backgroundColor: colors.accent };
      case 'outline':
        return { 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary
        };
      default:
        return { backgroundColor: colors.primary };
    }
  };
  
  // Text color based on type
  const getTextColor = () => {
    if (type === 'outline') {
      return colors.primary;
    }
    return '#FFFFFF';
  };
  
  // Button size
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { 
          paddingVertical: 6, 
          paddingHorizontal: 12,
          borderRadius: 8,
        };
      case 'medium':
        return { 
          paddingVertical: 12, 
          paddingHorizontal: 16,
          borderRadius: 10,
        };
      case 'large':
        return { 
          paddingVertical: 16, 
          paddingHorizontal: 20,
          borderRadius: 12,
        };
      default:
        return { 
          paddingVertical: 12, 
          paddingHorizontal: 16,
          borderRadius: 10,
        };
    }
  };
  
  // Font size based on button size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };
  
  const buttonStyle = [
    styles.button,
    getButtonStyle(),
    getButtonSize(),
    disabled && { opacity: 0.6 },
    style,
  ];
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={loading || disabled}
      style={buttonStyle}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size={size === 'small' ? 'small' : 'small'} />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={size === 'small' ? 16 : size === 'medium' ? 18 : 24} 
              color={getTextColor()} 
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[
            styles.buttonText, 
            { color: getTextColor(), fontSize: getFontSize() }
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Text block component for titles and body text
export const TextBlock = ({ title, body, style, titleStyle, bodyStyle }: TextBlockProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.textBlock, style]}>
      {title && (
        <Text style={[
          styles.title, 
          { color: colors.text },
          titleStyle
        ]}>
          {title}
        </Text>
      )}
      <Text style={[
        styles.body, 
        { color: colors.subtext },
        bodyStyle
      ]}>
        {body}
      </Text>
    </View>
  );
};

// Separator line component
export const Separator = ({ style }: { style?: ViewStyle }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[
      styles.separator, 
      { backgroundColor: colors.border },
      style
    ]} />
  );
};

// Loading indicator component
export const Loading = () => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
};

// Error display component
export const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry?: () => void }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={40} color={colors.error} />
      <Text style={[styles.errorText, { color: colors.error }]}>{message}</Text>
      {onRetry && (
        <Button 
          title="Try Again" 
          onPress={onRetry} 
          type="outline" 
          size="small" 
          style={{ marginTop: 12 }}
        />
      )}
    </View>
  );
};

// Badge for notification, counts, etc
export const Badge = ({ 
  value, 
  color,
  size = 'medium',
}: { 
  value: number | string; 
  color?: string; 
  size?: 'small' | 'medium' | 'large';
}) => {
  const { colors } = useTheme();
  const badgeColor = color || colors.accent;
  
  const badgeSize = {
    small: { minWidth: 18, height: 18, fontSize: 10 },
    medium: { minWidth: 24, height: 24, fontSize: 12 },
    large: { minWidth: 32, height: 32, fontSize: 14 },
  }[size];
  
  return (
    <View style={[
      styles.badge, 
      { backgroundColor: badgeColor },
      { minWidth: badgeSize.minWidth, height: badgeSize.height }
    ]}>
      <Text style={[styles.badgeText, { fontSize: badgeSize.fontSize }]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  textBlock: {
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
  },
  badge: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
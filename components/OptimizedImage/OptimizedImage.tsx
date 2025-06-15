// Create this file: @/components/OptimizedImage/index.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import FastImage from 'react-native-fast-image';

// Default fallback image - put this in your assets
import DefaultPlaceholder from '@/assets/images/placeholder-bucket.png';
import AnimatedLoader from '../Loader/AnimatedLoader';

interface OptimizedImageProps {
  source: { uri: string } | any;
  style?: any;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  priority?: 'low' | 'normal' | 'high';
  showLoader?: boolean;
  fallbackSource?: any;
  onLoad?: () => void;
  onError?: () => void;
  children?: React.ReactNode;
}

// Simple Skeleton Component (like popular skeleton libraries)
const SkeletonPlaceholder: React.FC<{ style?: any }> = ({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false, // We need to animate width
      })
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerWidth = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.skeletonContainer, style]}>
      <Animated.View
        style={[
          styles.skeletonShimmer,
          {
            width: shimmerWidth,
          },
        ]}
      />
    </View>
  );
};

// 1. REGULAR IMAGE COMPONENT
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  showLoader = true,
  fallbackSource = DefaultPlaceholder,
  onLoad,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get the image source
  const getImageSource = () => {
    if (hasError) {
      return fallbackSource;
    }
    
    if (source && typeof source === 'object' && source.uri) {
      return {
        uri: source.uri,
        priority: FastImage.priority[priority] || FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      };
    }
    
    return source || fallbackSource;
  };

  // Reset states when source changes
  useEffect(() => {
    setLoading(true);
    setHasError(false);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [source?.uri]);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setLoading(false);
    setHasError(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onError?.();
  }, [onError]);

  return (
    <View style={[style, styles.container]}>
      {/* Simple Skeleton Loading State */}
      {loading && showLoader && !hasError && (
        <SkeletonPlaceholder style={StyleSheet.absoluteFill} />
      )}

      {/* FastImage */}
      <FastImage
        source={getImageSource()}
        style={StyleSheet.absoluteFill}
        resizeMode={FastImage.resizeMode[resizeMode] || FastImage.resizeMode.cover}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
};

// 2. BACKGROUND IMAGE COMPONENT
export const OptimizedImageBackground: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  showLoader = true,
  fallbackSource = DefaultPlaceholder,
  onLoad,
  onError,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get the image source
  const getImageSource = () => {
    if (hasError) {
      return fallbackSource;
    }
    
    if (source && typeof source === 'object' && source.uri) {
      return {
        uri: source.uri,
        priority: FastImage.priority[priority] || FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      };
    }
    
    return source || fallbackSource;
  };

  // Reset states when source changes
  useEffect(() => {
    setLoading(true);
    setHasError(false);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [source?.uri]);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setLoading(false);
    setHasError(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onError?.();
  }, [onError]);

  return (
    <View style={[style, styles.container]}>
      {/* AnimatedLoader for Background Images */}
      {loading && showLoader && !hasError && (
        <View style={styles.loadingContainer}>
          <AnimatedLoader />
        </View>
      )}

      {/* FastImage as Background */}
      <FastImage
        source={getImageSource()}
        style={StyleSheet.absoluteFill}
        resizeMode={FastImage.resizeMode[resizeMode] || FastImage.resizeMode.cover}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />

      {/* Children overlay on top of the image */}
      {children}
    </View>
  );
};

// 3. CARD/LIST IMAGE COMPONENT
export const OptimizedCardImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    priority="normal"
    showLoader={true}
    style={[{ borderRadius: 8 }, props.style]}
  />
);

// 4. HERO/BANNER IMAGE COMPONENT (Using Background)
export const OptimizedHeroImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImageBackground
    {...props}
    priority="high"
    showLoader={true}
  />
);

// 5. AVATAR/PROFILE IMAGE COMPONENT
export const OptimizedAvatar: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    priority="low"
    showLoader={false} // Usually too small for loader
    style={[{ borderRadius: 50 }, props.style]}
  />
);

// 6. ALIAS FOR EASIER MIGRATION (FastImageBackground equivalent)
export const FastImageBackground = OptimizedImageBackground;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5', // Light gray while loading
    overflow: 'hidden',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  skeletonContainer: {
    backgroundColor: '#e1e9ee',
    overflow: 'hidden',
    position: 'relative',
  },
  skeletonShimmer: {
    height: '100%',
    backgroundColor: '#f2f8fc',
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

// Export default for easy importing
export default OptimizedImage;
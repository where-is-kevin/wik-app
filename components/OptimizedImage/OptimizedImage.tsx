import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ViewStyle,
  ImageStyle,
  StyleSheet,
  StyleProp,
  Text,
} from "react-native";
import { Image, ImageSource, ImageContentFit } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import ShimmerLoader from "@/components/Loader/ShimmerLoader";

// Default fallback image - using a simple placeholder
const DefaultPlaceholder = require("@/assets/images/placeholder-bucket.png");

type ImagePriority = "low" | "normal" | "high";
type CachePolicy = "memory" | "disk" | "memory-disk" | "none";

const DEFAULT_AVATARS = {
  USER_AVATAR: DefaultPlaceholder,
};

interface OptimizedImageProps {
  source: string | ImageSource | { uri: string };
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  placeholder?: string;
  showLoadingIndicator?: boolean;
  showErrorFallback?: boolean;
  fallbackImage?: string | ImageSource;
  useDefaultAvatar?: boolean;
  defaultAvatarType?: keyof typeof DEFAULT_AVATARS;
  onPress?: () => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
  transition?: number;
  priority?: ImagePriority;
  cachePolicy?: CachePolicy;
  borderRadius?: number;
  overlayComponent?: React.ReactNode;
  errorRetryText?: string;
  accessibilityLabel?: string;
  resizeMode?: "contain" | "cover" | "stretch" | "center";
  children?: React.ReactNode;
}

// Create base styles outside component to prevent recreation
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  } as ImageStyle,
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 12,
    color: colors.gray_regular,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: colors.lime,
    borderRadius: 4,
  },
  retryText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  contentFit = "cover",
  placeholder,
  showLoadingIndicator = true,
  showErrorFallback = true,
  fallbackImage,
  useDefaultAvatar = false,
  defaultAvatarType = "USER_AVATAR",
  onPress,
  onLoad,
  onError,
  transition = 200,
  priority = "normal",
  cachePolicy = "memory-disk",
  borderRadius,
  overlayComponent,
  errorRetryText = "Retry",
  accessibilityLabel,
}) => {
  const { colors } = useTheme();

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const isSourceEmpty = (
    src: string | ImageSource | { uri: string }
  ): boolean => {
    if (typeof src === "string") {
      return !src || src.trim() === "";
    }
    if (src && typeof src === "object" && "uri" in src) {
      return !src.uri || src.uri.trim() === "";
    }
    return !src;
  };

  const [isLoading, setIsLoading] = useState(() => {
    // Check if this is a Google Places photo - don't show loading for blocked requests
    const imageUrl = typeof source === 'string' ? source : (source as any)?.uri;
    if (imageUrl && imageUrl.includes('googleapis.com/maps/api/place/photo')) {
      return false; // Don't show loading for Google Places photos since we block them
    }

    if (useDefaultAvatar && isSourceEmpty(source)) {
      return false;
    }
    return !useDefaultAvatar;
  });
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0); // Reset retry count on successful load
    onLoad?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);

    // Log Google Places API image failures and prevent infinite retries
    const imageUrl = typeof source === 'string' ? source : (source as any)?.uri;
    if (imageUrl && imageUrl.includes('googleapis.com/maps/api/place/photo')) {
      console.warn('Google Places photo failed to load:', imageUrl);
      // Set retry count to max to prevent any retries for Google Places photos
      setRetryCount(3);
    }

    onError?.(error);
  };

  const handleRetry = () => {
    // Prevent infinite retries - max 3 attempts
    if (retryCount >= 3) {
      console.warn('Max retry attempts reached for image:', source);
      return;
    }

    setHasError(false);
    setIsLoading(true);
    setRetryKey((prev) => prev + 1);
    setRetryCount((prev) => prev + 1);
  };

  const getImageSource = (): string | ImageSource => {
    // Check if this is a Google Places photo and force fallback immediately
    const imageUrl = typeof source === 'string' ? source : (source as any)?.uri;
    if (imageUrl && imageUrl.includes('googleapis.com/maps/api/place/photo')) {
      // Don't log for every blocked request - too verbose
      if (fallbackImage) return fallbackImage;
      if (useDefaultAvatar) return DEFAULT_AVATARS[defaultAvatarType];
      return DefaultPlaceholder; // Always return the default placeholder
    }

    if (isSourceEmpty(source) && useDefaultAvatar) {
      return DEFAULT_AVATARS[defaultAvatarType];
    }

    if (hasError && fallbackImage) {
      return fallbackImage;
    }

    if (hasError && useDefaultAvatar) {
      return DEFAULT_AVATARS[defaultAvatarType];
    }

    if (isSourceEmpty(source) && fallbackImage) {
      return fallbackImage;
    }

    return source as string | ImageSource;
  };

  const getBorderRadiusImageStyle = (): ImageStyle | undefined => {
    return borderRadius !== undefined ? { borderRadius } : undefined;
  };

  const getBorderRadiusViewStyle = (): ViewStyle | undefined => {
    return borderRadius !== undefined ? { borderRadius } : undefined;
  };

  const containerStyles: StyleProp<ViewStyle>[] = [
    styles.container,
    getBorderRadiusViewStyle(),
  ];

  const imageStyles: StyleProp<ImageStyle>[] = [
    styles.image,
    style,
    getBorderRadiusImageStyle(),
  ];

  const renderContent = () => {
    if (hasError && !fallbackImage && !useDefaultAvatar && showErrorFallback) {
      return (
        <View style={[styles.errorContainer, getBorderRadiusViewStyle()]}>
          <Ionicons
            name="image-outline"
            size={24}
            color={colors.gray_regular}
          />
          <Text style={styles.errorText}>Failed to load image</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>{errorRetryText}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentSource = getImageSource();
    const isUsingDefaultAvatar =
      useDefaultAvatar && (isSourceEmpty(source) || hasError);

    return (
      <>
        <Image
          key={retryKey}
          source={currentSource}
          style={imageStyles}
          contentFit={contentFit}
          placeholder={placeholder}
          onLoad={isUsingDefaultAvatar ? undefined : handleLoad}
          onError={isUsingDefaultAvatar ? undefined : handleError}
          transition={isUsingDefaultAvatar ? 0 : transition}
          priority={priority}
          cachePolicy={cachePolicy}
          accessibilityLabel={accessibilityLabel}
          recyclingKey={
            typeof currentSource === "string" ? currentSource : undefined
          }
        />

        {isLoading && showLoadingIndicator && (
          <View style={[styles.loadingContainer, getBorderRadiusViewStyle()]}>
            <ShimmerLoader
              borderRadius={borderRadius}
              width="100%"
              height="100%"
            />
          </View>
        )}

        {overlayComponent && (
          <View style={styles.overlayContainer}>{overlayComponent}</View>
        )}
      </>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyles}>{renderContent()}</View>;
};

OptimizedImage.displayName = 'OptimizedImage';

// Background Image Component
export const OptimizedImageBackground: React.FC<OptimizedImageProps> = ({
  children,
  ...props
}) => {
  return <OptimizedImage {...props} overlayComponent={children} />;
};

// Card/List Image Component
export const OptimizedCardImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    priority="normal"
    showLoadingIndicator={true}
    style={[{ borderRadius: 8 }, props.style]}
  />
);

// Hero/Banner Image Component
export const OptimizedHeroImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImageBackground
    {...props}
    priority="high"
    showLoadingIndicator={true}
  />
);

// Avatar/Profile Image Component
export const OptimizedAvatar: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage
    {...props}
    priority="low"
    showLoadingIndicator={false}
    style={[{ borderRadius: 50 }, props.style]}
  />
);

// Optimized prefetch function
const prefetchImages = async (urls: string | string[]): Promise<boolean[]> => {
  const urlsArray = Array.isArray(urls) ? urls : [urls];

  const validUrls = urlsArray.filter(
    (url) => url && typeof url === "string" && url.trim() !== ""
  );

  if (validUrls.length === 0) {
    return [];
  }

  return Promise.all(
    validUrls.map(async (url) => {
      try {
        return await Image.prefetch(url, {
          cachePolicy: "disk",
          headers: {
            "Cache-Control": "max-age=31536000, immutable",
          },
        });
      } catch (error) {
        console.warn(`Failed to prefetch image: ${url}`, error);
        return false;
      }
    })
  );
};

const clearImageCache = (): Promise<boolean> => {
  return Image.clearMemoryCache();
};

const getImageCacheSize = (): Promise<number> => {
  console.warn("getCacheSize is not available in expo-image");
  return Promise.resolve(0);
};

// Attach static methods to the component
(OptimizedImage as any).prefetch = prefetchImages;
(OptimizedImage as any).clearCache = clearImageCache;
(OptimizedImage as any).getCacheSize = getImageCacheSize;

// Alias for easier migration
export const FastImageBackground = OptimizedImageBackground;

export default OptimizedImage as React.FC<OptimizedImageProps> & {
  prefetch: typeof prefetchImages;
  clearCache: typeof clearImageCache;
  getCacheSize: typeof getImageCacheSize;
};

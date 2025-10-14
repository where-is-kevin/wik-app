import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  ViewStyle,
  ImageStyle,
  StyleSheet,
  StyleProp,
} from "react-native";
import { Image, ImageSource, ImageContentFit } from "expo-image";
import { useTheme } from "@/contexts/ThemeContext";
import ShimmerLoader from "@/components/Loader/ShimmerLoader";
import { ImagePlaceholder } from "./ImagePlaceholder";

// Legacy fallback - SVG placeholder now used via error handling

// Global cache of failed URLs to prevent retries
const failedUrls = new Set<string>();

type ImagePriority = "low" | "normal" | "high";
type CachePolicy = "memory" | "disk" | "memory-disk" | "none";

const DEFAULT_AVATARS = {
  USER_AVATAR: "", // Will show SVG placeholder via error handling
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
  accessibilityLabel?: string;
  resizeMode?: "contain" | "cover" | "stretch" | "center";
  children?: React.ReactNode;
}

// Create base styles outside component to prevent recreation
const createStyles = (colors: any) =>
  StyleSheet.create({
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
    if (useDefaultAvatar && isSourceEmpty(source)) {
      return false;
    }
    return !useDefaultAvatar;
  });
  const [hasError, setHasError] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);

    // Add this URL to global failed cache to prevent future attempts
    const imageUrl = typeof source === "string" ? source : (source as any)?.uri;
    if (imageUrl) {
      failedUrls.add(imageUrl);
    }

    onError?.(error);
  };

  const getImageSource = (): string | ImageSource => {
    const imageUrl = typeof source === "string" ? source : (source as any)?.uri;

    // If this URL has previously failed, don't attempt again
    if (imageUrl && failedUrls.has(imageUrl)) {
      if (fallbackImage) return fallbackImage;
      if (useDefaultAvatar) return DEFAULT_AVATARS[defaultAvatarType];
      return ""; // Will show SVG placeholder
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
    style, // Apply margin, padding, and position styles to container
    getBorderRadiusViewStyle(),
  ];

  const imageStyles: StyleProp<ImageStyle>[] = [
    styles.image,
    getBorderRadiusImageStyle(),
  ];

  const renderContent = () => {
    const currentSource = getImageSource();
    const imageUrl = typeof source === "string" ? source : (source as any)?.uri;

    // Check if this URL is in the failed cache or if we have an error
    const shouldShowPlaceholder =
      (hasError && !fallbackImage && !useDefaultAvatar && showErrorFallback) ||
      (imageUrl &&
        failedUrls.has(imageUrl) &&
        !fallbackImage &&
        !useDefaultAvatar &&
        showErrorFallback) ||
      (isSourceEmpty(source) && !useDefaultAvatar && showErrorFallback);

    const isUsingDefaultAvatar =
      useDefaultAvatar && (isSourceEmpty(source) || hasError);

    return (
      <>
        <Image
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

        {shouldShowPlaceholder && (
          <ImagePlaceholder
            containerWidth={containerDimensions?.width}
            containerHeight={containerDimensions?.height}
            borderRadius={borderRadius}
          />
        )}

        {overlayComponent && (
          <View style={styles.overlayContainer}>{overlayComponent}</View>
        )}
      </>
    );
  };

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        activeOpacity={0.8}
        onLayout={handleLayout}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyles} onLayout={handleLayout}>
      {renderContent()}
    </View>
  );
};

OptimizedImage.displayName = "OptimizedImage";

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

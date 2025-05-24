import "dotenv/config"; // Load environment variables from .env

export default ({ config }) => ({
  ...config, // Merge existing app.json configuration
  extra: {
    ...config.extra, // Retain existing extra fields
    apiUrl: process.env.API_URL, // Load API URL from .env
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY, // Load Google Maps API key from .env
  },
  ios: {
    ...config.ios,
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY, // Add Google Maps API key for iOS
    },
  },
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY, // Add Google Maps API key for Android
      },
    },
  },
  plugins: [
    ...(config.plugins || []),
    [
      "react-native-maps",
      {
        config: {
          googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY, // Add Google Maps API key for the plugin
        },
      },
    ],
  ],
});
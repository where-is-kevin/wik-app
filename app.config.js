import "dotenv/config"; // Load environment variables from .env

export default ({ config }) => ({
  ...config, // Merge existing app.json configuration
  android: {
    ...config.android, // Keep existing Android config
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },
  extra: {
    ...config.extra, // Retain existing extra fields
    apiUrl: process.env.API_URL, // Load API URL from .env
    uxcamAppKey: process.env.UXCAM_APP_KEY, // Add UXCam app key
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY, // Add this line
  },
});

import "dotenv/config"; // Load environment variables from .env

export default ({ config }) => ({
  ...config, // Merge existing app.json configuration
  extra: {
    ...config.extra, // Retain existing extra fields
    apiUrl: process.env.API_URL // Load API URL from .env
  }
});
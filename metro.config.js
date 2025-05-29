const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add .lottie files to asset extensions
config.resolver.assetExts.push('lottie');

// Add path alias for @ imports
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

module.exports = config;
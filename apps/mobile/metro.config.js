const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// Monorepo root — two levels up from apps/mobile
const monorepoRoot = path.resolve(__dirname, '../..');

const config = {
  // Watch the entire monorepo so Metro can resolve workspace packages
  watchFolders: [monorepoRoot],

  resolver: {
    // Allow Metro to resolve from monorepo node_modules as a fallback
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    // Force single copies of these packages to avoid duplicate React errors
    extraNodeModules: {
      react: path.resolve(monorepoRoot, 'node_modules/react'),
      'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
      zustand: path.resolve(monorepoRoot, 'node_modules/zustand'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

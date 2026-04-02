import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const plugins = {
  tailwindcss: {},
};

try {
  require.resolve('autoprefixer');
  plugins.autoprefixer = {};
} catch {
  // Keep local test/build workflows working when autoprefixer is not installed.
}

const config = { plugins };

export default config;

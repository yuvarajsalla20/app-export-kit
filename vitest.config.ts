import { defineConfig } from 'vitest/config';

const stub = (name: string) => new URL(`./tests/stubs/${name}.ts`, import.meta.url).pathname;

export default defineConfig({
  resolve: {
    alias: {
      'expo-file-system': stub('expo-file-system'),
      'expo-print': stub('expo-print'),
      'expo-sharing': stub('expo-sharing'),
      'react-native': stub('react-native'),
    },
  },
  test: { include: ['tests/**/*.test.ts'] },
});

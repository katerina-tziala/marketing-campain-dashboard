import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vue-vendor',
              test: /node_modules[\\/](?:@vue|vue|vue-router|pinia)[\\/]/,
            },
            {
              name: 'chart-vendor',
              test: /node_modules[\\/](?:chart\.js|vue-chartjs)[\\/]/,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
            },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@ui': path.resolve(__dirname, './src/ui'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/mixins/container-queries" as *;
        `,
      },
    },
  },
});

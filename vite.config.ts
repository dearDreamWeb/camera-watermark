/* eslint-disable prettier/prettier */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint'; // 引入
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 配置eslintPlugin
    eslintPlugin({
      cache: false,
      include: './src',
    }),
    visualizer(),
  ],
  base: './',
  server: {
    https: {
      key: fs.readFileSync('config/cert/ca.key'),
      cert: fs.readFileSync('config/cert/ca.crt'),
    },
    port: 1245,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    //* css模块化
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      hashPrefix: 'prefix',
    },
    //* 预编译支持less
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
      },
    },
  },
});

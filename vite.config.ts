import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx';
const DEPLOY_BASE_URL = process.env.DEPLOY_BASE_URL
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  base: DEPLOY_BASE_URL ?? '/dist'
})

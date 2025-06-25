import { createApp } from 'vue';
import App from '@/App.vue';
import { registerPlugins } from '@core/utils/plugins';
import { useUserStore } from './stores/user';
import setupAutoSelectOnFocus from './utils/auto-select-on-focus';

// Styles
import '@core/scss/template/index.scss';
import '@layouts/styles/index.scss';

// // Create vue app
// const app = createApp(App);
// // Register plugins
// registerPlugins(app);
// // Mount vue app
// app.mount('#app');

(async () => {
  // Create vue app
  const app = createApp(App);

  await registerPlugins(app);

  console.log('Executing pre-mount operations...');
  //   await getUserApi();

  // Mount vue app
  app.mount('#app');
  console.log('Vue app mounted successfully!');
})();

// setupAutoSelectOnFocus(); // 👈 تطبيق السلوك على كامل النظام

async function getUserApi() {
  const userStore = useUserStore();
  await userStore.fetchUser();
}

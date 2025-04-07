import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useThemeStore } from './stores/theme'
import App from './App.vue'
import router from './router'


// PrimeVue
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
// import 'primevue/resources/themes/lara-light-blue/theme.css';
// import 'primeicons/primeicons.css';

// Toast notifications
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

// Loading overlay
import 'vue-loading-overlay/dist/css/index.css';

// Animations
import 'aos/dist/aos.css';

const app = createApp(App)
const pinia = createPinia();

app.use(pinia);

const themeStore = useThemeStore();
themeStore.initTheme();

app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});
app.use(Toast);

app.mount('#app');

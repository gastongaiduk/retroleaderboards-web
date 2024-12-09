import {createApp} from 'vue';
import {createPinia, PiniaPlugin} from 'pinia';
import App from './App.vue';
import router from './router/index';
import {markRaw} from 'vue';

// Create a Pinia instance
const pinia = createPinia();

// Integrate router with Pinia
const piniaPlugin: PiniaPlugin = ({store}) => {
    store.router = markRaw(router);
};

pinia.use(piniaPlugin);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');

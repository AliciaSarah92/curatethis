import 'bootstrap/dist/css/bootstrap.css';
// import 'popper.js/dist/popper.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import './assets/main.scss';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import axios from 'axios';
import VueAxios from 'vue-axios';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.config.globalProperties.$filters = {
    str_limit(value: string, size: number) {
        if (!value) return '';
        value = value.toString();

        if (value.length <= size) {
            return value;
        }
        return value.substr(0, size) + '...';
    },
};

app.use(VueAxios, axios);
app.provide('axios', app.config.globalProperties.axios);

app.use(createPinia());
app.use(router);

app.mount('#app');

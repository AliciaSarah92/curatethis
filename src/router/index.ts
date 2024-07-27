import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@/guards/auth';

import HomeView from '../views/HomeView.vue';
import SearchView from '../views/SearchView.vue';
import CollectionView from '../views/CollectionView.vue';
import AccountView from '../views/AccountView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { authRequired: false },
        },
        {
            path: '/search',
            name: 'search',
            component: SearchView,
            meta: { authRequired: false },
        },
        {
            path: '/my-collections',
            name: 'collections',
            component: CollectionView,
            meta: { authRequired: true },
        },
        {
            path: '/account',
            name: 'account',
            component: AccountView,
            meta: { authRequired: true },
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('../views/AuthView.vue'),
            meta: { authRequired: false },
        },
    ],
});

router.beforeEach(authGuard);

export default router;

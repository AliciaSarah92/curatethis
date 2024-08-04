import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@/guards/auth';

import SearchView from '../views/SearchView.vue';
import CollectionsView from '../views/CollectionsView.vue';
import CollectionView from '../views/CollectionView.vue';
import AccountView from '../views/AccountView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'search',
            component: SearchView,
            meta: { authRequired: false },
        },
        {
            path: '/my-collections',
            name: 'collections',
            component: CollectionsView,
            meta: { authRequired: true },
        },
        {
            path: '/my-collections/:id',
            name: 'collection',
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

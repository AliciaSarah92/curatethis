<script setup lang="ts">
import { RouteLocationRaw, RouterView, useRouter, useRoute } from 'vue-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import Header from './components/partials/Header.vue';
import Footer from './components/partials/Footer.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

authStore.loadUser();

supabase.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_IN') {
        authStore.loadUser();
        authStore.loadRedirectRoute();

        if (route.meta.authRequired === false) {
            router.push({ path: '/search' });
        }
    } else if (event === 'SIGNED_OUT') {
        authStore.clearUser();
    }
});

authStore.$onAction(({ name, store, after }) => {
    if (name === 'loadRedirectRoute') {
        after(async () => {
            const redirectRoute = store.redirectRoute;

            if (redirectRoute) {
                await router.isReady();
                await router.replace(redirectRoute as RouteLocationRaw);
                authStore.clearRedirectRoute();
            }
        });
    }
});
</script>

<template>
    <div>
        <Header />
        <RouterView class="py-5" />
        <Footer class="pb-3" />
    </div>
</template>

<style scoped></style>

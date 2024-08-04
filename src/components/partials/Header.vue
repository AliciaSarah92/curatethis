<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';

const route = useRoute();
const authStore = useAuthStore();
</script>

<template>
    <header data-bs-theme="dark">
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
            <div class="container">
                <RouterLink
                    class="navbar-brand"
                    aria-current="page"
                    :to="{ name: 'search' }"
                    >CurateThis.</RouterLink
                >
                <button
                    class="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarCollapse"
                    aria-controls="navbarCollapse"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div
                    class="collapse navbar-collapse"
                    id="navbarCollapse"
                >
                    <ul
                        v-cloak
                        class="navbar-nav ms-auto mb-2 mb-md-0"
                    >
                        <li class="nav-item">
                            <RouterLink
                                class="nav-link"
                                :class="{ active: route.name === 'search' }"
                                aria-current="page"
                                :to="{ name: 'search' }"
                                >Search</RouterLink
                            >
                        </li>
                        <li class="nav-item">
                            <RouterLink
                                v-if="authStore.isAuthenticated"
                                class="nav-link"
                                :class="{ active: route.name === 'collections' }"
                                aria-current="page"
                                :to="{ name: 'collections' }"
                                >My Collections</RouterLink
                            >
                            <RouterLink
                                v-else
                                class="nav-link"
                                aria-current="page"
                                :to="{ name: 'login' }"
                                >Login</RouterLink
                            >
                        </li>
                        <li
                            v-if="authStore.isAuthenticated"
                            class="nav-item"
                        >
                            <RouterLink
                                class="nav-link"
                                :class="{ active: route.name === 'account' }"
                                aria-current="page"
                                :to="{ name: 'account' }"
                                >Account</RouterLink
                            >
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>

<style scoped></style>

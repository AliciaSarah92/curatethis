<script setup>
import Auth from '../components/Auth.vue';
</script>

<template>
    <div class="overflow-hidden">
        <img
            class="position-absolute end-0 w-50 object-fit-cover vh-100 z-0 p-0"
            src="../assets/imgs/colorful.jpg"
        />

        <div class="cover-container position-relative z-1 d-flex w-50 vh-100 p-3 mx-auto flex-column">
            <div class="mb-auto"></div>

            <div class="px-3 container">
                <Auth />
            </div>

            <div class="mt-auto"></div>
        </div>
    </div>
</template>

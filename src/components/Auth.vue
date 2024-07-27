<script setup>
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'vue-router';

const loading = ref(false);
const email = ref('');
const router = useRouter();

const handleLogin = async () => {
    try {
        loading.value = true;
        const { error } = await supabase.auth.signInWithOtp({
            email: email.value,
        });
        if (error) throw error;
        router.push({ path: '/' });
        alert('Check your email for the login link!');
    } catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        }
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <form
        class="row mx-auto flex-center flex"
        @submit.prevent="handleLogin"
    >
        <div class="form-widget">
            <h1 class="header">Login</h1>
            <p class="description">Sign in via magic link with your email below</p>

            <p v-if="loading">Please wait...</p>

            <div
                v-else
                class="form-group"
            >
                <input
                    aria-label="Email address"
                    class="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    placeholder="Enter email"
                    required
                    type="email"
                    v-model="email"
                />
            </div>
            <div>
                <input
                    type="submit"
                    class="button mt-3 block"
                    :value="loading ? 'Loading' : 'Send magic link'"
                    :disabled="loading"
                />
            </div>
        </div>
    </form>
</template>

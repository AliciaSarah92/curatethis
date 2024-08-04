<script setup>
import { supabase } from '../lib/supabase';
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useNotification } from '@kyvg/vue3-notification';

const { notify } = useNotification();
const authStore = useAuthStore();
const router = useRouter();
const user = authStore.currentUser;

const loading = ref(true);
const username = ref('');
const website = ref('');
const avatar_url = ref('');

onMounted(() => {
    getProfile();
});

async function getProfile() {
    try {
        loading.value = true;

        const { data, error, status } = await supabase.from('profiles').select(`username, website, avatar_url`).eq('id', user.id).single();

        if (error && status !== 406) throw error;

        if (data) {
            username.value = data.username;
            website.value = data.website;
            avatar_url.value = data.avatar_url;
        }
    } catch (error) {
        notify({
            title: 'Error',
            text: error,
            type: 'error',
        });
    } finally {
        loading.value = false;
    }
}

async function updateProfile() {
    try {
        loading.value = true;
        // const { user } = session.value;

        const updates = {
            id: user.id,
            username: username.value,
            website: website.value,
            avatar_url: avatar_url.value,
            updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) throw error;

        notify({
            title: 'Success',
            text: 'Profile updated successfully.',
            type: 'success',
        });
    } catch (error) {
        notify({
            title: 'Error',
            text: error,
            type: 'error',
        });
    } finally {
        loading.value = false;
    }
}

async function signOut() {
    try {
        loading.value = true;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        notify({
            title: 'Success',
            text: 'Logged out successfully.',
            type: 'success',
        });

        router.push({ path: '/' });
    } catch (error) {
        notify({
            title: 'Error',
            text: error,
            type: 'error',
        });
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="container mt-5">
        <fieldset class="text-start">
            <legend>Update Profile</legend>

            <form
                class="form-widget mt-5"
                @submit.prevent="updateProfile"
            >
                <div class="mb-3">
                    <label
                        class="form-label"
                        for="email"
                        >Email</label
                    >
                    <input
                        class="form-control"
                        id="email"
                        type="text"
                        placeholder="Disabled input"
                        :value="user.email"
                        disabled
                    />
                </div>
                <div class="mb-3">
                    <label
                        class="form-label"
                        for="username"
                        >Name</label
                    >
                    <input
                        class="form-control"
                        id="username"
                        placeholder="Enter Username"
                        type="text"
                        v-model="username"
                    />
                </div>
                <div class="mb-3">
                    <label
                        class="form-label"
                        for="website"
                        >Website</label
                    >
                    <input
                        class="form-control"
                        id="website"
                        placeholder="Enter Website"
                        type="url"
                        v-model="website"
                    />
                </div>
                <input
                    class="form-control btn btn-outline-primary block"
                    type="submit"
                    :value="loading ? 'Loading ...' : 'Update'"
                    :disabled="loading"
                />

                <button
                    class="form-control mt-5 btn btn-outline-danger primary block"
                    @click="signOut"
                    :disabled="loading"
                >
                    Sign Out
                </button>
            </form>
        </fieldset>
    </div>
</template>

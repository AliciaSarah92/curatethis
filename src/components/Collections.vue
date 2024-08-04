<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import moment from 'moment';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '../lib/supabase';
import CreateCollectionModal from '@/components/CreateCollectionModal.vue';

const axios: any = inject('axios');
const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);
const myCollections = ref(null);
const createCollectionModal = ref(null);

const getMyCollections = async (user = null) => {
    const { data, error } = await supabase
        .from('collections')
        .select(
            `
                    id,
                    user_id,
                    name,
                    artworks (
                        id,
                        artwork_id,
                        image
                    )
                `
        )
        .eq('user_id', user ? user.id : authStore.currentUser.id)
        .order('created_at', { ascending: false });

    if (error) throw error;

    myCollections.value = data;
};

const reloadData = (status = false) => {
    if (status) {
        getMyCollections();
    }
};

watch(
    () => currentUser.value,
    async user => {
        if (user) {
            getMyCollections(user);
        }
    },
    { deep: true, immediate: true }
);

const openModal = () => {
    createCollectionModal.value.showModal();
};

onMounted(() => {});
</script>
<template>
    <div class="container mt-5">
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <RouterLink
                v-for="collection in myCollections"
                :key="collection"
                class="col text-decoration-none"
                :to="{ name: 'collection', params: { id: collection.id } }"
            >
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">{{ collection.name }}</h5>
                        <p class="card-text">There are {{ collection.artworks.length }} artworks in this collection</p>
                    </div>
                </div>
            </RouterLink>

            <a
                class="card w-100 text-decoration-none"
                href="#"
                @click="openModal"
            >
                <div class="card-body">
                    <h5 class="card-title">Add Collection</h5>
                </div>
            </a>
        </div>
    </div>

    <CreateCollectionModal
        ref="createCollectionModal"
        @closeModal="reloadData"
    />
</template>

<style scoped></style>

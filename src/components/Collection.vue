<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import moment from 'moment';
import Loader from './Loader.vue';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '../lib/supabase';
import { useRoute } from 'vue-router';

const axios: any = inject('axios');
const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);
const collection = ref(null);
const artworks = ref([]);
const route = useRoute();
const loading = ref(false);

const getMyCollection = async (user = null) => {
    loading.value = true;

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
                        image,
                        type
                    )
    `
        )
        .eq('id', route.params.id)
        .limit(1)
        .single()
        .order('created_at', { ascending: false });

    if (error) throw error;

    collection.value = data;

    data.artworks.forEach(item => {
        const url = item.type === 'artinstituteofchicago' ? `https://api.artic.edu/api/v1/artworks/${item.artwork_id}` : `https://api.harvardartmuseums.org/object/${item.artwork_id}?apikey=c965d551-abdb-4327-83c5-cffabb23aacd`;

        axios
            .get(url, {
                headers: {
                    accept: 'application/json',
                },
            })
            .then((response: { data: any }) => {
                const searchData = item.type === 'artinstituteofchicago' ? response.data.data : response.data;

                const link = item.type === 'artinstituteofchicago' ? searchData.api_link.replace('api.', '').replace('api/v1/', '') : searchData.url;
                const image = item.type === 'artinstituteofchicago' ? response.data.config.iiif_url + '/' + searchData.image_id + '/full/843,/0/default.jpg' : searchData.images.length ? searchData.images[0].iiifbaseuri + '/full/full/0/default.jpg' : '';
                const publication = item.type === 'artinstituteofchicago' ? searchData.publication_history : searchData.copyright;
                const artist_display = item.type === 'artinstituteofchicago' ? searchData.artist_display : searchData.department;
                const credit_line = item.type === 'artinstituteofchicago' ? searchData.credit_line : searchData.creditline;
                const provenance_text = item.type === 'artinstituteofchicago' ? searchData.provenance_text : searchData.verificationleveldescription;
                const place_of_origin = item.type === 'artinstituteofchicago' ? searchData.place_of_origin : searchData.department;
                const updated_at = item.type === 'artinstituteofchicago' ? searchData.updated_at : searchData.lastupdate;

                artworks.value.push({
                    id: searchData.id,
                    title: searchData.title,
                    publication: publication,
                    artist_display: artist_display,
                    credit_line: credit_line,
                    provenance_text: provenance_text,
                    place_of_origin: place_of_origin,
                    description: searchData.description,
                    updated_at: updated_at,
                    link: link,
                    image: image,
                });
            });
    });

    console.log(artworks.value);

    loading.value = false;
};

onMounted(() => {
    getMyCollection();
});
</script>
<template>
    <Loader
        class="my-5"
        v-if="loading"
    />
    <div
        v-else
        class="container mt-5"
    >
        <h2 class="my-5">Collection: {{ collection?.name }}</h2>
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <div
                v-for="artwork in artworks"
                :key="artwork"
                class="col"
            >
                <div class="card h-100">
                    <img
                        v-if="artwork.image"
                        :src="artwork.image"
                        class="card-img-top"
                        :alt="artwork.title"
                    />
                    <div class="card-body">
                        <h5 class="card-title">{{ artwork.title }}</h5>
                        <p class="card-text">{{ artwork.artist_display }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>

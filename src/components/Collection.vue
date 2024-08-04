<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Loader from './Loader.vue';
import moment from 'moment';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '../lib/supabase';
import { useRoute } from 'vue-router';
import { Modal } from 'bootstrap';

const axios: any = inject('axios');
const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);
const collection = ref(null);
const artworks = ref([]);
const route = useRoute();
const loading = ref(false);
const searchItem = ref(null);
const modalLoading = ref(false);
const modalEl = ref(null);
const modal = ref(null);

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
                    type: item.type,
                });
            });
    });

    loading.value = false;
};

const getSearchItem = (artwork = null) => {
    modalLoading.value = true;

    const url = artwork.type === 'artinstituteofchicago' ? `https://api.artic.edu/api/v1/artworks/${artwork.id}` : `https://api.harvardartmuseums.org/object/${artwork.id}?apikey=c965d551-abdb-4327-83c5-cffabb23aacd`;

    axios
        .get(url, {
            headers: {
                accept: 'application/json',
            },
        })
        .then((response: { data: any }) => {
            const searchData = artwork.type === 'artinstituteofchicago' ? response.data.data : response.data;

            const link = artwork.type === 'artinstituteofchicago' ? searchData.api_link.replace('api.', '').replace('api/v1/', '') : searchData.url;
            const image = artwork.type === 'artinstituteofchicago' ? response.data.config.iiif_url + '/' + searchData.image_id + '/full/843,/0/default.jpg' : searchData.images.length ? searchData.images[0].iiifbaseuri + '/full/full/0/default.jpg' : '';
            const publication = artwork.type === 'artinstituteofchicago' ? searchData.publication_history : searchData.copyright;
            const artist_display = artwork.type === 'artinstituteofchicago' ? searchData.artist_display : searchData.department;
            const credit_line = artwork.type === 'artinstituteofchicago' ? searchData.credit_line : searchData.creditline;
            const provenance_text = artwork.type === 'artinstituteofchicago' ? searchData.provenance_text : searchData.verificationleveldescription;
            const place_of_origin = artwork.type === 'artinstituteofchicago' ? searchData.place_of_origin : searchData.department;
            const updated_at = artwork.type === 'artinstituteofchicago' ? searchData.updated_at : searchData.lastupdate;

            searchItem.value = {
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
            };

            modalLoading.value = false;
        });

    showModal();
};

const closeSearchItem = () => {
    searchItem.value = null;
};

const showModal = () => {
    modal.value.show();
};

const closeModal = () => {
    modal.value.hide();
    searchItem.value = null;
};

onMounted(() => {
    modal.value = new Modal(modalEl.value);
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
                <div
                    @click="getSearchItem(artwork)"
                    class="card h-100"
                >
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

    <div
        class="modal fade"
        id="viewArtwork"
        tabindex="-1"
        data-bs-backdrop="static"
        aria-labelledby="viewArtworkLabel"
        aria-hidden="true"
        ref="modalEl"
    >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div
                v-if="!modalLoading"
                class="modal-content"
            >
                <div class="modal-header">
                    <h1
                        class="modal-title fs-5"
                        id="viewArtworkLabel"
                    >
                        {{ searchItem?.title }}
                    </h1>

                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        @click="closeSearchItem"
                    ></button>
                </div>
                <div class="modal-body text-start">
                    <img
                        v-if="searchItem?.image"
                        class="object-fit-cover w-100 h-50"
                        :src="searchItem?.image"
                    />

                    <ul class="mt-3">
                        <li>Place: {{ searchItem?.artist_display }}</li>
                        <li>Credit Line: {{ searchItem?.credit_line }}</li>
                        <li>Last Updated: {{ moment(searchItem?.updated_at).format('DD-MM-YYY') }}</li>
                    </ul>

                    <hr class="featurette-divider" />

                    <div
                        class="accordion mb-3"
                        id="accordionExample"
                    >
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button
                                    class="accordion-button"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#collapseOne"
                                    aria-expanded="true"
                                    aria-controls="collapseOne"
                                >
                                    Description
                                </button>
                            </h2>
                            <div
                                id="collapseOne"
                                class="accordion-collapse collapse show"
                                data-bs-parent="#accordionExample"
                            >
                                <div
                                    class="accordion-body"
                                    v-html="searchItem?.description"
                                ></div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button
                                    class="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#collapseTwo"
                                    aria-expanded="false"
                                    aria-controls="collapseTwo"
                                >
                                    Publication History
                                </button>
                            </h2>
                            <div
                                id="collapseTwo"
                                class="accordion-collapse collapse"
                                data-bs-parent="#accordionExample"
                            >
                                <div
                                    class="accordion-body"
                                    v-html="searchItem?.publication"
                                ></div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header">
                                <button
                                    class="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#collapseThree"
                                    aria-expanded="false"
                                    aria-controls="collapseThree"
                                >
                                    Provenance
                                </button>
                            </h2>
                            <div
                                id="collapseThree"
                                class="accordion-collapse collapse"
                                data-bs-parent="#accordionExample"
                            >
                                <div
                                    class="accordion-body"
                                    v-html="searchItem?.provenance_text"
                                ></div>
                            </div>
                        </div>
                    </div>

                    <a
                        class="mt-3"
                        :href="searchItem?.link"
                        target="_blank"
                        >Find out more about this artwork</a
                    >
                </div>
                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn me-auto btn-secondary"
                        data-bs-dismiss="modal"
                        @click="closeModal"
                    >
                        Close
                    </button>
                </div>
            </div>

            <div
                v-else
                class="modal-content"
            >
                <div class="modal-body">
                    <Loader class="mb-2" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>

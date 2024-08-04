<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import moment from 'moment';
import Loader from './Loader.vue';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '../lib/supabase';
import AddToCollectionModal from '@/components/AddToCollectionModal.vue';
import CreateCollectionModal from '@/components/CreateCollectionModal.vue';

const localSelectedMuseum = localStorage.getItem('selectedMuseum');
const axios: any = inject('axios');
const list = ref([]);
const pagination = ref({
    current_page: 0,
    limit: 12,
    total: 0,
    total_pages: 0,
});
const searchQuery = ref('');
const searchItem = ref(null);
const dataLoading = ref(false);
const loadMoreLoading = ref(false);
const modalLoading = ref(false);
const authStore = useAuthStore();
const createCollectionModal = ref(null);
const addToCollectionModal = ref(null);
const myCollections = ref(null);
const selectedArtwork = ref(null);
const selectedMuseum = ref(localSelectedMuseum ? localSelectedMuseum : 'artinstituteofchicago');
const museums = ref([
    {
        title: 'Art Institute Of Chicago',
        name: 'artinstituteofchicago',
        description: 'Welcome to the Art Institute of Chicago, home to a collection of art that spans centuries and the globe—and one of Tripadvisor’s “Best of the Best” US attractions of 2024.',
    },
    {
        title: 'Harvard Art Museum',
        name: 'harvardartmuseum',
        description: 'Just steps away from Harvard Square in Cambridge, Massachusetts, the Harvard Art Museums welcome visitors from around the corner and around the world.',
    },
]);

const clearSearchData = () => {
    list.value = [];
    pagination.value = {};
    searchQuery.value = '';
    searchItem.value = null;
};

const clearSearch = () => {
    clearSearchData();
    getSelectedMuseum(true);
};

const getSearch = () => {
    list.value = [];
    pagination.value = {};

    getSelectedMuseum(true);
};

const setMuseum = museum => {
    clearSearchData();
    localStorage.setItem('selectedMuseum', museum);
    selectedMuseum.value = museum;
    getSelectedMuseum();
};

const getAIOCCollections = (page = 1) => {
    loadMoreLoading.value = true;
    if (page === 1) {
        dataLoading.value = true;
    }

    const url = `https://api.artic.edu/api/v1/artworks/search?q=${searchQuery.value}&fields=id,title,image_id,description,updated_at&limit=12&page=` + page;
    axios
        .get(url, {
            headers: {
                accept: 'application/json',
            },
        })
        .then((response: { data: any }) => {
            const searchData = response.data.data;
            pagination.value.current_page = response.data.pagination.current_page;
            pagination.value.limit = 12;
            pagination.value.total = response.data.pagination.total.toLocaleString();
            pagination.value.total_pages = response.data.pagination.total_pages === 1 ? 1 : Math.round(response.data.pagination.total / pagination.value.limit).toLocaleString();

            searchData.forEach(item => {
                list.value.push({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    updated_at: searchData.updated_at,
                    image: response.data.config.iiif_url + '/' + item.image_id + '/full/843,/0/default.jpg',
                    type: 'artinstituteofchicago',
                });
            });

            loadMoreLoading.value = false;

            if (page === 1) {
                dataLoading.value = false;
            }
        });
};

const getHAMCCollections = (page = 1) => {
    loadMoreLoading.value = true;
    if (page === 1) {
        dataLoading.value = true;
    }

    const url = `https://api.harvardartmuseums.org/object?q=${searchQuery.value}&apikey=c965d551-abdb-4327-83c5-cffabb23aacd&hasimage=1&sortorder=desc&size=12&page=` + page;
    axios.get(url).then((response: { data: any }) => {
        const searchData = response.data.records;
        pagination.value.current_page = response.data.info.page;
        pagination.value.limit = 12;
        pagination.value.total = response.data.info.totalrecords.toLocaleString();
        pagination.value.total_pages = response.data.info.pages === 1 ? 1 : Math.round(response.data.info.totalrecords / pagination.value.limit).toLocaleString();

        searchData.forEach(item => {
            const image = item.images.length ? item.images[0].iiifbaseuri + '/full/full/0/default.jpg' : '';

            list.value.push({
                id: item.id,
                title: item.title,
                description: item.description,
                updated_at: item.lastupdate,
                image: image,
                type: 'harvardartmuseum',
            });
        });

        loadMoreLoading.value = false;

        if (page === 1) {
            dataLoading.value = false;
        }
    });
};

const getSearchItem = (itemId = null) => {
    modalLoading.value = true;

    const url = selectedMuseum.value === 'artinstituteofchicago' ? `https://api.artic.edu/api/v1/artworks/${itemId}` : `https://api.harvardartmuseums.org/object/${itemId}?apikey=c965d551-abdb-4327-83c5-cffabb23aacd`;

    axios
        .get(url, {
            headers: {
                accept: 'application/json',
            },
        })
        .then((response: { data: any }) => {
            const searchData = selectedMuseum.value === 'artinstituteofchicago' ? response.data.data : response.data;

            const link = selectedMuseum.value === 'artinstituteofchicago' ? searchData.api_link.replace('api.', '').replace('api/v1/', '') : searchData.url;
            const image = selectedMuseum.value === 'artinstituteofchicago' ? response.data.config.iiif_url + '/' + searchData.image_id + '/full/843,/0/default.jpg' : searchData.images.length ? searchData.images[0].iiifbaseuri + '/full/full/0/default.jpg' : '';
            const publication = selectedMuseum.value === 'artinstituteofchicago' ? searchData.publication_history : searchData.copyright;
            const artist_display = selectedMuseum.value === 'artinstituteofchicago' ? searchData.artist_display : searchData.department;
            const credit_line = selectedMuseum.value === 'artinstituteofchicago' ? searchData.credit_line : searchData.creditline;
            const provenance_text = selectedMuseum.value === 'artinstituteofchicago' ? searchData.provenance_text : searchData.verificationleveldescription;
            const place_of_origin = selectedMuseum.value === 'artinstituteofchicago' ? searchData.place_of_origin : searchData.department;
            const updated_at = selectedMuseum.value === 'artinstituteofchicago' ? searchData.updated_at : searchData.lastupdate;

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
};

const closeSearchItem = () => {
    searchItem.value = null;
};

const reset = () => {
    selectedArtwork.value = null;
};

const addToCollection = async artworkItem => {
    const { data } = await supabase.from('collections').select().eq('user_id', authStore.currentUser?.id);

    if (!data.length) {
        createCollectionModal.value.showModal();
    } else {
        myCollections.value = data;
        selectedArtwork.value = artworkItem;
        addToCollectionModal.value.showModal();
    }
};

const getSelectedMuseum = (reset = false) => {
    if (selectedMuseum.value === 'artinstituteofchicago') {
        getAIOCCollections(1 ?? reset);
    } else {
        getHAMCCollections(1 ?? reset);
    }
};

onMounted(() => {
    getSelectedMuseum();
});
</script>

<template>
    <div class="container px-3">
        <div class="row text-start">
            <div
                v-for="museum in museums"
                :key="museum"
                class="col-md-6"
            >
                <button
                    @click="setMuseum(museum.name)"
                    type="button"
                    :class="[{ 'border-primary': selectedMuseum === museum.name }]"
                    class="text-start px-0 card mb-3"
                >
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img
                                src="@/assets/imgs/gallery.jpg"
                                class="img-fluid rounded-start h-100 object-fit-cover"
                                alt="..."
                            />
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5
                                    :class="[{ 'text-primary': selectedMuseum === museum.name }]"
                                    class="card-title"
                                >
                                    {{ museum.title }}
                                </h5>
                                <p class="card-text">{{ museum.description }}</p>
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </div>

        <div class="input-group mb-3">
            <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="Search for collections, objects or people"
                aria-label="Search for collections, objects or people"
                aria-describedby="basic-addon2"
            />
            <div class="input-group-append">
                <button
                    @click="clearSearch()"
                    class="btn btn-outline-secondary"
                    type="button"
                >
                    Clear
                </button>
            </div>
            <div class="input-group-append">
                <button
                    @click="getSearch()"
                    class="btn btn-outline-primary"
                    type="button"
                    :disabled="searchQuery ? false : true"
                >
                    Search
                </button>
            </div>
        </div>

        <div
            v-if="!dataLoading"
            class="row row-cols-1 row-cols-md-3 g-4"
        >
            <div
                v-for="item in list"
                :key="item"
                class="col"
            >
                <div class="card text-start position-relative h-100">
                    <img
                        :src="item.image"
                        class="object-fit-cover w-100 card-img-top"
                        style="height: 250px"
                        alt="..."
                    />
                    <div class="card-body position-relative">
                        <h5 class="card-title text-start mb-3">{{ item.title }}</h5>

                        <p class="small">Last Updated: {{ moment(item.updated_at).format('DD-MM-YYYY') }}</p>

                        <p
                            class="card-text pb-3 text-start"
                            v-html="$filters.str_limit(item?.description, 150)"
                        ></p>

                        <button
                            type="button"
                            class="btn btn-sm btn-primary m-3 position-absolute bottom-0 start-0"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            @click="getSearchItem(item.id)"
                        >
                            View more...
                        </button>

                        <button
                            v-if="authStore.currentUser?.id"
                            type="button"
                            class="btn btn-sm btn-primary m-3 position-absolute bottom-0 end-0"
                            @click="addToCollection(item)"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <ul
            v-if="!loadMoreLoading"
            class="p-0 mt-5"
            style="list-style: none"
        >
            <li>Showing {{ list.length === 0 ? 0 : pagination.current_page * list.length }} of {{ pagination.total }} results</li>
            <li>Page {{ pagination.current_page }} of {{ pagination.total_pages }} pages</li>
        </ul>

        <div>
            <div v-if="!loadMoreLoading">
                <button
                    v-if="list.length"
                    class="btn btn-primary"
                    @click="selectedMuseum === 'artinstituteofchicago' ? getAIOCCollections(pagination.current_page + 1) : getHAMCCollections(pagination.current_page + 1)"
                    :aria-disabled="pagination.next_url ? false : true"
                >
                    Load More
                </button>
            </div>

            <div v-else>
                <Loader class="mb-2" />
            </div>
        </div>

        <div
            class="modal fade"
            id="exampleModal"
            tabindex="-1"
            data-bs-backdrop="static"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
        >
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div
                    v-if="!modalLoading"
                    class="modal-content"
                >
                    <div class="modal-header">
                        <h1
                            class="modal-title fs-5"
                            id="exampleModalLabel"
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
                            @click="closeSearchItem"
                        >
                            Close
                        </button>
                        <button
                            v-if="authStore.currentUser?.id"
                            type="button"
                            @click="addToCollection(searchItem)"
                            class="btn btn-primary"
                        >
                            +
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

        <CreateCollectionModal ref="createCollectionModal" />
        <AddToCollectionModal
            :collections="myCollections"
            :artwork="selectedArtwork"
            ref="addToCollectionModal"
            @closeModal="reset"
        />
    </div>
</template>

<style scoped></style>

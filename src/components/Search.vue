<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';

const axios: any = inject('axios');
const list = ref([]);
const pagination = ref({});
const search = ref('');
const searchObject = ref(null);

const clearSearch = () => {
    list.value = [];
    pagination.value = {};
    search.value = '';
    getAllArtInstituteOfChicago(1);
};

const getSearch = () => {
    list.value = [];
    pagination.value = {};
    getAllArtInstituteOfChicago(1);
};

const getAllArtInstituteOfChicago = (page = 1) => {
    const url = `https://api.artic.edu/api/v1/artworks/search?q=${search.value}&fields=id,title,image_id,description&limit=12&page=` + page;
    axios
        .get(url, {
            headers: {
                accept: 'application/json',
            },
        })
        .then((response: { data: any }) => {
            const searchData = response.data.data;
            pagination.value = response.data.pagination;

            searchData.forEach(item => {
                list.value.push({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    image: response.data.config.iiif_url + '/' + item.image_id + '/full/843,/0/default.jpg',
                });
            });
        });
};

const triggerObject = (artworkId = null) => {
    axios
        .get('https://api.artic.edu/api/v1/artworks/' + artworkId, {
            headers: {
                accept: 'application/json',
            },
        })
        .then((response: { data: any }) => {
            searchObject.value = response.data.data;
            searchObject.value = {
                id: response.data.data.id,
                title: response.data.data.title,
                description: response.data.data.description,
                image: response.data.config.iiif_url + '/' + response.data.data.image_id + '/full/843,/0/default.jpg',
            };
        });
};

const closeObject = () => {
    searchObject.value = null;
};

onMounted(() => {
    getAllArtInstituteOfChicago();
});
</script>

<template>
    <div class="px-3">
        <div class="input-group mb-3">
            <input
                type="text"
                class="form-control"
                v-model="search"
                placeholder="Search for collections, objects or people"
                aria-label="Search for collections, objects or people"
                aria-describedby="basic-addon2"
            />
            <div class="input-group-append">
                <button
                    @click="clearSearch()"
                    class="btn btn-outline-secondary"
                    type="button"
                    :disabled="search ? false : true"
                >
                    Clear
                </button>
            </div>
            <div class="input-group-append">
                <button
                    @click="getSearch()"
                    class="btn btn-outline-primary"
                    type="button"
                    :disabled="search ? false : true"
                >
                    Search
                </button>
            </div>
        </div>

        <div class="row row-cols-1 row-cols-md-3 g-4">
            <div
                v-for="item in list"
                :key="item"
                class="col"
            >
                <div class="card position-relative h-100">
                    <img
                        :src="item.image"
                        class="object-fit-cover w-100 card-img-top"
                        style="height: 250px"
                        alt="..."
                    />
                    <div class="card-body position-relative">
                        <h5 class="card-title text-start mb-3">{{ item.title }}</h5>
                        <p
                            class="card-text pb-3 text-start"
                            v-html="$filters.str_limit(item?.description, 150)"
                        ></p>

                        <button
                            type="button"
                            class="btn btn-sm btn-primary m-3 position-absolute bottom-0 start-0"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            @click="triggerObject(item.id)"
                        >
                            View more...
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-primary m-3 position-absolute bottom-0 end-0"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                            @click="triggerObject(item.id)"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <ul
            class="mt-5"
            style="list-style: none"
        >
            <li>Showing {{ list.length === 0 ? 0 : pagination.current_page * pagination.limit }} of {{ pagination.total }} results</li>
        </ul>

        <button
            v-if="list.length"
            class="btn btn-primary"
            @click="getAllArtInstituteOfChicago(pagination.current_page + 1)"
            :aria-disabled="pagination.next_url ? false : true"
        >
            Load More
        </button>

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
                    v-if="searchObject?.id"
                    class="modal-content"
                >
                    <div class="modal-header">
                        <h1
                            class="modal-title fs-5"
                            id="exampleModalLabel"
                        >
                            {{ searchObject?.title }}
                        </h1>
                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            @click="closeObject"
                        ></button>
                    </div>
                    <div class="modal-body">
                        <img
                            class="object-fit-cover w-100 h-50"
                            :src="searchObject?.image"
                        />

                        <hr class="featurette-divider" />

                        <div
                            class="text-start mt-3"
                            v-html="searchObject?.description"
                        ></div>

                        <hr class="featurette-divider" />

                        <div></div>
                    </div>
                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn me-auto btn-secondary"
                            data-bs-dismiss="modal"
                            @click="closeObject"
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            class="btn btn-primary"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>

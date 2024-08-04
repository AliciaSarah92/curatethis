<script setup lang="ts">
import { onMounted, ref, defineExpose, defineProps, defineEmits, toRefs } from 'vue';
import { supabase } from '../lib/supabase';
import { Modal } from 'bootstrap';
import { useForm } from 'vee-validate';
import * as Yup from 'yup';
import { useNotification } from '@kyvg/vue3-notification';

const { notify } = useNotification();
const props = defineProps({
    collections: Array,
});
const emits = defineEmits(['closeModal', 'loadBaseViewModal']);
const { collections } = toRefs(props);
const loadBaseViewModal = ref(true);
const artwork = ref({});
const modalEl = ref(null);
const modal = ref(null);

const formSchema = Yup.object({
    collection_id: Yup.string().typeError('Collection is required').required('Collection is required'),
});

const initialValues = {
    collection_id: '',
};

const { handleSubmit, resetForm, meta, errors, handleBlur, handleChange, useFieldModel } = useForm({
    validationSchema: formSchema,
    initialValues: initialValues,
});

const collection_id = useFieldModel('collection_id');

const submitForm = handleSubmit(async formData => {
    console.log(artwork.value.type);
    const artworks = {
        artwork_id: artwork.value.id,
        type: artwork.value.type,
        image: artwork.value.image,
        collection_id: formData.collection_id,
    };

    try {
        const { error } = await supabase.from('artworks').insert(artworks);
        if (error) throw error;

        notify({
            title: 'Success',
            text: 'Artwork successfully add to collection.',
            type: 'success',
        });
    } catch (error) {
        notify({
            title: 'Error',
            text: error,
            type: 'error',
        });
    } finally {
        closeModal();
    }
});

const showModal = () => {
    modal.value.show();
};

const closeModal = () => {
    modal.value.hide();
    resetForm();
    emits('closeModal');

    if (loadBaseViewModal.value) {
        emits('loadBaseViewModal');
    }
};

onMounted(() => {
    modal.value = new Modal(modalEl.value);
});

defineExpose({
    showModal,
    closeModal,
    loadBaseViewModal,
    artwork,
});
</script>

<template>
    <div
        class="modal fade"
        id="addToCollectionModal"
        tabindex="-1"
        data-bs-backdrop="static"
        aria-labelledby="addToCollectionModalLabel"
        aria-hidden="true"
        ref="modalEl"
    >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h1
                        class="modal-title fs-5"
                        id="addToCollectionModalLabel"
                    >
                        Add To Collection
                    </h1>

                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        @click="closeModal"
                    ></button>
                </div>
                <div class="modal-body text-start">
                    <form @submit="submitForm">
                        <div class="input-group my-3">
                            <select
                                class="form-control"
                                placeholder="Collection Name"
                                aria-label="Collection Name"
                                aria-describedby="submit-button"
                                name="collection_id"
                                v-model="collection_id"
                                @input="handleChange"
                                @blur="handleBlur"
                            >
                                <option
                                    selected
                                    disabled
                                    hidden
                                    value=""
                                >
                                    Choose Collection
                                </option>
                                <option
                                    v-for="option in collections"
                                    :key="option"
                                    :value="option?.id"
                                >
                                    {{ option?.name }}
                                </option>
                            </select>

                            <div class="input-group-append">
                                <button
                                    class="btn btn-outline-primary"
                                    type="sumbit"
                                    id="submit-button"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>

                        <p
                            v-show="(errors.collection_id && meta.touched) || (meta.valid && meta.touched)"
                            class="w-100 text-danger"
                        >
                            {{ errors.collection_id }}
                        </p>
                    </form>
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
        </div>
    </div>
</template>

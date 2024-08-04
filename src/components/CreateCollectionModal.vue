<script setup lang="ts">
import { onMounted, ref, defineExpose, defineEmits } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '../lib/supabase';
import { Modal } from 'bootstrap';
import * as Yup from 'yup';
import { useForm } from 'vee-validate';
import { useNotification } from '@kyvg/vue3-notification';

const { notify } = useNotification();
const modalEl = ref(null);
const modal = ref(null);
const authStore = useAuthStore();
const emits = defineEmits(['closeModal', 'loadBaseViewModal']);
const artwork = ref({});
const loadBaseViewModal = ref(true);

const formSchema = Yup.object({
    name: Yup.string().typeError('Name is required').required('Name is required'),
});

const initialValues = {
    name: '',
};

const { handleSubmit, resetForm, meta, errors, handleBlur, handleChange, useFieldModel } = useForm({
    validationSchema: formSchema,
    initialValues: initialValues,
});

const name = useFieldModel('name');

const submitForm = handleSubmit(async formData => {
    const collection = {
        user_id: authStore.currentUser?.id,
        name: formData.name,
    };

    try {
        const { error } = await supabase.from('collections').insert(collection);
        if (error) throw error;

        notify({
            title: 'Success',
            text: 'Collection successfully created.',
            type: 'success',
        });

        if (Object.keys(artwork.value).length) {
            const { data } = await supabase.from('collections').select().eq('user_id', authStore.currentUser?.id).limit(1).single().order('created_at', { ascending: false });

            const artworks = {
                artwork_id: artwork.value.id,
                type: artwork.value.type,
                image: artwork.value.image,
                collection_id: data.id,
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
            }
        }

        emits('closeModal', { status: true });
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
    artwork,
    loadBaseViewModal,
});
</script>

<template>
    <div
        class="modal fade"
        id="createCollectionModal"
        tabindex="-1"
        data-bs-backdrop="static"
        aria-labelledby="createCollectionModalLabel"
        aria-hidden="true"
        ref="modalEl"
    >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h1
                        class="modal-title fs-5"
                        id="createCollectionModalLabel"
                    >
                        Create Collection
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
                            <input
                                class="form-control"
                                placeholder="Collection Name"
                                aria-label="Collection Name"
                                aria-describedby="submit-button"
                                name="name"
                                v-model="name"
                                @input="handleChange"
                                @blur="handleBlur"
                            />
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
                            v-show="(errors.name && meta.touched) || (meta.valid && meta.touched)"
                            class="w-100 text-danger"
                        >
                            {{ errors.name }}
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

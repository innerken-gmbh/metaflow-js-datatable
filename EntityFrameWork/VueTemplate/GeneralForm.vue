<template>
    <v-toolbar
            color="white"
            flat
    >
        <v-spacer/>
        <v-dialog
                v-model="realDialog"
                max-width="500px"
        >
            <template v-slot:activator="{ on }">
                <v-btn
                        class="mb-2"
                        color="primary"
                        dark
                        v-on="on"
                >
                    {{ addText }}
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="headline">{{ title }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form
                            v-model="valid"
                            :lazy-validation="false"
                    >
                        <v-container>
                            <v-row>
                                <template v-for="field in realFormField">
                                    <form-field
                                            :key="field.id"
                                            :field="field"
                                            :current-state="editedIndex"
                                            :edited-item="editedItem"
                                    />
                                </template>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn
                            color="blue darken-1"
                            text
                            @click="close"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                            :disabled="!valid"
                            color="blue darken-1"
                            text
                            @click="save"
                    >
                        Save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-toolbar>
</template>

<script>
    import FormField from './FormField'
    // todo: use input group and extract form field
    export default {
        name: 'GeneralForm',
        components: {FormField},
        props: {
            addText: {
                type: String,
                default: 'Add',
            },
            title: {
                type: String,
                default: 'Form',
            },
            formField: {
                type: Array,
                default: () => [],
            },
            editedItem: {
                type: Object,
                default: () => {
                },
            },
            editedIndex: {
                type: Number,
                default: -1,
            },
            dialog: {
                type: Boolean,
                default: false,
            },
        },
        data: function () {
            return {
                realDialog: this.dialog,
                valid: true,
                realFormField: this.formField.map((i, index) => {
                    return {
                        id: index,
                        ...i,
                    }
                }),
            }
        },
        watch: {
            realDialog(val) {
                val || this.close()
            },
            dialog(val) {
                this.realDialog = val
            },
        },
        methods: {
            close() {
                this.realDialog = false
                this.$emit('change-general-form', false)
            },

            save() {
                this.$emit('change-general-form', true)
            },
        },
    }
</script>

<style scoped>

</style>

<template>

    <v-dialog
        :fullscreen="$vuetify.breakpoint.smAndDown"
        v-model="realDialog"
        scrollable
    >
        <v-card>
            <v-toolbar dense flat color="primary" dark>
                <v-toolbar-title>{{ title }}</v-toolbar-title>
                <v-spacer/>
                <v-btn
                    text
                    @click="close"
                >
                    {{ $t('Cancel') }}
                </v-btn>
                <v-btn
                    text
                    :disabled="!valid"
                    @click="save"
                >
                    {{ $t('Save') }}
                </v-btn>
            </v-toolbar>
            <v-form
                v-model="valid"
                :lazy-validation="false"
            >
                <v-tabs :vertical="$vuetify.breakpoint.mdAndUp">
                    <v-tab>
                        <v-icon left>mdi-menu</v-icon>
                        Required
                    </v-tab>
                    <v-tab>
                        <v-icon left>mdi-dots-vertical</v-icon>
                        Optional
                    </v-tab>
                    <v-tab-item>
                        <v-card flat height="'400px'">
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <template v-for="(field,index) in requiredFields">
                                            <template v-if="field.dataType===IKDataEntity.Types.Group">
                                                <v-col
                                                    :key="'f1'+index"
                                                    cols="12"
                                                >
                                                    <div class="d-flex justify-space-between align-center">
                                                        <span class="subtitle-1 font-weight-bold">{{ $t(''+field.groupName) }}</span>
                                                    </div>
                                                    <v-row>
                                                        <template v-for="(child,i) in field.children">
                                                            <v-col class="py-0" cols="12">
                                <span
                                    class="subtitle-1 grey--text font-weight-bold"
                                >{{$t(editedItem[field.value][i][field.childLabelKey])}}</span>
                                                            </v-col>
                                                            <template v-for="(c,t) in child">
                                                                <v-col :key="field.id+'t'+t+'c'+i" cols="6">
                                                                    <form-field
                                                                        v-if="editedItem[field.value]"
                                                                        :field="c"
                                                                        :current-state="editedIndex"
                                                                        :edited-item="editedItem[field.value][i]"
                                                                    />
                                                                </v-col>
                                                            </template>
                                                        </template>
                                                    </v-row>
                                                </v-col>
                                            </template>
                                            <template v-else>
                                                <v-col :key="'f1'+index" cols="6">
                                                    <form-field
                                                        :field="field"
                                                        :current-state="editedIndex"
                                                        :edited-item="editedItem"
                                                    />
                                                </v-col>
                                            </template>
                                        </template>
                                    </v-row>
                                </v-container>

                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card flat height="'400px'">
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <template v-for="(field,index) in notRequiredFields">
                                            <template v-if="field.dataType===IKDataEntity.Types.Group">
                                                <v-col
                                                    :key="'f2'+index"
                                                    cols="12"
                                                >
                                                    <div class="d-flex justify-space-between align-center">
                                                        <span class="subtitle-1 font-weight-bold">{{ $t(''+field.groupName) }}</span>
                                                    </div>
                                                    <v-row>
                                                        <template v-for="(child,i) in field.children">
                                                            <v-col class="py-0" cols="12">
                                <span
                                    class="subtitle-1 grey--text font-weight-bold"
                                >{{$t(editedItem[field.value][i][field.childLabelKey])}}</span>
                                                            </v-col>
                                                            <template v-for="(c,t) in child">
                                                                <v-col :key="field.id+'t'+t+'c'+i" cols="6">
                                                                    <form-field
                                                                        v-if="editedItem[field.value]"
                                                                        :field="c"
                                                                        :current-state="editedIndex"
                                                                        :edited-item="editedItem[field.value][i]"
                                                                    />
                                                                </v-col>
                                                            </template>
                                                        </template>
                                                    </v-row>
                                                </v-col>
                                            </template>
                                            <template v-else>
                                                <v-col :key="'f2'+index" cols="6">
                                                    <form-field
                                                        :field="field"
                                                        :current-state="editedIndex"
                                                        :edited-item="editedItem"
                                                    />
                                                </v-col>
                                            </template>
                                        </template>
                                    </v-row>
                                </v-container>

                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                </v-tabs>
            </v-form>
        </v-card>
    </v-dialog>

</template>

<script>
    import FormField from './FormField'
    import { IKDataEntity } from 'innerken-utils'

    export default {
        name: 'GeneralForm',
        components: { FormField },
        props: {
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
                tab: null,
                IKDataEntity: IKDataEntity,
            }
        },
        computed: {
            requiredFields: function () {
                return this.formField.filter(f => this.fieldIsRequired(f))
            },
            notRequiredFields: function () {
                return this.formField.filter(f => !this.fieldIsRequired(f))
            },
        },
        watch: {
            realDialog (val) {
                val || this.close()
            },
            dialog: {
                immediate: true,
                handler: function (val) {
                    this.realDialog = val
                },
            },
        },
        methods: {
            fieldIsRequired (field) {
                return field.required && (
                    (field.requiredEdit && this.editedIndex !== -1) ||
                    (field.requiredNew && this.editedIndex === -1))
            },

            close () {
                this.realDialog = false
                this.$emit('change-general-form', false)
            },

            save () {
                this.$emit('change-general-form', true)
            },
        },
    }
</script>

<style scoped>

</style>

<template>
    <v-dialog max-width="600" :fullscreen="$vuetify.breakpoint.mobile" v-model="realDialog" :content-class="title + '-add-dialog'">
        <v-card>
            <v-progress-linear indeterminate v-if="loading"></v-progress-linear>
            <div style="width: 100%" class="pa-6" v-if="editedItem">
                <div class="d-flex align-center mb-8">
                    <v-btn outlined @click="close(false)" class="mr-5 rounded" height="36px" width="36px" tile icon>
                        <v-icon size="24">mdi-arrow-left</v-icon>
                    </v-btn>
                    <div :class="$vuetify.breakpoint.smAndDown ? 'text-h4' : 'text-h3'" class="font-weight-bold">
                        {{ editedIndex === -1 ? $t('new') : $t('edit') + ' ' + '/' }} {{ $t(name) }}
                    </div>
                    <v-spacer></v-spacer>
                  <template v-if="$vuetify.breakpoint.smAndDown">
                    <v-btn
                      :class="title + '-save-button'"
                      :disabled="!valid"
                      :loading="loading"
                      color="green"
                      elevation="10"
                      fixed
                      bottom
                      right
                      fab
                      style="background-color: #4caf50;"
                      @click="save"
                    >
                      <v-icon
                        color="white"
                      >
                        mdi-content-save
                      </v-icon>
                    </v-btn>
                  </template>
                  <template v-else>
                    <v-btn
                      :loading="loading"
                      color="primary"
                      elevation="0"
                      :class="title + '-save-button'"
                      :disabled="!valid"
                      @click="save"
                    >
                      {{ $t('save_change') }}
                    </v-btn>
                    <v-btn
                      :loading="loading"
                      outlined
                      :class="$vuetify.breakpoint.smAndDown ? '' : 'ml-4'"
                      v-if="editedIndex===-1&&showAddMoreButton"
                      elevation="0"
                      class="mt-2"
                      :disabled="!valid"
                      @click="save(false)"
                    >
                      {{ $t('saveAndAdd') }}
                    </v-btn>
                  </template>
                </div>
                <div style="width: 100%">
                    <v-form style="max-width: 100%;" ref="form" v-model="valid" lazy-validation>
                        <div>
                            <div v-if="imageField.length>0">
                                <form-field
                                    :field="imageField[0]"
                                    :current-state="editedIndex"
                                    :edited-item="editedItem"
                                    no-details
                                />
                            </div>
                            <div v-if="groupedFields.length+requiredFields.length+notRequiredFields.length>0" class="flex-grow-1">
                                <v-card outlined height="fit-content" class="pa-4 px-6 my-4">
                                    <template v-for="(field,index) in groupedFields">
                                        <div outlined :key="field.value+index+'group'">
                                            <div class="d-flex flex-wrap align-center">
                                                <div class="text-h4 font-weight-medium">
                                                    {{ $t('' + field.groupName) }}
                                                </div>
                                                <v-spacer/>
                                                <v-tabs
                                                    class="mt-2"
                                                    show-arrows
                                                    color="#232123"
                                                    height="36px"
                                                    v-model="tab"
                                                >
                                                    <v-tab v-for="(child,i) in field.children"
                                                           :key="field.value+'c'+editedItem[field.value][i][field.childLabelKey]+'tab'"
                                                    >
                                                        {{ $t(editedItem[field.value][i][field.childLabelKey].toLowerCase()) }}
                                                        <span class="red--text" v-if="i===0"
                                                        > * </span>
                                                    </v-tab>
                                                </v-tabs>
                                            </div>

                                            <template v-if="!$vuetify.breakpoint.lgAndDown"></template>


                                            <v-tabs-items v-model="tab" class="mt-8">
                                                <v-tab-item v-for="(child,i) in field.children">
                                                    <template v-for="(c,t) in child">
                                                        <div :key="field.id+'t'+t+'c'+i">
                                                            <form-field
                                                                v-if="editedItem[field.value]"
                                                                :field="c"
                                                                :current-state="editedIndex"
                                                                :edited-item="editedItem[field.value][i]"
                                                                :outside-disabled="outsideSettedField.includes(field.value)"
                                                                no-details
                                                            />
                                                        </div>
                                                    </template>
                                                </v-tab-item>
                                            </v-tabs-items>


                                        </div>

                                    </template>
                                    <div v-if="notRequiredFields.length>0">

                                        <template v-for="(field,index) in requiredFields">
                                            <div :key="'f1'+index+field.text"
                                            >
                                                <form-field
                                                    :field="field"
                                                    :current-state="editedIndex"
                                                    :edited-item="editedItem"
                                                    :outside-disabled="outsideSettedField.includes(field.value)"
                                                    no-details
                                                />
                                            </div>
                                        </template>

                                    </div>
                                    <div v-else>
                                        <template v-for="(field,index) in requiredFields">
                                            <div :key="'f1'+index+field.text"
                                            >
                                                <form-field
                                                    :field="field"
                                                    :current-state="editedIndex"
                                                    :edited-item="editedItem"
                                                    :outside-disabled="outsideSettedField.includes(field.value)"
                                                    no-details
                                                />
                                            </div>
                                        </template>
                                    </div>
                                </v-card>
                            </div>
                            <v-card v-if="notRequiredFields.length>0" outlined height="fit-content" class="pa-4 px-6 mt-8">
                                <div class="d-flex  mt-2 ">
                                    <div class="text-h4 font-weight-medium">{{ $t('option_info') }}</div>
                                    <v-spacer></v-spacer>
                                    <v-btn outlined style="border-radius: 8px" icon @click="showOptionalField=!showOptionalField">
                                        <v-icon v-if="!showOptionalField">mdi-chevron-down</v-icon>
                                        <v-icon v-else>mdi-chevron-up</v-icon>
                                    </v-btn>
                                </div>
                                <div class="mt-6" v-if="showOptionalField">
                                    <template v-for="(field,index) in notRequiredFields">
                                        <div :key="'f2'+index" class="my-4">
                                            <form-field
                                                :field="field"
                                                :current-state="editedIndex"
                                                :edited-item="editedItem"
                                                no-details
                                            />
                                        </div>
                                    </template>
                                </div>
                                <div class="mt-6 text-body-2" v-else>
                                    {{ $t('AutoContentNotMandatory') }}<br><br>
                                    <template v-for="(field,index) in notRequiredFields">
                                        <v-chip outlined
                                                @click="showOptionalField=true"
                                                label
                                                :key="'f2'+index"
                                                class="text-body-1 font-weight-bold mb-1 mr-1"
                                        >
                                            {{ $t(field.text) }}
                                            <template v-if="editedItem[field.value]&&field.dataType!==IKDataEntity.Types.Color"> :
                                                {{
                                                    Array.isArray(editedItem[field.value]) ? editedItem[field.value].length + $t(
                                                        'individually') : editedItem[field.value]
                                                }}
                                            </template>
                                        </v-chip>
                                    </template>
                                </div>
                            </v-card>
                        </div>
                    </v-form>
                </div>
            </div>
        </v-card>

    </v-dialog>
</template>

<script>
import FormField from './FormField'
import { IKDataEntity } from '../../index'
import IkDataTable from './IkDataTable'
import NoChainScrollContainer from './Base/NoChainScrollContainer'
import NiceDialog from './Base/NiceDialog'
import IKUtils from 'innerken-js-utils'

export default {
    name: 'GeneralForm',
    components: {
        NiceDialog,
        NoChainScrollContainer,
        FormField,
        IkDataTable,
    },
    props: {
        model: {
            type: Object,
            default: () => {
            },
        },
        title: {
            type: String,
            default: 'Form',
        },
        editedIndex: {
            type: Number,
            default: -1,
        },
        value: {
            type: Boolean,
            default: false,
        },
        outSideProperty: {},
        outSideList: {},
        showAddMoreButton: {
            type: Boolean,
            default: true,
        },
    },

    data: function () {
        return {
            realDialog: null,
            valid: true,
            loading: false,

            tab: null,
            showOptionalField: false,
            formField: [],
            currentList: [],
            IKDataEntity: IKDataEntity,
            defaultItem: null,
            calculateDefaultItem: null,
            editedItem: null,
            keyStore: {},
        }
    },

    computed: {
        requiredFields: function () {
            return this.notGroupedFields.filter(f => this.fieldIsRequired(f))
        },
        notRequiredFields: function () {
            return this.notGroupedFields.filter(f => !this.fieldIsRequired(f))
        },
        groupedFields: function () {
            return this.notImageField.filter(f => f.dataType === IKDataEntity.Types.Group)
        },
        notGroupedFields: function () {
            return this.notImageField.filter(f => f.dataType !== IKDataEntity.Types.Group)
        },
        imageField: function () {
            return this.formField.filter(f => f.dataType === IKDataEntity.Types.Image)
        },
        uniqueField: function () {
            return this.formField.filter(f => f.unique)
        },
        uniqueFieldKeys: function () {
            return this.uniqueField.map(it => it.value)
        },
        notImageField: function () {
            return this.formField.filter(f => f.dataType
                !== IKDataEntity.Types.Image)
        },
        name () {
            return (this?.editedItem?.name ?? this.editedItem?.dishName ?? this.title)
        },
        outsideSettedField: function () {
            return this.outSideProperty ? Object.keys(this.outSideProperty) : []
        },
    },
    watch: {
        value (val) {
            this.realDialog = val
        },
        realDialog (val) {
            if (!val) {
                this.editedItem = false
                this.$emit('input', false)
            } else {
                this.wait(this.editedIndexUpdated)
            }
        },
        editedItem (val) {

        },
        outSideProperty (val) {
            this.resetDefaultItem()
        },
    },
    methods: {
        resetDefaultItem () {
            if (this.outSideProperty) {
                this.defaultItem = Object.assign({}, this.calculateDefaultItem, this.outSideProperty)
            } else {
                this.defaultItem = this.calculateDefaultItem
            }

        },
        findLangEntityInLangArr (lang, arr) {
            return arr.find(d => d.lang.toLowerCase() === lang.toLowerCase()) ?? null
        },

        copyToAll (field, arr) {
            const [de, zh, en] = [
                this.findLangEntityInLangArr('DE', arr),
                this.findLangEntityInLangArr('ZH', arr),
                this.findLangEntityInLangArr('EN', arr),
            ]

            for (const fieldKey of field.childKey) {
                const [deContent, zhContent, enContent] = [de, zh, en].map(it => it[fieldKey])
                const target = deContent || zhContent || enContent

                const empty = [de, zh, en].filter(it => !it[fieldKey])
                for (const key of empty) {
                    key[fieldKey] = target
                }
            }
        },

        fieldIsRequired (field) {
            return field.required && (
                (field.requiredEdit && this.editedIndex !== -1) ||
                (field.requiredNew && this.editedIndex === -1))
        },

        async refreshList () {
            this.currentList = this.outSideList ?? await IKUtils.safeCallFunction(this.model, this.model.getList, true,
                this.outSideProperty)
        },

        async editedIndexUpdated () {
            await this.refreshList()
            if (this.editedIndex === -1) {
                this.resetDefaultItem()
                this.editedItem = IKUtils.deepCopy(this.defaultItem)
            } else {
                this.editedItem = IKUtils.deepCopy(this.currentList[this.editedIndex])
            }
            if (this.uniqueField.length > 0) {
                this.keyStore = {}
                this.keyStore = await this.uniqueField.reduce(async (obj, i) => {
                    const trackingList = i.uniqueTrackingList ? await i.uniqueTrackingList() : this.currentList
                    obj[i.value] = trackingList.map(it => it[i.value]).filter(it => it !== this.editedItem[i.value])
                    return obj
                }, {})
                this.uniqueField.forEach(it => {
                    if (it.extraUniqueCheckFunc) {
                        it.rule.push(
                            val => this.keyStore[it.value] && it.extraUniqueCheckFunc(val, this.keyStore[it.value])
                                || this.$t(it.text) + this.$t('duplicated'))
                    }
                    if (this.keyStore[it.value]) {
                        const uniqueCheck = val => this.keyStore[it.value] && !this.keyStore[it.value].includes(val) || this.$t(
                            it.text) + this.$t('duplicated')
                        it.rule.push(uniqueCheck)
                    }

                })
            }

        },

        async wait (action) {
            this.loading = true
            try {
                await action()
            } catch (e) {

            }
            this.loading = false
        },
        async save (close = true) {
            for (const f of this.groupedFields) {
                this.copyToAll(f, this.editedItem[f.value])
            }
            if (!this.$refs.form.validate()) {
                return
            }
            this.wait(async () => {
                if (this.editedIndex > -1) {
                    const res = await this.updateItem(this.editedItem)
                    IKUtils.toast(this.$t('EditSuccess'))
                    this.close(true, res)
                } else {
                    const res = await IKUtils.safeCallFunction(this.model, this.model.add, this.editedItem)
                    IKUtils.toast(this.$t('addSuccess'))
                    if (close) {
                        this.close(true, res)
                    } else {
                        await this.editedIndexUpdated()
                    }
                }
            })
        },
        close (needRefresh = false, args) {
            this.realDialog = false
            if (needRefresh) {
                this.$emit('need-refresh', args)
            }
        },

        async updateItem (item) {
            return await IKUtils.safeCallFunction(this.model, this.model.edit, item)
        },
    },
    mounted () {
        [, this.formField, this.calculateDefaultItem] = IKDataEntity.parseField(this.model)
        Object.freeze(this.calculateDefaultItem)
        this.resetDefaultItem()

    },
}
</script>

<style scoped>

</style>

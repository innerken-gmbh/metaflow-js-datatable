<template>
    <material-card
            class="px-5 py-3 "
            color="indigo"
            :icon="icon"
            inline
    >
        <template v-slot:after-heading>
            <div class="display-2 font-weight-light">
                {{ entityName }}
            </div>
            <slot name="extra-heading"/>
        </template>
        <v-toolbar
                color="white"
                flat
        >
            <slot :items="items" name="filterLeft"></slot>
            <v-spacer/>
            <slot :items="items" name="filterRight"></slot>
            <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    class="ml-auto"
                    hide-details
                    label="Search"
                    single-line
                    style="max-width: 250px;"
            />
        </v-toolbar>

        <v-divider class="mt-3"/>
        <v-data-table
                :fixed-header="true"
                :headers="realHeaders"
                :items="tableItem"
                :items-per-page="15"
                :loading="loading"
                :search.sync="search"
                multi-sort
        >
            <template
                    v-for="slottedItem in slottedItems"
                    v-slot:[slottedItem.name]="{ item }"
            >
                <slot
                        :name="slottedItem.name"
                        :item="item"
                />
            </template>
            <template
                    v-for="adItem in advancedItems"
                    v-slot:[adItem.name]="{ item }"
            >
                <template
                        v-if="
            adItem.dataType===Types.Image"
                >
                    <img-template
                            :key="adItem.name"
                            :model="adItem.value"
                            :item="item"
                            :root="adItem.type.root()"
                    />
                </template>
                <template
                        v-else-if="
            adItem.dataType===Types.Boolean"
                >
                    <v-checkbox
                            :key="adItem.name"
                            :readonly="true"
                            :input-value="item[adItem.value]"
                            disabled
                    />
                </template>
                <template
                        v-else-if="
            adItem.dataType===Types.Option"
                >
                    <v-chip
                            :key="adItem.name"
                            class="mx-2"
                            label
                    >
                        {{ item[adItem.value] }}
                    </v-chip>
                </template>
            </template>
            <template v-slot:footer>
                <slot name="footer">
                    <general-form
                            :title="entityName"
                            :dialog="dialog"
                            :edited-item="editedItem"
                            :edited-index="editedIndex"
                            :form-field="formField"
                            @change-general-form="dialogChange"
                    />
                </slot>
            </template>
            <template v-slot:no-data>
                <slot name="no-data">
                    <v-btn
                            color="primary"
                            @click="reload"
                    >
                        {{ $t('重新加载') }}
                    </v-btn>
                </slot>
            </template>
            <template v-slot:item.action="{ item }">
                <slot
                        name="item.action"
                        :item="item"
                />
                <template v-if="useDefaultAction">
                    <v-icon
                            class="mr-2"
                            small
                            @click="editItem(item)"
                    >
                        mdi-pencil
                    </v-icon>
                    <v-icon
                            small
                            @click="deleteItem(item)"
                    >
                        mdi-delete
                    </v-icon>
                </template>

            </template>
        </v-data-table>
    </material-card>
</template>

<script>

    import GeneralForm from './GeneralForm'
    import { IKDataEntity, IKUtils } from 'innerken-utils'
    import ImgTemplate from './ImgTemplate'
    import MaterialCard from './MaterialCard'

    export default {
        name: 'IkDataTable',
        components: {
            ImgTemplate,
            GeneralForm,
            MaterialCard,
        },
        props: {
            entityName: {
                type: String,
                default: '',
            },
            filter: {
                type: Object,
                default: () => {
                },
            },
            icon: {
                type: String,
                default: '',
            },
            useAction: {
                type: Boolean,
                default: true,
            },
            useDefaultAction: {
                type: Boolean,
                default: true,
            },
            model: {
                type: Object,
                default: () => {
                },
            },
        },
        watch: {
            filter: {
                immediate: true,
                handler (val) {
                    this.reload()
                },
            },
            items: {
                handler: function (val) {
                    this.renderTableItems()
                },
            },
        },
        data: function () {
            return {
                Types: IKDataEntity.Types,
                search: '',
                loading: false,
                items: [],
                dialog: false,
                headers: [],
                formField: [],
                editedIndex: -1,
                editedItem: null,
                defaultItem: null,
                tableItem: [],
            }
        },
        computed: {

            realHeaders: function () {
                return this.headers.map(item => {
                    item.text = this.$i18n.t(item.text)
                    return item
                })
            },

            advancedItems: function () {
                return this.headers
                    .filter(item => [IKDataEntity.Types.Image, IKDataEntity.Types.Boolean, IKDataEntity.Types.Option].includes(item.dataType))
                    .map(item => {
                        return {
                            ...item,
                            name: 'item.' + item.value,
                        }
                    })
            },

            slottedItems: function () {
                return this.headers
                    .filter(item => item.overwrite)
                    .map(item => {
                        return {
                            ...item,
                            name: 'item.' + item.value,
                        }
                    })
            },
        },
        created () {
            [this.headers, this.formField, this.defaultItem] = IKDataEntity.parseField(this.model)
            if (this.useAction) {
                this.headers.push({
                    text: 'action',
                    value: 'action',
                })
            }
            this.editedItem = IKUtils.deepCopy(this.defaultItem)
            this.reload().catch(() => {
                this.loading = false
                this.items = []
            })

        },
        methods: {

            dialogChange (save) {
                if (save) {
                    this.save()
                } else {
                    this.closeDialog()
                }
            },

            async renderTableItems () {
                const options = this.advancedItems.filter(item => item.dataType === IKDataEntity.Types.Option)
                for (const opt of options) {
                    for (const item of this.items) {
                        item[opt.value] = await this.adItemList(opt, IKUtils.deepCopy(item))
                    }
                }
                this.tableItem = this.items
                return this.items
            },

            adItemList: async function (adItem, item) {

                const list = typeof adItem.type.selectItems === 'function' ?
                    await IKUtils.safeCallFunction(this.model, adItem.type.selectItems) :
                    adItem.type.selectItems
                return list.find(t => t[adItem.type.itemValue] == item[adItem.value])[adItem.type.itemText]
            },

            closeDialog () {
                console.log('should close dialog')
                this.editedItem = IKUtils.deepCopy(this.defaultItem)
                this.editedIndex = -1
                this.dialog = false
                this.reload()
            },

            save () {
                if (this.editedIndex > -1) {
                    IKUtils.safeCallFunction(this.model, this.model.edit, this.editedItem).then(() => {
                        IKUtils.toast(this.$i18n.t('编辑成功'))
                        this.closeDialog()
                    })
                } else {
                    IKUtils.safeCallFunction(this.model, this.model.add, this.editedItem).then(() => {
                        IKUtils.toast(this.$i18n.t('添加成功'))
                        this.closeDialog()
                    })
                }
            },

            deleteItem (item) {
                IKUtils.showConfirm(
                    this.$i18n.t('Are you sure?'),
                    this.$i18n.t('you want to delete this item?'), () => {
                        IKUtils.safeCallFunction(this.model, this.model.remove, item.id)
                            .then(() => {
                                IKUtils.toast(this.$i18n.t('删除成功'))
                                this.reload()
                            })
                    },
                )
            },

            editItem (item) {
                // console.log(item)
                this.editedIndex = this.items.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialog = true
            },

            async reload () {
                const model = this.model
                this.loading = true
                this.items = await IKUtils.safeCallFunction(model, model.getList, true, this.filter)
                this.loading = false
                // console.log(this.items)
            },
        },
    }
</script>

<style scoped>

</style>

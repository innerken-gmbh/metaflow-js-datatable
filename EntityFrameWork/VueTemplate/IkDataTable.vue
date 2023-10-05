<template>
    <div style="position: relative">
        <div class="d-flex " v-if="showTitle">
            <div
                style="width:100%"
                class="d-flex align-center"
                :class="!$vuetify.breakpoint.lgAndUp? 'pb-4' : 'py-4 pb-6'"
            >
                <slot name="navigation"></slot>
                <span
                    class="font-weight-bold text-truncate"
                    :class="$vuetify.breakpoint.lgAndUp? 'text-h2 ' : 'text-h3'"
                >
          {{ $t(entityName) || model.name() }}
        </span>
                <v-spacer></v-spacer>
                <slot v-if="mobileView" name="primaryButton">
                    <v-btn
                        color="primary lighten-4 black--text"
                        v-if="useDefaultAction && useAddAction"
                        elevation="0"
                        :class="entityName + '-add-button'"
                        @click="addItem"
                    >
                        <div
                            class="d-flex align-center"
                        >
                            <v-icon
                                left
                            >
                                mdi-plus-circle-outline
                            </v-icon>
                            {{ $t(entityName) }}
                        </div>
                    </v-btn>
                </slot>
            </div>
        </div>
        <template v-if="!mobileView">
            <div
                :class="!$vuetify.breakpoint.lgAndUp ? 'flex-wrap' : ''"
                class="d-flex filterBar align-center mb-6"
            >
                <div style="display: grid;grid-auto-flow: column;grid-gap: 8px">
                    <span v-if="!showTitle" class="text-h3 font-weight-bold">{{ $t(entityName) || model.name() }}</span>
                    <slot name="primaryButton">
                        <v-btn
                            :class="entityName + '-add-button'"
                            color="primary lighten-4 black--text"
                            v-if="useDefaultAction && useAddAction"
                            elevation="0"
                            @click="addItem"
                        >
                            <div
                                class="d-flex align-center"
                            >
                                <v-icon
                                    left
                                >
                                    mdi-plus-circle-outline
                                </v-icon>
                                {{ $t(entityName) }}
                            </div>
                        </v-btn>
                    </slot>

                    <slot
                        :items="items"
                        :selectItems="selectedItems"
                        :tableItems="tableItem"
                        :dateTime="dates"
                        name="footer"
                    />
                </div>


                <v-spacer/>

                <div class="d-flex ma-0 ml-2 align-center">
                    <div style="height: 100%;" class="d-flex align-center mr-2 flex-grow-1 flex-shrink-1">
                        <v-text-field
                            class="white"
                            v-model="search"
                            prepend-inner-icon="mdi-magnify"
                            outlined
                            dense
                            hide-details
                            clearable
                            :label="$t('search')"
                            single-line
                            style="min-width: 150px"
                            :style="!$vuetify.breakpoint.lgAndUp ? 'max-width: 165px;' : ''"
                        />
                    </div>
                    <v-btn v-if="mergableFields.length>0"
                           outlined
                           @click="showFilter=true"
                           icon
                           style="background: white"
                    >
                        <v-icon>mdi-filter-outline</v-icon>
                    </v-btn>

                    <v-btn
                        v-if="canMassEdit&&selectedItems.length>0"
                        @click="startMassEdit" class="ml-2" style="background: white; position: relative"
                        outlined
                    >
                        <v-icon style="position: relative" left>mdi-format-list-checks</v-icon>
                        <template v-if="$vuetify.breakpoint.mdAndUp">
                            <div
                                :style="$vuetify.breakpoint.mdAndDown ? 'max-width: 80px !important;' : '' && !$vuetify.breakpoint.lgAndUp ? 'max-width: 90px;' : ''"
                                class="text-truncate" style="position: relative"
                            >
                                {{ $t('Batch') }}
                            </div>
                        </template>
                    </v-btn>
                </div>

                <slot
                    :items="items"
                    :selectItems="selectedItems"
                    :tableItems="tableItem"
                    :dateTime="dates"
                    name="right"
                />

                <template v-if="useDateFilter">
                    <div style="max-width: 300px; height: 54px;"
                         class="d-flex align-center"
                    >
                        <v-btn @click="datePickerMenu=true"
                               :style="$vuetify.breakpoint.mdAndUp ? 'background: white' : 'background: transparent'"
                               elevation="0"
                               :icon="!$vuetify.breakpoint.mdAndUp"
                               outlined
                        >
                            <v-icon left>mdi-calendar</v-icon>
                            <template v-if="$vuetify.breakpoint.mdAndUp">
                                {{ getNiceLabel(dates) }}
                            </template>
                        </v-btn>
                    </div>
                </template>

            </div>
            <div class="mb-2 mt-n4" v-if="filterDisplayChips.length>0">
                <v-chip :key="item.key" @click="()=>$delete(filterItem,item.key)"
                        label close
                        @click:close="$delete(filterItem,item.key)"
                        class="mr-2"
                        v-for="item in filterDisplayChips"
                >
            <span class="mr-1">
                {{ $t(item.name) }}:
            </span>
                    {{ $t(item.value) }}
                </v-chip>
            </div>
        </template>
        <template v-else>
            <v-app-bar
                dense
                bottom
                app
                class="paReset"
            >
                <div style="display: grid;grid-auto-flow: column;grid-gap: 8px;grid-auto-columns: max-content;
                overflow-x: scroll"
                >
                    <slot
                        :items="items"
                        :selectItems="selectedItems"
                        :tableItems="tableItem"
                        :dateTime="dates"
                        name="footer"
                    />
                    <v-btn
                        small
                        :color="filterDisplayChips.length>0?'primary lighten-4 black--text':''"
                        @click="showFilter=true"
                        v-if="mergableFields.length>0"
                        :outlined="filterDisplayChips.length===0"
                    >
                        <v-icon
                            :color="filterDisplayChips.length>0?'black':''"
                            left
                        >mdi-filter-outline
                        </v-icon>
                        <div class="text-caption">
                            {{ $t('Filter') }}
                        </div>
                        <v-icon
                            :color="filterDisplayChips.length>0?'black':''"
                            v-if="filterDisplayChips.length>0"
                            right
                            @click.stop="filterItem={}"
                        >mdi-close-circle
                        </v-icon>
                    </v-btn>
                    <v-btn
                        small
                        outlined
                        v-if="canMassEdit&&selectedItems.length>0"
                        @click="startMassEdit"

                    >
                        <v-icon>mdi-format-list-checks</v-icon>
                        <div class="text-caption">
                            {{ $t('Batch') }}
                        </div>
                    </v-btn>
                    <slot
                        :items="items"
                        :selectItems="selectedItems"
                        :tableItems="tableItem"
                        :dateTime="dates"
                        name="right"
                    />
                    <template v-if="useDateFilter">

                        <v-btn @click="datePickerMenu=true"
                               :style="$vuetify.breakpoint.mdAndUp ? 'background: white' : ''"
                               elevation="0"
                               :small="$vuetify.breakpoint.mobile"
                               outlined
                        >
                            <v-icon left>mdi-calendar</v-icon>
                            {{ getNiceLabel(dates) }}
                        </v-btn>
                    </template>
                </div>
            </v-app-bar>
        </template>

        <div
            class="d-flex filterBar align-center"
            :class="{'flex-wrap' : !$vuetify.breakpoint.lgAndUp}"
        >
            <slot
                :items="items"
                :selectItems="selectedItems"
                :tableItems="tableItem"
                :dateTime="dates"
                name="topOnTable"
            />
        </div>

        <template v-if="realCategoryList.length>0">
            <v-tabs
                v-model="activeCategoryFilterIndex"
                show-arrows
                style="background: transparent;"
            >
                <v-tab v-for="c in realCategoryList" :key="c.id">{{ c.name }}
                </v-tab>
            </v-tabs>
            <v-divider></v-divider>
        </template>

        <v-card>
            <div
                v-if="mobileView"
                class="pa-2"
            >
                <v-text-field
                    v-model="search"
                    prepend-inner-icon="mdi-magnify"
                    outlined
                    background-color="transparent"
                    dense
                    rounded
                    hide-details
                    clearable
                    :label="$t('search')"
                    single-line
                />
                <v-divider class="my-2"></v-divider>
            </div>
            <v-data-table
                :mobile-breakpoint="20"
                :headers="realHeaders"
                :class="$vuetify.breakpoint.mdAndDown ? 'tableContainerReset' : ''"
                :items="tableItem"
                :loading="loading"
                v-model="selectedItems"
                :show-select="canMassEdit"
                :search.sync="search"
                @update:page="pageUpdate"
                :items-per-page="30"
                :footer-props="{itemsPerPageOptions:[30,50,-1]}"
                :disable-sort="mobileView"
                @click:row.self="editItem"
                :item-class="getItemClass"
            >
                <template #item.action="{item}">
                    <v-menu close-on-content-click rounded left offset-y offset-overflow>
                        <template #activator="{on,attrs}">
                            <v-btn v-on="on" v-bind="attrs" :outlined="$vuetify.breakpoint.mdAndDown"
                                   style="border-radius: 12px"
                                   large icon width="40px" height="40px" class="ma-auto mr-0 pa-0"
                            >
                                <v-icon>mdi-dots-vertical</v-icon>
                            </v-btn>
                        </template>
                        <v-list width="200px" outlined>
                            <v-list-item-group>
                                <v-list-item @click="editItem(item)">
                                    <v-list-item-title>{{ $t('edit') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="useDeleteAction" @click="deleteItem(item)">
                                    <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                                </v-list-item>
                                <slot name="item.action" :item="item"></slot>
                            </v-list-item-group>
                        </v-list>
                    </v-menu>

                </template>
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
                        v-else-if="adItem.dataType===Types.Group"
                    >
                        <div
                            v-bind:key="'_'+adItem.value+c"
                            v-for="(c) in adItem.childKey.filter(adItem.displayChild)"
                        >
                            {{ item['_' + adItem.value + c] }}
                        </div>
                    </template>

                    <template
                        v-else-if="
              adItem.dataType===Types.Boolean"
                    >
                        <div style="width: min-content">
                            <v-simple-checkbox
                                :value="!!item[adItem.value]"
                                dense
                                color="primary"
                                @click="toggleProperty(item,adItem.value)"
                                :key="adItem.name"
                            />
                        </div>

                    </template>

                    <template
                        v-else-if="
            adItem.dataType===Types.Color"
                    >
                        <v-chip
                            :key="adItem.name"
                            :color="item[adItem.value]"
                            label
                            :style="swatchStyle"
                        />
                    </template>
                    <template
                        v-else-if="
            adItem.dataType===Types.Option"
                    >
                        <div class="d-flex">
                            <template v-for="(value,i) in [item[adItem.value]].flat().splice(0,2)">
                                <div :key="value+'.'+i">
                                    <template v-if="adItem.type.color">
                 <span
                     class="pa-1 px-3 mr-1 white--text rounded-pill text-no-wrap"
                     :class="
                       adItem.type.color
                     .find(c=>{return parseInt(value)===c.id}).color"
                 >
              {{ [item['opt' + adItem.value]].flat()[i] }}
              </span>
                                    </template>
                                    <template v-else>
                                        <span> {{ [item['opt' + adItem.value]].flat()[i] }}</span>

                                    </template>
                                </div>
                            </template>
                            <template v-if="[item[adItem.value]].flat().length>2">
                                (+{{ [item[adItem.value]].flat().length - 2 }})
                            </template>


                        </div>

                    </template>
                    <template
                        v-else-if="
            adItem.dataType===Types.Date"
                    >
                        <div>{{ item[adItem.value] | beautifulTime }}</div>

                    </template>
                    <template
                        v-else-if="
            adItem.dataType===Types.Float"
                    >
                        <price-table-display :price="item[adItem.value]"/>
                    </template>
                </template>
                <template v-slot:no-data>
                    <slot name="no-data">
                        <div style="width: 100%;height: 400px" class="d-flex flex-column justify-center align-center">
                            <v-icon x-large>mdi-emoticon-dead</v-icon>
                            <div class="mt-4 text-body-1">
                                {{ $t('CurrentlyNoData') }}
                            </div>
                            <v-btn
                                elevation="0"
                                class="mt-4"
                                color="primary lighten-4 black--text"
                                @click="reload"
                            >
                                {{ $t('reload') }}
                            </v-btn>
                        </div>
                    </slot>
                </template>

                <template v-slot:expanded-item="{ item }">
                    <td :colspan="headers.length">
                        <slot
                            name="expanded-item"
                            :item="item"
                        />
                    </td>
                </template>
            </v-data-table>
        </v-card>
        <general-form
            ref="gf"
            :title="entityName"
            v-model="dialog"
            :edited-index="editedIndex"
            :model="model"
            :use-delete-action="useDefaultAction&&useDeleteAction"
            @need-refresh="reload"
            :out-side-list="tableItem"
            :out-side-property="fixedFilter"
        />
        <v-dialog max-width="400px" v-model="datePickerMenu">
            <v-card @click="datePickerMenu=false" color="#efefef" class="pa-2">
                <date-range-picker v-model="dates"></date-range-picker>
            </v-card>
        </v-dialog>


        <v-dialog
            :fullscreen="$vuetify.breakpoint.mobile"
            v-model="showMultipleEditDialog"
            max-width="600px"
        >
            <v-card tile>

                <div class="pa-4">
                    <div v-if="massEditStep===0">
                        <div>

                            <div @click="showMultipleEditDialog=false" class="text-h4 mb-4 mt-2 d-flex align-center">
                                <v-icon left>mdi-arrow-left</v-icon>
                                <div class="text-h4">
                                    {{ $t('BatchEditTitle') }}
                                </div>
                            </div>
                            <div>
                                <v-tabs grow color="primary darken-2">
                                    <v-tab @click="changeOperationMode(0)"> {{ $t('BatchOverwrite') }}</v-tab>
                                    <v-tab @click="changeOperationMode(1)"
                                           v-if="addableFields.length>0"
                                    > {{ $t('BatchInclude') }}
                                    </v-tab>
                                    <v-tab @click="changeOperationMode(2)"> {{ $t('BatchDelete') }}</v-tab>
                                </v-tabs>
                            </div>
                            <div class="pa-2">
                                <div class="text-body-2 text--secondary mt-2 d-flex align-start">
                                    <v-icon class="mr-2" small>mdi-help-circle</v-icon>
                                    <div>
                                        <template v-if="operationMode===0">
                                            {{ $t('BatchApplySetAttributesToElements') }}
                                        </template>
                                        <template v-if="operationMode===1">
                                            {{ $t('BatchAddAttributeHint') }}
                                        </template>
                                        <template v-if="operationMode===2">
                                            {{ $t('PermanentlyDeleteSelectedItems') }}
                                        </template>
                                    </div>

                                </div>

                                <div class="mt-4">
                                    <template v-if="operationMode===1">
                                        <div class="mb-4 d-flex align-center text-body-1"
                                             style="position: sticky;top: 0;z-index: 1"
                                        >
                                            {{ $t('ChooseAttributes') }}
                                        </div>
                                        <div
                                            style="max-height: 400px; overflow-y: scroll;overscroll-behavior: contain;"
                                        >
                                            <template v-for="(field) in addableFields">
                                                <div :key="field.value">
                                                    <form-field
                                                        :hide-select="true"
                                                        :field="field"
                                                        :edited-item="targetItem"
                                                    />
                                                </div>
                                            </template>
                                        </div>

                                    </template>
                                    <template v-if="operationMode===0">
                                        <div class="mb-4 d-flex align-center"
                                             style="position: sticky;top: 0;z-index: 1"
                                        >
                                            {{ $t('ChooseProperties') }}
                                        </div>
                                        <div
                                            style="max-height: 400px; overflow-y: scroll;overscroll-behavior: contain;"
                                        >
                                            <template v-for="(field) in editableFields">
                                                <div :key="field.value">
                                                    <form-field
                                                        :hide-select="true"
                                                        :field="field"
                                                        :edited-item="targetItem"
                                                    />
                                                </div>
                                            </template>
                                        </div>
                                    </template>
                                    <template v-if="operationMode===2">
                                        <div>
                                            <div class="text-body-1">
                                                {{ $t('OnceDeletedCannotRecovered') }}
                                            </div>
                                            <div class="mt-2 text-body-2">
                                                {{ $t('PleaseConfirmSelectedItemsDeleted') }}
                                            </div>
                                        </div>
                                    </template>

                                </div>
                                <div class="mt-4 text-body-2 mb-4">{{ $t('CurrentSelected') }}：{{
                                        selectedItems.length + ' ' + $t('Pice')
                                    }}
                                </div>
                                <v-card
                                    elevation="0"
                                    style="border-radius: 12px"
                                    @click="massiveEdit(operationMode)"
                                    color="primary lighten-4 black--text"
                                    class="d-flex align-center justify-center pa-4 pr-0 mt-auto mb-0"
                                >
                                    <div>
                                        <template v-if="operationMode===1">
                                            {{ $t('BatchInclude') }}
                                        </template>
                                        <template v-if="operationMode===0">
                                            {{ $t('BatchOverwrite') }}
                                        </template>
                                        <template v-if="operationMode===2">
                                            {{ $t('IrrevocablyDelete') }}
                                        </template>

                                    </div>
                                </v-card>
                            </div>


                        </div>
                    </div>
                    <v-card flat v-else min-height="400">
                        <div v-if="massLoading" style="height: 600px"
                             class="d-flex justify-center align-center"
                        >
                            <v-progress-circular indeterminate></v-progress-circular>
                        </div>
                        <div style="height: 600px"
                             class="d-flex flex-column justify-center align-center"
                             v-else
                        >
                            <div class="text-h3">
                                {{ $t('BatchComplete') }}
                            </div>
                            <div class="mt-4">
                                <template v-if="$i18n.locale === 'zh'">
                                    {{
                                        '操作结果：' + '' + progress + '个成功。 共操作了' + maxProgress + ', 其中失败了' + (maxProgress - progress) + '个'
                                    }}
                                </template>
                                <template v-else>
                                    {{
                                        $t('BatchResult') + ': ' + $t('BatchSuccess') + ' ' + progress + ' ' + $t(
                                            'from') + ' ' + maxProgress + ' ' + $t('Pice') + ', ' + $t(
                                            'BatchFailed') + ' ' + (maxProgress - progress) + ' ' + $t('Pice')
                                    }}
                                </template>
                            </div>
                            <div class="mt-4">
                                <v-btn elevation="0" color="primary lighten-4 black--text"
                                       min-width="120"
                                       @click="showMultipleEditDialog=false">
                                    <v-icon left>mdi-check</v-icon>
                                    {{ $t('Finish') }}
                                </v-btn>
                            </div>

                        </div>
                    </v-card>
                </div>

            </v-card>

        </v-dialog>

        <v-dialog v-model="showFilter" max-width="300px">

            <v-card class="pa-4">
                <template>
                    <template v-for="(field) in mergableFields">
                        <div :key="field.value" style="height: 100%" class="mr-2">
                            <form-field
                                :hide-select="true"
                                :field="field"
                                :edited-item="filterItem"
                            />
                        </div>
                    </template>
                </template>
                <v-btn elevation="0" @click="showFilter=false" block color="primary">{{ $t('Determine') }}</v-btn>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import GeneralForm from './GeneralForm'
import ImgTemplate from './Base/ImgTemplate'
import FormField from './FormField'
import { IKDataEntity } from '../../index'
import IKUtils from 'innerken-js-utils'
import { groupBy } from 'lodash'
import DateRangePicker from './Base/DateRangePicker'
import PriceTableDisplay from './Base/PriceTableDisplay'
import { getNiceLabel } from '../DateRepository'
import NoChainScrollContainer from './Base/NoChainScrollContainer.vue'
import { Ripple } from 'vuetify/lib/directives'
import HorizontalList from './InK/HorizontalList.vue'

import { uniqBy } from 'lodash-es'

function key (model) {
    return Object.keys(model).join('/')
}

function getStorageMassEdit (model) {
    try {
        return JSON.parse(localStorage.getItem(key(model))) ?? []
    } catch (e) {
        return []
    }
}

function setMassEditSet (model, idSet, name) {
    const current = getStorageMassEdit(model)
    current.unshift({
        idSet,
        name,
    })
    if (current.length > 6) {
        current.pop()
    }
    localStorage.setItem(key(model), JSON.stringify(current))
    return getStorageMassEdit(model)
}

export default {
    name: 'IkDataTable',
    components: {
        HorizontalList,
        PriceTableDisplay,
        DateRangePicker,
        ImgTemplate,
        GeneralForm,
        FormField,
        NoChainScrollContainer,
    },
    directives: {
        Ripple,
    },
    props: {
        model: {
            type: Object,
            default: () => {
            },
        },
        addText: {
            type: String,
            default: 'Add',
        },
        entityName: {
            type: String,
            default: '',
        },
        filter: {
            type: [Object, Function],
            default: () => {
            },
        },
        icon: {
            type: String,
            default: '',
        },
        showExpand: {
            type: Boolean,
            default: false,
        },
        singleExpand: {
            type: Boolean,
            default: false,
        },

        useSelect: {
            type: Boolean,
            default: true,
        },
        useAddFilter: {
            type: Boolean,
            default: true,
        },
        useDateFilter: {
            type: Boolean,
            default: false,
        },

        useDefaultAction: {
            type: Boolean,
            default: true,
        },
        useEditAction: {
            type: Boolean,
            default: true,
        },
        useDeleteAction: {
            type: Boolean,
            default: true,
        },

        useCustomAction: {
            type: Boolean,
            default: false,
        },
        useAddAction: {
            type: Boolean,
            default: true,
        },

        requiredDateValue: {},
        hideSelectedAction: {
            type: Boolean,
            default: false,
        },
        customOnRowClick: {},
        fixedFilter: {},
        showTitle: {
            default: true,
        },
        categoryList: {},
        categoryFilterFunc: {},

    },
    watch: {
        realFilter: {
            handler () {
                this.reload()
            },
        },
        requiredDateValue: {
            immediate: true,
            handler: function (val) {
                if (val?.length === 2 || val?.length === 1) {
                    this.dates = val
                }
            },
        },
        activeCategoryFilterIndex (val) {
            this.$emit('index-update', val, this.realCategoryList)
        },
    },
    data: function () {
        return {
            page: 1,
            filterItem: {},
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
            advancedItems: [],
            slottedItems: [],
            datePickerMenu: false,
            dates: null,
            formDisc: {},
            showFilter: false,
            activeCategoryFilterIndex: '',

            showMultipleEditDialog: false,
            lastClickItemId: null,
            selectedItems: [],
            targetItem: {},
            searchItem: {},
            massEditSearch: '',
            massEditStep: 0,
            operationMode: 0,
            massLoading: false,
            progress: 0,
            maxProgress: 0,
        }
    },
    computed: {
        okDates () {
            return this.dates
        },
        realFilter () {
            const res = this.filter ?? {}
            if (this.okDates) {
                res.dateFilter = this.okDates
            }
            return res
        },
        swatchStyle () {
            return {
                cursor: 'pointer',
                height: '30px',
                width: '30px',
                borderStyle: 'solid',
                borderColor: '#c1c1c1',
                borderWidth: '1px',
                transition: 'border-radius 200ms ease-in-out',
            }
        },
        editableFields: function () {
            const res = uniqBy([this.formField, this.headers].flat(), 'value')
                .filter(item =>
                    [IKDataEntity.Types.Boolean, IKDataEntity.Types.Option].includes(item.dataType))
                .filter(item => item.editable)
                .map(item => {
                    return {
                        ...item,
                        name: 'item.' + item.value,
                    }
                })
            return res
        },
        mergableFields: function () {
            const res = uniqBy([this.formField, this.headers].flat(), 'value')
                .filter(item =>
                    [IKDataEntity.Types.Boolean, IKDataEntity.Types.Option].includes(item.dataType))
                .filter(item => item.merge)
                .map(item => {
                    return {
                        ...item,
                        name: 'item.' + item.value,
                    }
                })
            return res
        },
        addableFields: function () {
            const res = this.formField
                .filter(item => [IKDataEntity.Types.Boolean, IKDataEntity.Types.Option].includes(item.dataType))
                .filter(item => {
                    return item.merge && item.type?.multiple
                })
                .map(item => {
                    return {
                        ...item,
                        name: 'item.' + item.value,
                    }
                })
            return res
        },
        canMassEdit: function () {
            return this.editableFields.length > 0 && this.useDefaultAction
        },
        filteredEditItem: function () {
            let target = this.items
            if (this.searchItem) {
                target = target.filter(i => {
                    return Object.keys(this.searchItem).filter(k => this.searchItem[k] != null).every(
                        t => {
                            const org = i[t]
                            const oth = this.searchItem[t]
                            return org == oth || (Array.isArray(org) && (org.includes(oth) || (Array.isArray(oth) && oth.every(
                                ot => org.includes(ot)))))
                        })
                }).filter(it => {
                    return !this.massEditSearch || Object.values(it).some(that => (that + '').toLowerCase()
                        .includes(this.massEditSearch.toLowerCase()))
                })
            }
            return target
        },
        tableItem: function () {
            let target = this.items
            if (this.filterItem && !this.showFilter) {
                target = target.filter(i => {
                    return Object.keys(this.filterItem).filter(k => this.filterItem[k] != null).every(
                        t => {
                            const org = i[t]
                            const oth = this.filterItem[t]
                            return org == oth || (Array.isArray(org) && (org.includes(oth) || (Array.isArray(oth) && oth.every(
                                ot => org.includes(ot)))))
                        })
                })
            }
            if (this.activeCategoryFilterIndex > 0 && this.categoryList && this.categoryFilterFunc) {
                target = target.filter(
                    it => this.categoryFilterFunc(it, this.realCategoryList[this.activeCategoryFilterIndex]))
            }
            return target
        },
        realCategoryList () {
            return this.categoryList ? [
                {
                    id: -1,
                    name: this.$t('all'),
                }, ...this.categoryList,
            ] : []
        },
        filterDisplayChips: function () {
            const keys = !this.showFilter ? Object.keys(this.filterItem) : []

            return keys.filter(k => (
                    !this.fixedFilter || !Object.keys(this.fixedFilter).includes(k))
                && [this.filterItem[k]].flat().length > 0)
                .map((k) => {
                    const field = this.formDisc[k]

                    if (field?.dataType === IKDataEntity.Types.Option) {
                        const selectionGroup = groupBy(field.type?._selectItems ?? field.type.selectItems, field.type.itemValue)

                        if (selectionGroup) {
                            return {
                                key: k,
                                name: field.text,
                                value: [this.filterItem[k]].flat().map(t => selectionGroup[t][0][field.type.itemText]).join(', '),
                            }
                        } else {
                            return {
                                key: k,
                                name: field.text,
                                value: [this.filterItem[k]].flat().join(','),
                            }
                        }

                    } else if (field?.dataType === IKDataEntity.Types.Boolean) {
                        const selectionGroup = groupBy(field.type._selectItems, field.type.itemValue)
                        return {
                            key: k,
                            name: field.text,
                            value: this.filterItem[k] ? 'Yes' : 'No',
                        }
                    }
                })
        },
        realHeaders () {
            return this.headers.filter(it => !it.onlyAction).map(item => {
                item.text = this.$i18n.t(item.text)
                return item
            })
        },
        mobileView () {
            return this.$vuetify.breakpoint.mobile
        },
    },
    mounted () {
        [this.headers, this.formField, this.defaultItem] = IKDataEntity.parseField(this.model)
        this.formDisc = _.keyBy([this.formField, this.headers].flat(), 'value')

        if (this.useCustomAction || this.useDefaultAction &&
            (this.useEditAction || this.useDeleteAction)) {
            this.headers.push({
                text: ' ',
                width: '60px',
                value: 'action',
                sortable: false,
            })
        }

        if (this.fixedFilter) {
            this.defaultItem = Object.assign({}, this.defaultItem, this.fixedFilter)
        }

        this.advancedItems = this.getAdvancedItems()
        this.slottedItems = this.getSlottedItems()
        this.editedItem = IKUtils.deepCopy(this.defaultItem)
        this.filterItem = IKUtils.deepCopy(this.fixedFilter ?? {})
        this.reload().catch(() => {
            this.loading = false
            this.items = []
        })
    },
    methods: {
        getItemClass (item) {
            const disabled = this.model.rowDisableFunction ? this.model.rowDisableFunction(item) : false
            let classString = item?.id === this.lastClickItemId ? 'grey lighten-4' : ''
            return classString + (disabled ? ' disabled' : '')
        },
        getNiceLabel,

        getAdvancedItems: function () {
            return this.headers
                .filter(item => [
                    IKDataEntity.Types.Image, IKDataEntity.Types.Boolean,
                    IKDataEntity.Types.Date,
                    IKDataEntity.Types.Option, IKDataEntity.Types.Group,
                    IKDataEntity.Types.Color, IKDataEntity.Types.Float,
                ].includes(item.dataType) && !item.overwrite)
                .map(item => {
                    return {
                        ...item,
                        name: 'item.' + item.value,
                    }
                })
        },
        getSlottedItems: function () {
            return this.headers
                .filter(item => item.overwrite)
                .map(item => {
                    return {
                        ...item,
                        name: 'item.' + item.value,
                    }
                })
        },

        async toggleProperty (item, key) {
            const _item = IKUtils.deepCopy(item)
            _item[key] = !_item[key]
            await this.updateItem(_item)
            IKUtils.toast(this.$i18n.t('EditSuccess'))
            await this.reload()
        },

        async updateItem (item) {
            return await IKUtils.safeCallFunction(this.model, this.model.edit, item)
        },

        async deleteItem (item, promt = true) {
            if (promt) {
                const res = await IKUtils.showConfirmAsyn(
                    this.$t('are_you_sure'),
                    this.$t('you want to delete this item?'),
                )
                if (res.isConfirmed) {
                    await IKUtils.safeCallFunction(this.model, this.model.remove, item.id)
                    IKUtils.toast(this.$t('delete_success'))
                    this.reload()
                }
            } else {
                await IKUtils.safeCallFunction(this.model, this.model.remove, item.id)
                IKUtils.toast(this.$t('delete_success'))
                this.reload()
            }
        },
        addItem () {
            this.editedIndex = -1
            this.dialog = true
        },
        editItem (item) {
            this.lastClickItemId = item?.id
            if (this.useDefaultAction && this.useEditAction) {
                this.editedIndex = this.tableItem.indexOf(item)
                this.dialog = true
            } else if (this.customOnRowClick) {
                this.customOnRowClick(item)
            }
        },

        async reload () {
            const model = this.model
            this.loading = true

            this.items = await IKUtils.safeCallFunction(model, model.getList, true, this.realFilter)
            this.$nextTick(() => {
                this.loading = false
                this.dialog = false
                this.$emit('reloaded', this.items)
            })
        },
        changeOperationMode (newMode) {
            this.operationMode = newMode
            this.targetItem = {}
        },
        startMassEdit () {
            console.log(this.targetItem)
            this.targetItem = {}
            this.searchItem = {}
            this.massEditSearch = ''
            this.massEditStep = 0
            this.operationMode = 0
            this.massLoading = false
            this.progress = 0
            this.showMultipleEditDialog = true

        },
        actionsFactory (operationMode, requiredItems = null) {
            console.log(this.targetItem)
            const selectedItems = requiredItems ?? this.selectedItems
            const actions = []

            if (operationMode === 1) {
                //add
                Object.keys(this.targetItem).forEach(key => {
                    if (this.targetItem[key]) {
                        selectedItems.forEach(it => {
                            it[key] = _.uniq([it[key], this.targetItem[key]].flat(3))

                        })
                    }
                })
                selectedItems.forEach(item => {
                    actions.push(async () => await this.updateItem(item))
                })
            } else if (operationMode === 0) {
                //overwirte
                selectedItems.forEach(item => {
                    actions.push(async () => await this.updateItem(IKUtils.extend(item, this.targetItem)))
                })
            } else {
                selectedItems.forEach(item => {
                    actions.push(async () => await this.deleteItem(item, false))
                })
            }
            return actions
        },
        async massiveEdit (operationMode) {
            this.massEditStep = 1
            this.massLoading = true
            const actions = this.actionsFactory(operationMode)
            const result = []
            for (const action of actions) {
                try {
                    await action()
                    result.push({ ok: true })
                } catch (e) {
                    console.log('fail')
                    result.push({
                        ok: false,
                        message: e.message,
                    })
                }

            }
            IKUtils.toast(this.$t('edit_success'))
            console.log(result)
            this.maxProgress = result.length
            this.progress = result.filter(it => it.ok).length
            this.targetItem = {}
            this.reload().catch(() => {
                this.loading = false
                this.items = []
            })
            this.massLoading = false

        },

        pageUpdate () {
            this.$vuetify.goTo(0, {
                appOffset: true,
            })
        },
    },
}
</script>
<style>

.paReset .v-toolbar__content {
    padding-right: 16px !important;
    padding-left: 16px !important;
}

.breakWord {
    word-break: break-all;
}

::-webkit-scrollbar {
    display: none;
}

.disabled {
    pointer-events: none;
    background: #f9f9f9;
    color: grey;
}

.v-simple-checkbox:not(.v-data-table__checkbox) {
    pointer-events: auto !important;
}

</style>

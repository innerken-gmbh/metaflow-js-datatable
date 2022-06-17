<template>
  <v-container style="position: relative">
    <div class="d-flex">
      <div style="height: 37px;"
           class="d-flex align-center "
      >
        <slot name="navigation"></slot>
        <v-icon size="24" class="mr-2">{{ icon }}</v-icon>
        <span class="text-h3 font-weight-bold">{{ entityName || model.name() }}</span>
      </div>
      <v-spacer></v-spacer>
      <slot :items="items" :selectItems="selectedItems" :tableItems="tableItem" :dateTime="dates" name="footer"
      ></slot>
      <template
          v-if="selectedItems.length>0 && !hideSelectedAction"
      >
        <v-btn
            elevation="0"
            @click="massEditDialog=true"
            color="primary darken-4"
        >
          <v-icon left color="white">mdi-pencil</v-icon>
          {{$t('批量编辑')}}

        </v-btn>
        <v-btn
            elevation="0"
            color="error darken-4"
            @click="updateAll(null,true)"
        >
          <v-icon left color="white">mdi-delete</v-icon>
          {{$t('批量删除')}}

        </v-btn>

      </template>

      <v-btn
          v-if="useDefaultAction && useAddAction"
          color="green darken-4"
          class="mr-0"
          elevation="0"
          @click="$refs.gf.realDialog=true"
      >

        {{ $t('新增') }}
      </v-btn>
    </div>
    <v-card class="mt-4" style="position: sticky;top: 0;z-index: 2" elevation="0">
      <template v-if="!hideIkdatatableHeader">
        <div style="background: white" class="d-flex ma-0 pa-4 align-center">
          <div style="height: 100%;" class="d-flex align-center mr-2 flex-grow-1">
            <v-text-field
                class=""
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                outlined
                dense
                hide-details
                clearable
                :label="$t('Search')"
                single-line
            />
          </div>
          <template v-if="displayMergableFields.length>0">
            <template v-for="(field) in displayMergableFields">
              <div :key="field.value" style="max-width: 164px; height: 100%" class="mr-2">
                <form-field
                    :full-height="false"
                    :hide-select="true"
                    :on-toolbar="true"
                    :no-details="true"
                    :field="field"
                    :edited-item="filterItem"
                />
              </div>
            </template>
            <div v-if="shouldHideMergableField" style="width: 80px">
              <v-card
                  dark
                  color="warning"
                  style="height: 100%"
                  class="d-flex align-center justify-center"
                  @click.stop="showFilterDialog=true"
              >
                <v-icon left>mdi-filter-variant</v-icon>
                {{ $t('filter') }}
              </v-card>
            </div>

          </template>

          <template v-if="useDateFilter">


            <div style="max-width: 300px; height: 54px;" class="d-flex align-center">
              <v-btn   @click="datePickerMenu=true" color="primary" elevation="0" outlined>
                <v-icon left>mdi-calendar</v-icon>
                {{$t('日期筛选')+' | '+ getNiceLabel(dates)}}
              </v-btn>
            </div>


          </template>
        </div>
      </template>
      <div v-if="Object.keys(filterItem).length>0">
        <div class="px-4 pb-2">
          <v-chip :key="item.key" @click="()=>$delete(filterItem,item.key)"
                  label close
                  @click:close="$delete(filterItem,item.key)"
                  class="mr-2"
                  v-for="item in filterDisplayChips"
          >
            <span class="mr-2">
                {{
                item.name
              }}
            </span>
            {{ $t(item.value) }}
          </v-chip>
        </div>
      </div>

      <template v-if="displayMergableFields.length>0 || useDateFilter">
        <v-divider/>
      </template>
    </v-card>
    <v-card rounded>


      <div class="ma-0" style="position: sticky">
        <v-data-table
            v-model="selectedItems"
            :show-expand="showExpand"
            :single-expand="singleExpand"
            :show-select="useSelect"
            :headers="realHeaders"
            :items="tableItem"
            :loading="loading"
            :search.sync="search"
            :items-per-page="30"
            :footer-props="{itemsPerPageOptions:[30,-1]}"
            multi-sort
            :group-by="groupBy"
            :hide-default-footer="hideDefaultFooter"
            @click:row="editItem"
        >

          <template v-slot:group.header="items" v-if="groupBy">
            <td colspan="100%">
              <div class="display-2"> {{ $t('time') }}: {{ items.group }} {{ $t('hour') }}</div>
            </td>
          </template>
          <template #item.action="{item}">
            <slot name="item.action" :item="item"></slot>
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
              <v-simple-checkbox
                  :value="!!item[adItem.value]"
                  dense
                  color="success darken-4"
                  v-ripple
                  @click="toggleProperty(item,adItem.value)"
                  :key="adItem.name"
              />
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
              <template v-if="adItem.type.color">
                 <span
                     class="pa-1 px-3 white--text rounded-pill text-no-wrap"
                     :class="
                       adItem.type.color
                     .find(c=>{return parseInt(item[adItem.value])===c.id}).color"
                 >
                {{ [item['opt' + adItem.value]].flat().join(', ') }}
              </span>
              </template>
              <template v-else>
                <span>{{ [item['opt' + adItem.value]].flat().join(', ') }}</span>

              </template>

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
              <v-btn
                  color="primary"
                  @click="reload"
              >
                {{ $t('重新加载') }}
              </v-btn>
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
      </div>
    </v-card>
    <v-dialog v-model="massEditDialog" max-width="600px">
      <v-card class="pa-4 px-6">
        <h4>{{ selectedItems.length }} {{ $t('Item') }} {{ $t('已经选中') }}</h4>

        <template v-for="field in mergableFields.map(f=>({...f,cols:3,md:3,sm:3}))">

          <form-field
              :key="field.id"
              class="my-2"
              :no-details="true"
              :field="field"
              on-toolbar
              :edited-item="mergeItem"

          />
        </template>
        <div class="d-flex">
          <v-spacer/>
          <v-btn @click="updateAll(mergeItem,false)"
                 elevation="0"
                 class="green darken-4 white--text mr-0"
          >
            {{ $t('更新选中') }}
          </v-btn>

        </div>
      </v-card>
    </v-dialog>
    <general-form
        ref="gf"
        :title="entityName"
        :dialog="dialog"
        :edited-item="editedItem"
        :edited-index="editedIndex"
        :form-field="formField"
        :use-delete-action="useDefaultAction&&useDeleteAction"
        @change-general-form="dialogChange"
    />
    <v-dialog max-width="400px" v-model="datePickerMenu">
      <v-card @click="datePickerMenu=false" color="#efefef" class="pa-2">
        <date-range-picker v-model="dates"></date-range-picker>
      </v-card>
    </v-dialog>
    <v-dialog max-width="400px" v-model="showFilterDialog">
      <v-card class="ma-0 py-8 pa-4">
        <slot :items="items" name="filterLeft"></slot>
        <slot :items="items" :tableItems="tableItem" name="filterRight"></slot>
        <template v-for="(field) in mergableFields">
          <div class="mt-2" :key="field.value">
            <form-field
                @clear="()=>delete filterItem[field.value]"
                class="mx-1"
                :no-details="true"
                :field="field"
                :edited-item="filterItem"
            />
          </div>
        </template>
        <div class="mt-2" v-if="Object.keys(filterItem).length>0">
          <v-card
              flat
              dark
              color="error"
              style="height: 100%"
              class=" d-flex align-center justify-center pa-2"
              @click.stop="filterItem={}"
          >
            <v-icon left>mdi-close-box</v-icon>
            {{ $t('Reset') }}
          </v-card>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>

import GeneralForm from './GeneralForm'
import ImgTemplate from './ImgTemplate'
import FormField from './FormField'
import { IKDataEntity } from '../../index'
import IKUtils from 'innerken-js-utils'
import { groupBy } from 'lodash'
import DateRangePicker from './DateRangePicker'
import PriceTableDisplay from './PriceTableDisplay'
import {getNiceLabel} from '../DateRepository'

export default {
  name: 'IkDataTable',
  components: {
    PriceTableDisplay,
    DateRangePicker,
    ImgTemplate,
    GeneralForm,
    FormField,
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
    useDefaultAction: {
      type: Boolean,
      default: true,
    },
    useAddFilter: {
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
    onePageArrangement: {
      type: Boolean,
      default: false,
    },
    useDateFilter: {
      type: Boolean,
      default: false,
    },
    useCustomerActionOnly: {
      type: Boolean,
      default: false,
    },
    useAddAction: {
      type: Boolean,
      default: true,
    },
    requiredDateValue: {},
    groupBy: {},
    onePageArrangementHeight: {
      type: String,
      default: '',
    },
    hideDefaultFooter: {
      type: Boolean,
      dafault: false,
    },
    hideIkdatatableHeader: {
      type: Boolean,
      default: false,
    },
    hideSelectedAction: {
      type: Boolean,
      default: false,
    },
    customOnRowClick: {},
    fixedFilter: {},
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
        console.log(val)
        if (val?.length === 2 || val?.length === 1) {
          this.dates = val
        }
      },
    },
  },
  data: function () {
    return {
      page: 1,
      fab: null,
      pageCount: 0,
      itemsPerPage: 15,
      filterItem: {},
      mergeItem: {},
      Types: IKDataEntity.Types,
      search: '',
      loading: false,
      optionCache: {},
      items: [],
      dialog: false,
      headers: [],
      formField: [],
      editedIndex: -1,
      editedItem: null,
      defaultItem: null,
      selectedItems: [],
      realHeaders: [],
      advancedItems: [],
      slottedItems: [],
      massEditDialog: false,
      showFilterDialog: false,
      datePickerMenu: false,
      dates: null,
      formDisc: {},

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
    requiredDisplayNumber: function () {
      return this.onePageArrangement ? 0 : this.useDateFilter ? 4 : 5
    },
    shouldHideMergableField: function () {
      const res = this.mergableFields.length > this.requiredDisplayNumber

      return res
    },
    displayMergableFields: function () {
      return this.shouldHideMergableField
          ? this.mergableFields.slice(0, this.requiredDisplayNumber)
          : this.mergableFields
    },
    mergableFields: function () {
      const res = this.formField
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
    tableItem: function () {
      if (this.filterItem) {
        const res = this.items.filter(i => {
          return Object.keys(this.filterItem).filter(k => this.filterItem[k] != null).every(
              t => {
                const org = i[t]
                const oth = this.filterItem[t]
                return org == oth || (Array.isArray(org) && (org.includes(oth) || (Array.isArray(oth) && oth.every(ot => org.includes(ot)))))
              })
        })
        return res
      }
      return this.items
    },
    filterDisplayChips: function () {
      const keys = Object.keys(this.filterItem)

      return keys.filter(k => (!this.fixedFilter || !Object.keys(this.fixedFilter).includes(k)) && [this.filterItem[k]].flat().length > 0)
          .map((k) => {
            const field = this.formDisc[k][0]
            if (field.dataType === IKDataEntity.Types.Option) {
              const selectionGroup = groupBy(field.type._selectItems, field.type.itemValue)
              console.log(selectionGroup, 'groupContent')
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

            } else if (field.dataType === IKDataEntity.Types.Boolean) {
              const selectionGroup = groupBy(field.type._selectItems, field.type.itemValue)
              return {
                key: k,
                name: field.text,
                value: this.filterItem[k] ? 'Yes' : 'No',
              }
            }
          })
    },
  },
  mounted () {
    [this.headers, this.formField, this.defaultItem] = IKDataEntity.parseField(this.model)
    console.log(this.formField)
    this.formDisc = _.groupBy(this.formField, 'value')
    console.log(this.formDisc)
    if (this.useCustomerActionOnly) {
      this.headers.push({
        text: 'action',
        width: '240px',
        value: 'action',
        sortable: false,
      })
    }

    if (this.fixedFilter) {
      this.defaultItem = Object.assign({}, this.defaultItem, this.fixedFilter)
    }

    this.realHeaders = this.getRealHeaders()
    this.advancedItems = this.getAdvancedItems()
    this.slottedItems = this.getSlottedItems()
    this.editedItem = IKUtils.deepCopy(this.defaultItem)
    // console.log('this.editedItem firstStep', this.editedItem)
    this.reload().catch(() => {
      this.loading = false
      this.items = []
    })
  },
  methods: {
    getNiceLabel,
    resetFilterItem () {
      this.filterItem = this.fixedFilter ?? {}
    },
    getAdvancedItems: function () {
      return this.headers
          .filter(item => [IKDataEntity.Types.Image, IKDataEntity.Types.Boolean,
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
    getRealHeaders: function () {
      return this.headers.map(item => {
        item.text = this.$i18n.t(item.text)
        return item
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
    async dialogChange (save, remove = false) {
      if (remove) {
        await this.deleteItem(this.editedItem)
        return
      }
      if (save) {
        this.save()
      } else {
        this.closeDialog()
      }
    },
    async updateAll (newItem = null, remove = false) {
      if (remove) {
        this.selectedItems.forEach(item => this.deleteItem(item, false))
        return
      }
      if (newItem) {
        const update = this.selectedItems.reduce((arr, item) => {
          const _i = IKUtils.extend(item, newItem)
          arr.push(this.updateItem(_i))
          return arr
        }, [])
        const result = await Promise.allSettled(update)
        console.log(result)
        this.mergeItem = {}
        newItem = {}
        IKUtils.toast(this.$i18n.t('编辑成功'))
      }
      this.massEditDialog = false
      this.selectedItems = []
      this.closeDialog()
    },
    closeDialog () {
      console.log('should close dialog')
      this.editedItem = IKUtils.deepCopy(this.defaultItem)
      this.editedIndex = -1
      this.dialog = false
      this.$refs.gf.realDialog = false
      this.reload()
    },

    async toggleProperty (item, key) {
      const _item = IKUtils.deepCopy(item)
      _item[key] = !_item[key]
      await this.updateItem(_item)
      IKUtils.toast(this.$i18n.t('编辑成功'))
      this.closeDialog()
    },

    async updateItem (item) {
      return await IKUtils.safeCallFunction(this.model, this.model.edit, item)
    },

    async save () {
      if (this.editedIndex > -1) {
        await this.updateItem(this.editedItem)
        IKUtils.toast(this.$i18n.t('编辑成功'))
        this.closeDialog()
      } else {
        IKUtils.safeCallFunction(this.model, this.model.add, this.editedItem).then(() => {
          IKUtils.toast(this.$i18n.t('添加成功'))
          this.closeDialog()
        })
      }
    },
    async deleteItem (item, promt = true) {
      if (promt) {
        const res = await IKUtils.showConfirmAsyn(
            this.$i18n.t('Are you sure?'),
            this.$i18n.t('you want to delete this item?'),
        )
        console.log(res)
        if (res.isConfirmed) {
          IKUtils.safeCallFunction(this.model, this.model.remove, item.id)
              .then(() => {
                IKUtils.toast(this.$i18n.t('删除成功'))
                this.reload()
              })
        }
      } else {
        IKUtils.safeCallFunction(this.model, this.model.remove, item.id)
            .then(() => {
              IKUtils.toast(this.$i18n.t('删除成功'))
              this.reload()
            })
      }
    },

    editItem (item) {
      if (this.useDefaultAction && this.useEditAction) {
        this.editedIndex = this.tableItem.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.$refs.gf.realDialog = true
      } else if (this.customOnRowClick) {
        this.customOnRowClick(item)
      }
    },

    async reload () {
      const model = this.model
      this.loading = true
      this.filterItem = this.fixedFilter ?? {}
      this.items = await IKUtils.safeCallFunction(model, model.getList, true, this.realFilter)
      this.loading = false
      this.$refs.gf.realDialog = false
      this.$emit('reloaded')
    },
  },
}
</script>
<style>
.breakWord {
  word-break: break-all;
}
</style>

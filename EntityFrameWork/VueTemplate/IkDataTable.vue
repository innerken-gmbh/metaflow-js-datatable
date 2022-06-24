<template>
  <v-container class="px-6" style="position: relative">
    <div class="d-flex">
      <div class="d-flex align-center py-4 pb-6">
        <slot name="navigation"></slot>
        <span class="text-h2 font-weight-bold">{{ entityName || model.name() }}</span>
      </div>


    </div>
    <div class="d-flex filterBar align-center mb-6">
      <v-btn
          color="primary"
          v-if="useDefaultAction && useAddAction"
          class="mr-0"
          elevation="0"
          @click="$refs.gf.realDialog=true"
      >

        {{ $t('新增') }}{{ entityName }}
      </v-btn>
      <slot :items="items" :selectItems="selectedItems" :tableItems="tableItem" :dateTime="dates" name="footer"
      >

      </slot>
      <v-spacer/>

      <div class="d-flex ma-0 mr-2  align-center">
        <div style="height: 100%;" class="d-flex align-center mr-2 flex-grow-1 flex-shrink-1">
          <v-text-field
              class="white"
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
        <v-dialog v-model="showFilter" max-width="300px">
          <template #activator="{on}">
            <v-btn v-if="mergableFields.length>0"
                   v-on="on" outlined
            >
              <v-icon left>mdi-filter-outline</v-icon>
              筛选
            </v-btn>
          </template>
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
            <v-btn elevation="0" @click="showFilter=false" block color="primary">{{ $t('确定') }}</v-btn>
          </v-card>
        </v-dialog>

      </div>
      <template v-if="useDateFilter">
        <div style="max-width: 300px; height: 54px;"
             class="d-flex align-center"
        >
          <v-btn @click="datePickerMenu=true"
                 style="background: white"
                 elevation="0"
                 outlined
          >
            <v-icon left>mdi-calendar</v-icon>
            {{ $t('日期筛选') + ' | ' + getNiceLabel(dates) }}
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
            <span class="mr-2">
                {{ item.name }}
            </span>
        {{ $t(item.value) }}
      </v-chip>
    </div>

    <v-card>
      <v-data-table
          v-model="selectedItems"
          :show-expand="showExpand"
          :single-expand="singleExpand"
          :headers="realHeaders"
          :items="tableItem"
          :loading="loading"
          :search.sync="search"
          @update:page="pageUpdate"
          :items-per-page="30"
          :footer-props="{itemsPerPageOptions:[50],disableItemsPerPage:true}"
          :hide-default-footer="hideDefaultFooter"
          @click:row.self="editItem"
      >
        <template #item.action="{item}">
          <v-menu close-on-content-click rounded left offset-y offset-overflow>
            <template #activator="{on,attrs}">
              <v-btn v-on="on" v-bind="attrs" style="border-radius: 12px"
                     large icon
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list width="200px" outlined>
              <v-list-item-group>
                <v-list-item @click="editItem(item)">
                  <v-list-item-title>打开</v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteItem(item)">
                  <v-list-item-title>删除</v-list-item-title>
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
            <div>
              <v-simple-checkbox
                  :value="!!item[adItem.value]"
                  dense
                  class="ma-0"
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
                (+{{[item[adItem.value]].flat().length-2}})
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
    >
      <template #extraSheet="{currentState,currentItem}">
        <slot name="extraSheet" :currentState="currentState"></slot>
      </template>

    </general-form>
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
import { getNiceLabel } from '../DateRepository'

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
      showFilter: false,

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
      if (this.filterItem && !this.showFilter) {
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
      const keys = !this.showFilter ? Object.keys(this.filterItem) : []

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
    if (this.useCustomerActionOnly || this.useDefaultAction && (this.useEditAction || this.useDeleteAction)) {
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
    async dialogChange (save, needClose = true) {

      if (save) {
        this.save(needClose)
      } else if (needClose) {
        this.closeDialog()
      }
      if (!needClose) {
        this.editedItem = IKUtils.deepCopy(this.defaultItem)
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

    async save (needClose) {
      if (this.editedIndex > -1) {
        await this.updateItem(this.editedItem)
        IKUtils.toast(this.$i18n.t('编辑成功'))
        this.closeDialog()
      } else {
        await IKUtils.safeCallFunction(this.model, this.model.add, this.editedItem)
        IKUtils.toast(this.$i18n.t('添加成功'))
        if (needClose) {
          this.closeDialog()
        }

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
        this.dialog = true
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
      this.dialog = false
      this.$emit('reloaded')
    },
    pageUpdate () {
      console.log('update')
      this.$vuetify.goTo(0, {
        container: '#app-container',
        appOffset: true,
      })
    },
  },
}
</script>
<style>
.breakWord {
  word-break: break-all;
}

th {
  font-size: 16px !important;
}

</style>

<template>
  <div class="mt-0">

    <template v-if="!hideIkdatatableHeader">
      <div style="background: white" class="d-flex ma-0 pa-4 py-1">

        <div style="height: 37px;"
             class="d-flex align-center "
        >
          <v-icon left>{{ icon }}</v-icon>
          <span class="display-2">{{ entityName }}</span>
        </div>

        <v-spacer></v-spacer>

        <div style="width: 150px;height: 100%;" class="d-flex align-center">
          <v-text-field
              class="mt-0 pt-0"
              v-model="search"
              append-icon="mdi-magnify"
              hide-details
              clearable
              :label="$t('Search')"
              single-line
              style="max-width: 350px;"
          />
        </div>
      </div>
    </template>

    <v-divider/>

    <div class="d-flex align-center px-3" style="background-color: #FAFAFA; ">
      <template v-if="displayMergableFields.length>0">

        <template v-for="(field) in displayMergableFields">
          <div :key="field.value" style="max-width: 164px;height: 100%" class="py-2 pr-1">
            <form-field
                :on-toolbar="true"
                :no-details="true"
                :field="field"
                :edited-item="filterItem"
            />
          </div>
        </template>

        <div v-if="Object.keys(filterItem).length>0" style="width: 160px">
          <v-card
              dark
              color="error"
              style="height: 36px"
              class=" d-flex align-center justify-center"
              @click.stop="filterItem={}"
          >
            <v-icon left>mdi-close-box</v-icon>
            {{ $t('重置筛选器') }}
          </v-card>
        </div>

        <div v-else-if="shouldHideMergableField" style="width: 80px">
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
        <v-spacer></v-spacer>
        <v-menu
            ref="datePickerMenu"
            v-model="datePickerMenu"
            :close-on-content-click="false"
            :return-value.sync="dates"
            :close-on-click="false"
            offset-y
            bottom
            :nudge-width="0"
        >
          <template v-slot:activator="{ on }">
            <div style="max-width: 300px; height: 54px;" class="d-flex align-center">
              <v-text-field
                  class="ma-0 pa-0"
                  v-model="dates"
                  hide-details
                  :label="$t('日期筛选')"
                  solo
                  dense
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  single-line
                  append-icon="mdi-close"
                  @click:append="clear"
                  v-on="on"
              />
            </div>
          </template>
          <v-date-picker

              v-model="dates"
              no-title
              :range="!useSingleDate"
              scrollable
              locale="de"
          >
            <v-spacer/>
            <v-btn
                text
                color="primary"
                @click="datePickerMenu = false"
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
                text
                color="primary"
                @click="$refs.datePickerMenu.save(dates)"
            >
              {{ $t('OK') }}
            </v-btn>
          </v-date-picker>
        </v-menu>
      </template>
    </div>

    <template v-if="displayMergableFields.length>0 || useDateFilter">
      <v-divider/>
    </template>

    <slot name="extra-heading"/>

    <v-card class="ma-0" flat tile>
      <v-data-table
          dense
          :height="onePageArrangementHeight ? onePageArrangementHeight :
                       onePageArrangement ? 'calc(100vh - 147px)':
                 displayMergableFields.length>0 || useDateFilter ? 'calc(100vh - 160px)' :'calc(100vh - 105px)'"
          v-model="selectedItems"
          :show-expand="showExpand"
          :single-expand="singleExpand"
          :show-select="useSelect"
          :fixed-header="true"
          :headers="realHeaders"
          :items="tableItem"
          :loading="loading"
          :search.sync="search"
          :items-per-page="30"
          :footer-props="{itemsPerPageOptions:[30,-1]}"
          multi-sort
          :group-by="groupBy"
          :hide-default-footer="hideDefaultFooter"
      >

        <template v-slot:group.header="items" v-if="groupBy">
          <td colspan="100%">
            <div class="display-2"> {{ $t('time') }}: {{ items.group }} {{ $t('hour') }}</div>
          </td>
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
            <template>
              <span class="font-weight-bold"
                    :class="adItem.type.color?
                            adItem.type.color
                            .find(c=>{return parseInt(item[adItem.value])===c.id})
                            .color+'--text':''"
                    style="font-size: 18px"
              >
                {{ item['opt' + adItem.value].join(', ') }}
              </span>
            </template>
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

        <template v-slot:item.action="{ item }">
          <slot
              name="item.action"
              :item="item"
          />
          <template v-if="useDefaultAction">
            <template v-if="useEditAction">
              <v-btn
                  small
                  class="mx-2 grey white--text"
                  @click="editItem(item)"
              >
                {{ $t('修改') }}
              </v-btn>
            </template>
            <template v-if="useDeleteAction">
              <v-btn
                  color="error"
                  small
                  class="mr-2"
                  @click="deleteItem(item)"
              >
                {{ $t('删除') }}
              </v-btn>
            </template>
          </template>

        </template>

        <template v-slot:expanded-item="{ item }">
          <td :colspan="headers.length">
            <slot
                name="expanded-item"
                :item="item"
            />
          </td>
        </template>
        <template v-slot:footer.prepend>
          <v-speed-dial
              v-if="selectedItems.length>0"
              v-model="fab"
              direction="top"
          >
            <template v-slot:activator>
              <v-btn
                  v-model="fab"
                  color="primary"

              >
                <v-icon v-if="fab">
                  mdi-close
                </v-icon>
                <v-icon v-else>
                  mdi-square-edit-outline
                </v-icon>
              </v-btn>
            </template>

            <v-btn
                fab

                @click="massEditDialog=true"
                color="green"
            >
              <v-icon color="white">mdi-pencil</v-icon>
            </v-btn>

            <v-btn
                fab
                color="indigo"
                @click="$refs.gf.realDialog=true"
            >
              <v-icon color="white">mdi-plus</v-icon>
            </v-btn>
            <v-btn
                fab
                color="red"
                @click="updateAll(null,true)"
            >
              <v-icon color="white">mdi-delete</v-icon>
            </v-btn>
          </v-speed-dial>
          <v-btn
              v-else-if="useDefaultAction && useAddAction"
              color="success"
              @click="$refs.gf.realDialog=true"
          >

            {{ $t('新增') }}
          </v-btn>

          <slot :items="items" :selectItems="selectedItems" :tableItems="tableItem" :dateTime="dates" name="footer"
          ></slot>
        </template>
      </v-data-table>

      <v-dialog v-model="massEditDialog" max-width="600px">
        <v-card class="pa-2">
          <v-card-title>{{ selectedItems.length }} {{ $t('Item') }} {{ $t('已经选中') }}</v-card-title>
          <v-card-text>

            <template v-for="field in mergableFields.map(f=>({...f,cols:3,md:3,sm:3}))">

              <form-field
                  :key="field.id"
                  class="mx-2"
                  :no-details="true"
                  :field="field"
                  :edited-item="mergeItem"

              />
            </template>

          </v-card-text>

          <v-card-actions class="pb-2">
            <v-spacer/>
            <v-btn @click="updateAll(mergeItem,false)" class="green white--text">{{ $t('更新选中') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>

    <general-form
        ref="gf"
        :title="entityName"
        :dialog="dialog"
        :edited-item="editedItem"
        :edited-index="editedIndex"
        :form-field="formField"
        @change-general-form="dialogChange"
    />

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
  </div>
</template>

<script>

import GeneralForm from './GeneralForm'
import ImgTemplate from './ImgTemplate'
import FormField from './FormField'
import { IKDataEntity } from '../../index'
import IKUtils from 'innerken-js-utils'
import dayjs from 'dayjs'

export default {
  name: 'IkDataTable',
  components: {
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
    useSingleDate: {
      type: Boolean,
      default: false,
    },
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

    }
  },
  computed: {
    okDates () {

      let res = this.useSingleDate ? [this.dates, this.dates] : IKUtils.deepCopy(this.dates)
      if (!res) {
        res = []
        res[0] = dayjs().format('YYYY-MM-DD')
      }
      if (res.length < 2) {
        res[0] = res[0] ?? dayjs().format('YYYY-MM-DD')
        res[1] = res[0]
      }
      if (Date.parse(res[0]) > Date.parse(res[1])) {
        [res[0], res[1]] = [res[1], res[0]]
      }
      return res
    },
    realFilter () {
      const res = this.filter ?? {}
      console.log('realFilter', res)
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
      console.log('shouldHideMergableField', res)
      return res
    },
    displayMergableFields: function () {
      return this.shouldHideMergableField ?
          this.mergableFields.slice(0, this.requiredDisplayNumber) :
          this.mergableFields
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
      console.log('mergableFields', res)
      return res
    },
    tableItem: function () {
      if (this.filterItem) {
        return this.items.filter(i => {
          return Object.keys(this.filterItem).filter(k => this.filterItem[k] != null).every(
              t => {
                const org = i[t]
                const oth = this.filterItem[t]
                return org == oth || (Array.isArray(org) && (org.includes(oth) || oth.every(ot => org.includes(ot))))
              })
        })
      }
      return this.items
    },

  },
  mounted () {
    [this.headers, this.formField, this.defaultItem] = IKDataEntity.parseField(this.model)

    console.log('this.headers', this.headers, 'this.formField', this.formField, 'this.defaultItem', this.defaultItem)

    if (this.useDefaultAction || this.useCustomerActionOnly) {
      this.headers.push({
        text: 'action',
        width: '240px',
        value: 'action',
        sortable: false,
      })
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
    getAdvancedItems: function () {
      return this.headers
          .filter(item => [IKDataEntity.Types.Image, IKDataEntity.Types.Boolean,
            IKDataEntity.Types.Option, IKDataEntity.Types.Group, IKDataEntity.Types.Color,
          ].includes(item.dataType))
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
    dialogChange (save) {
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
    clear () {
      this.datePickerMenu = false
      this.dates = null
    },
    deleteItem (item, promt = true) {
      if (promt) {
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
      } else {
        IKUtils.safeCallFunction(this.model, this.model.remove, item.id)
            .then(() => {
              IKUtils.toast(this.$i18n.t('删除成功'))
              this.reload()
            })
      }
    },

    editItem (item) {
      this.editedIndex = this.tableItem.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.$refs.gf.realDialog = true
    },

    async reload () {
      const model = this.model
      this.loading = true

      this.items = await IKUtils.safeCallFunction(model, model.getList, true, this.realFilter)

      this.loading = false
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

<template>
  <v-card
      class="mt-0"
  >
    <v-toolbar dark dense>
      <v-toolbar-title>
        <v-icon>{{ icon }}</v-icon>
        {{ entityName }}
      </v-toolbar-title>
      <v-btn @click="reload" icon>
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-pagination
          v-model="page"
          :length="pageCount"
          :total-visible="5"
      ></v-pagination>
      <v-select class="flex-grow-0" hide-details style="width: 64px" v-model="itemsPerPage" :items="[-1,5,15,30]"></v-select>
      <v-spacer></v-spacer>
      <v-text-field
          class="mr-2"
          v-model="search"
          append-icon="mdi-magnify"
          hide-details
          clearable
          :label="$t('Search')"
          single-line
          style="max-width: 250px;"
      />
      <v-btn
          color="primary"

          dark
          @click="$refs.gf.realDialog=true"
      >
        {{ $t(addText) }}
      </v-btn>
    </v-toolbar>
    <slot name="extra-heading"/>
    <v-toolbar
        dense
    >
      <slot :items="items" name="filterLeft">
      </slot>
      <template v-if="mergableFields.length>0">
        <template v-for="(field,index) in mergableFields">
          <form-field
              class="mx-1"
              :no-details="true"
              :key="index+'filter'"
              :field="field"
              :edited-item="filterItem"
          />
        </template>

        <v-btn :color="Object.keys(filterItem).length>0?'error':''" icon @click="filterItem={}">
          <v-icon>mdi-close-box</v-icon>
        </v-btn>
      </template>
      <v-spacer/>
      <v-toolbar-items>
        <slot :items="items" :tableItems="tableItem" name="filterRight"></slot>
      </v-toolbar-items>
    </v-toolbar>
    <v-data-table
        dense
        v-model="selectedItems"
        :show-expand="showExpand"
        :single-expand="singleExpand"
        :show-select="useSelect"
        :fixed-header="true"
        :headers="realHeaders"
        :items="tableItem"
        :loading="loading"
        :search.sync="search"
        :height="'calc(100vh - '+(selectedItems.length>0?'248px)':'196px)')"
        :page.sync="page"
        :items-per-page="itemsPerPage"
        hide-default-footer
        @page-count="pageCount = $event"
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
            adItem.dataType===Types.Group"
        >
          <v-chip
              v-bind:key="'_'+adItem.value+c"
              v-for="(c) in adItem.childKey.filter(adItem.displayChild)"
          >
            {{ item['_' + adItem.value + c] }}
          </v-chip>
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
          <template v-for="(l,index) of item['opt'+adItem.value]">
            <v-chip
                :key="item+adItem.name+'c'+index"
                class="mx-1"
                :color="adItem.type.color?
                            adItem.type.color.find(c=>{return parseInt(item[adItem.value])===c.id}).color:''"
                label
            >
              {{ l }}
            </v-chip>
          </template>
        </template>
      </template>
      <template v-slot:footer>
        <slot :items="items" :selectItems="selectedItems" name="footer">
          <v-toolbar v-if="selectedItems.length>0"
                     dense
                     color="white"
          >
            <template >
              <template v-for="field in mergableFields.map(f=>({...f,cols:3,md:3,sm:3}))">
                <form-field
                    class="mx-1"
                    :no-details="true"
                    :key="field.id"
                    :field="field"
                    :edited-item="mergeItem"
                />
              </template>
              <v-btn @click="updateAll(mergeItem,false)" color="green">{{ $t('更新选中') }}</v-btn>
              <v-btn @click="updateAll(null,true)" color="red">{{ $t('删除选中') }}</v-btn>
            </template>
            <v-spacer/>

          </v-toolbar>
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
          <template v-if="useEditAction">
            <v-icon
                x-large
                class="mr-2"
                @click="editItem(item)"
            >
              mdi-pencil-box
            </v-icon>
          </template>
          <template v-if="useDeleteAction">
            <v-icon
                x-large
                @click="deleteItem(item)"
            >
              mdi-delete
            </v-icon>
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
    </v-data-table>
    <general-form
        ref="gf"
        :title="entityName"
        :dialog="dialog"
        :edited-item="editedItem"
        :edited-index="editedIndex"
        :form-field="formField"
        @change-general-form="dialogChange"
    />
  </v-card>
</template>

<script>

import GeneralForm from './GeneralForm'
import ImgTemplate from './ImgTemplate'
import FormField from './FormField'
import { IKDataEntity } from '../../index'
import IKUtils from 'innerken-js-utils'

export default {
  name: 'IkDataTable',
  components: {
    ImgTemplate,
    GeneralForm,
    FormField
  },
  props: {
    model: {
      type: Object,
      default: () => {
      }
    },
    addText: {
      type: String,
      default: 'Add'
    },
    entityName: {
      type: String,
      default: ''
    },
    filter: {
      type: [Object, Function],
      default: () => {
      }
    },
    icon: {
      type: String,
      default: ''
    },
    showExpand: {
      type: Boolean,
      default: false
    },
    singleExpand: {
      type: Boolean,
      default: false
    },
    useAction: {
      type: Boolean,
      default: true
    },
    useSelect: {
      type: Boolean,
      default: true
    },
    useDefaultAction: {
      type: Boolean,
      default: true
    },
    useEditAction: {
      type: Boolean,
      default: true
    },
    useDeleteAction: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    filter: {
      handler () {
        this.reload()
      }
    }
  },
  data: function () {
    return {
      page: 1,
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
      slottedItems: []
    }
  },
  computed: {
    swatchStyle () {
      return {
        cursor: 'pointer',
        height: '30px',
        width: '30px',
        borderStyle: 'solid',
        borderColor: '#c1c1c1',
        borderWidth: '1px',
        transition: 'border-radius 200ms ease-in-out'
      }
    },
    mergableFields: function () {
      return this.formField
        .filter(item => [IKDataEntity.Types.Boolean, IKDataEntity.Types.Option].includes(item.dataType))
        .filter(item => item.merge)
        .map(item => {
          return {
            ...item,
            name: 'item.' + item.value
          }
        })
    },
    tableItem: function () {
      if (this.filterItem) {
        return this.items.filter(i => {
          return Object.keys(this.filterItem).every(
            t => {
              const org = i[t]
              const oth = this.filterItem[t]
              return org === oth || (Array.isArray(org) && (org.includes(oth) || oth.every(ot => org.includes(ot))))
            })
        })
      }
      return this.items
    }

  },
  created () {
    [this.headers, this.formField, this.defaultItem] = IKDataEntity.parseField(this.model)
    if (this.useAction) {
      this.headers.push({
        text: 'action',
        value: 'action'
      })
    }
    this.realHeaders = this.getRealHeaders()
    this.advancedItems = this.getAdvancedItems()
    this.slottedItems = this.getSlottedItems()
    this.editedItem = IKUtils.deepCopy(this.defaultItem)
    this.reload().catch(() => {
      this.loading = false
      this.items = []
    })
  },
  methods: {
    getAdvancedItems: function () {
      return this.headers
        .filter(item => [IKDataEntity.Types.Image, IKDataEntity.Types.Boolean,
          IKDataEntity.Types.Option, IKDataEntity.Types.Group, IKDataEntity.Types.Color
        ].includes(item.dataType))
        .map(item => {
          return {
            ...item,
            name: 'item.' + item.value
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
            name: 'item.' + item.value
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
    updateAll (newItem = null, remove = false) {
      if (remove) {
        this.selectedItems.forEach(item => this.deleteItem(item, false))
        return
      }
      if (newItem) {
        this.selectedItems.forEach(item => {
          const _i = IKUtils.extend(item, newItem)
          this.updateItem(_i)
        })
        this.mergeItem = {}
        newItem = {}
      }
    },
    closeDialog () {
      console.log('should close dialog')
      this.editedItem = IKUtils.deepCopy(this.defaultItem)
      this.editedIndex = -1
      this.dialog = false
      this.$refs.gf.realDialog = false
      this.reload()
    },
    toggleProperty (item, key) {
      const _item = IKUtils.deepCopy(item)
      _item[key] = !_item[key]
      this.updateItem(_item)
    },

    async updateItem (item) {
      return IKUtils.safeCallFunction(this.model, this.model.edit, item).then(() => {
        IKUtils.toast(this.$i18n.t('编辑成功'))
        this.closeDialog()
      })
    },

    save () {
      if (this.editedIndex > -1) {
        this.updateItem(this.editedItem)
      } else {
        IKUtils.safeCallFunction(this.model, this.model.add, this.editedItem).then(() => {
          IKUtils.toast(this.$i18n.t('添加成功'))
          this.closeDialog()
        })
      }
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
          }
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

      this.items = await IKUtils.safeCallFunction(model, model.getList, true, this.filter)

      this.loading = false
      this.$emit('reloaded')
    }
  }
}
</script>

<style>
.v-data-table td {
  padding: 4px !important;
}

</style>

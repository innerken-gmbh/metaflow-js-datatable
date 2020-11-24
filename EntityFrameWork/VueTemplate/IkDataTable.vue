<template>
  <material-card
      class="px-5 py-3 "
      color="indigo"
      :icon="icon"
      inline
  >
    <template v-slot:after-heading>
      <v-toolbar flat dense class="display-2 font-weight-light">
        {{ entityName }}
        <v-btn @click="reload" icon>
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>
      <slot name="extra-heading"/>
    </template>
    <v-toolbar
        dense
        color="white"
        flat
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
      <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          class="ml-auto"
          hide-details
          clearable
          :label="$t('Search')"
          single-line
          style="max-width: 250px;"
      />
    </v-toolbar>
    <v-divider class="mt-3"/>
    <v-data-table
        dense
        v-model="selectedItems"
        :show-expand="showExpand"
        :single-expand="singleExpand"
        :show-select="useSelect"
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
            adItem.dataType===Types.Group"
        >
          <v-chip
              v-bind:key="'_'+adItem.value+c"
              v-for="(c,index) in adItem.childKey.filter(adItem.displayChild)"
          >
            {{ item['_' + adItem.value + c] }}
          </v-chip>
        </template>
        <template
            v-else-if="
            adItem.dataType===Types.Boolean"
        >
          <v-simple-checkbox
              dense
              :key="adItem.name"
              :readonly="true"
              :value="!!item[adItem.value]"
              disabled
          />
        </template>
        <template
            v-else-if="
            adItem.dataType===Types.Color"
        >
          <v-chip
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
      <template  v-slot:footer>
        <general-form
            ref="gf"
            :title="entityName"
            :dialog="dialog"
            :edited-item="editedItem"
            :edited-index="editedIndex"
            :form-field="formField"
            @change-general-form="dialogChange"
        />
        <slot :items="items" :selectItems="selectedItems" name="footer">
          <v-toolbar
              class="mt-2"
              flat
              color="white"
          >
            <template v-if="selectedItems.length>0">
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
            <v-btn
                class="mb-2"
                color="primary"
                dark
                @click="$refs.gf.realDialog=true"
            >
              {{ $t(addText) }}
            </v-btn>
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
                class="mr-2"
                small
                @click="editItem(item)"
            >
              mdi-pencil
            </v-icon>
          </template>
          <template v-if="useDeleteAction">
            <v-icon
                small
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
  </material-card>
</template>

<script>

import GeneralForm from './GeneralForm'
import ImgTemplate from './ImgTemplate'
import MaterialCard from './MaterialCard'
import FormField from './FormField'
import { IKDataEntity } from '../../index'
import IKUtils from 'innerken-js-utils'

export default {
  name: 'IkDataTable',
  components: {
    ImgTemplate,
    GeneralForm,
    MaterialCard,
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

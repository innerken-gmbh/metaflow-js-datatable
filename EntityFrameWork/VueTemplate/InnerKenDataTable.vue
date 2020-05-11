<template>
  <base-material-card
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
    <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            class="ml-auto"
            hide-details
            label="Search"
            single-line
            style="max-width: 250px;"
    />
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
            {{ adItemList(adItem,item) }}
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
                :item="{ item }"
        />
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
    </v-data-table>
  </base-material-card>
</template>

<script>

  import GeneralForm from './GeneralForm'
  import { IKDataEntity, IKUtils } from 'innerken-utils'
  import ImgTemplate from './ImgTemplate'

  export default {
    name: 'InnerKenDataTable',
    components: {
      ImgTemplate,
      GeneralForm,
    },
    props: {
      entityName: {
        type: String,
        default: '',
      },
      icon: {
        type: String,
        default: '',
      },
      useAction: {
        type: Boolean,
        default: true,
      },
      model: {
        type: Object,
        default: () => {
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
      }
    },
    computed: {
      tableItem: function () {
        return this.items
      },
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
      adItemList: async function (adItem, item) {
        const list = await adItem.type.selectItems
        console.log(list.find(t => t[adItem.type.itemValue] === item[adItem.value])[adItem.type.itemText])
        return list.find(t => t[adItem.type.itemValue] === item[adItem.value])[adItem.type.itemText]
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
          IKUtils.safeCallFunction(this.model, this.model.edit, this.editedItem).then((res) => {
            IKUtils.toast(this.$i18n.t('编辑成功'))
            this.closeDialog()
          })
        } else {
          IKUtils.safeCallFunction(this.model, this.model.add, this.editedItem).then((res) => {
            IKUtils.toast(this.$i18n.t('添加成功'))
            this.closeDialog()
          })
        }
      },
      deleteItem (item) {
        IKUtils.showConfirm(
                this.$i18n.t('Are you sure?'),
                this.$i18n.t('you want to delete this item?'), () => {
                  IKUtils.safeCallFunction(this.model, this.model.delete, item.id)
                          .then(res => {
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
        this.loading = true
        this.items = await IKUtils.safeCallFunction(this.model, this.model.getList, true)
        this.loading = false
        // console.log(this.items)
      }
      ,
    }
    ,
  }
</script>

<style scoped>

</style>

<template>

  <v-navigation-drawer
      width="580px"
      color="#eeeeee"
      temporary
      right
      app
      touchless
      v-model="realDialog"
  >
    <v-container>
      <div class="d-flex align-center mb-4">
        <v-btn @click="close" class="mr-4 rounded" height="36px" width="36px" outlined tile icon>
          <v-icon size="24">mdi-arrow-left</v-icon>
        </v-btn>
        <div class="text-h3">
          {{ (editedItem['name'] || editedItem['dishName'] || title) }}
        </div>
        <v-spacer></v-spacer>
        <v-btn
            v-if="useDeleteAction"
            color="error darken-4"
            elevation="0"
            class="mr-4"
            @click="remove"
        >
          {{ $t('删除') }}
        </v-btn>
        <v-btn
            color="primary"
            elevation="0"
            class="mr-0"
            :disabled="!valid"
            @click="save"
        >
          {{ $t('Save') }}
        </v-btn>

      </div>
      <v-form ref="form" v-model="valid" lazy-validation>
        <div
        >
          <div class="flex-grow-1">
            <template v-for="(field,index) in groupedFields">
              <v-card flat :key="field.value+index+'group'" height="fit-content" class="pa-4 px-6 my-4">
                <h2 class="mb-6">
                  {{ $t('' + field.groupName) }}
                </h2>
                <div class="d-flex">
                  <div>
                    <v-tabs height="36px" v-model="tab">
                      <v-tab v-for="(child,i) in field.children"
                             :key="field.value+'c'+editedItem[field.value][i][field.childLabelKey]+'tab'"
                      >
                        {{ $t(editedItem[field.value][i][field.childLabelKey].toLowerCase()) }}
                      </v-tab>
                    </v-tabs>
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn
                      @click="copyToAll(field,editedItem[field.value])"
                      color="info"
                      class="mr-0"
                      elevation="0"
                      small
                      text
                      depressed
                  >
                    <v-icon left>mdi-content-copy</v-icon>
                    自动填充其他语言
                  </v-btn>
                </div>
                <v-card class="pa-4 py-3" outlined>
                  <v-tabs-items v-model="tab">
                    <v-tab-item v-for="(child,i) in field.children">
                      <template v-for="(c,t) in child">
                        <div :key="field.id+'t'+t+'c'+i">
                          <form-field
                              v-if="editedItem[field.value]"
                              :field="c"
                              :current-state="editedIndex"
                              :edited-item="editedItem[field.value][i]"
                              no-details
                          />
                        </div>
                      </template>
                    </v-tab-item>
                  </v-tabs-items>
                </v-card>

              </v-card>

            </template>

            <v-card flat height="fit-content" class="pa-4 px-6 my-4">
              <h2 class="mb-6"> {{ $t('必填信息') }}</h2>
              <div>
                <template v-for="(field,index) in requiredFields">

                  <div :key="'f1'+index"
                       class="my-4"
                  >
                    <form-field
                        :field="field"
                        :current-state="editedIndex"
                        :edited-item="editedItem"
                        no-details
                    />
                  </div>

                </template>

              </div>
            </v-card>
          </div>
          <v-card v-if="notRequiredFields.length>0" flat height="fit-content" class="pa-4 px-6 my-4">
            <h2 class="mb-6">{{ $t('选填信息') }}</h2>
            <div>
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
          </v-card>
        </div>
      </v-form>
    </v-container>
  </v-navigation-drawer>

</template>

<script>
import FormField from './FormField'
import { IKDataEntity } from '../../index'
import IkDataTable from './IkDataTable'

export default {
  name: 'GeneralForm',
  components: {
    FormField,
    IkDataTable,
  },
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
    useDeleteAction: { default: false },

  },
  data: function () {
    return {
      realDialog: this.dialog,
      valid: true,
      tab: null,
      IKDataEntity: IKDataEntity,
      detailModel: null,
      detailRefKey: null,
    }
  },

  computed: {
    requiredFields: function () {
      const res = this.notGroupedFields.filter(f => this.fieldIsRequired(f))
      return res
    },
    notRequiredFields: function () {
      const res = this.notGroupedFields.filter(f => !this.fieldIsRequired(f))
      return res
    },
    groupedFields: function () {
      return this.formField.filter(f => f.dataType === IKDataEntity.Types.Group)
    },
    notGroupedFields: function () {
      return this.formField.filter(f => f.dataType !== IKDataEntity.Types.Group)
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
    findLangEntityInLangArr (lang, arr) {
      return arr.find(d => d.lang.toLowerCase() === lang.toLowerCase()) ?? null
    },

    copyToAll (field, arr) {
      const [de, zh, en] = [this.findLangEntityInLangArr('DE', arr),
        this.findLangEntityInLangArr('ZH', arr),
        this.findLangEntityInLangArr('EN', arr)]
      console.log(field)
      for (const fieldKey of field.childKey) {
        const [deContent, zhContent, enContent] = [de, zh, en].map(it => it[fieldKey])
        const target = deContent || zhContent || enContent
        console.log(target)
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

    close () {
      this.realDialog = false
      this.$emit('change-general-form', false)
    },
    remove () {
      this.$emit('change-general-form', null, true)
    },

    save () {
      for (const f of this.groupedFields) {
        this.copyToAll(f, this.editedItem[f.value])
      }
      if (this.$refs.form.validate()) {
        this.$emit('change-general-form', true)
      }
    },
  },
}
</script>

<style scoped>

</style>

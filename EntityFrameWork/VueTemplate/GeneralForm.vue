<template>

  <v-navigation-drawer
      width="min(900px,calc(100vw - 300px))"
      color="#fafbfc"
      temporary
      right
      app
      touchless
      v-model="realDialog"
  >
    <v-container class="pa-6">
      <div class="d-flex align-center mb-8">
        <v-btn @click="close" class="mr-5 rounded" height="36px" width="36px" tile icon>
          <v-icon size="24">mdi-arrow-left</v-icon>
        </v-btn>
        <div class="text-h3 font-weight-bold">
          {{ editedIndex === -1 ? '新增' : '编辑/' }}{{ name }}
        </div>
        <v-spacer></v-spacer>


      </div>
      <v-form ref="form" v-model="valid" lazy-validation>
        <div
        >
          <div v-if="imageField">
            <form-field
                :field="imageField[0]"
                :current-state="editedIndex"
                :edited-item="editedItem"
                no-details
            />
          </div>
          <div class="flex-grow-1">
            <v-card outlined height="fit-content" class="pa-4 px-6 my-4">
              <template v-for="(field,index) in groupedFields">
                <div outlined :key="field.value+index+'group'">
                  <div class="d-flex align-center">
                    <div class="text-h4 font-weight-medium">
                      {{ $t('' + field.groupName) }}
                    </div>
                    <v-spacer/>
                    <div class="d-flex">
                      <div>
                        <v-tabs color="#232123" height="36px" v-model="tab">
                          <v-tab v-for="(child,i) in field.children"
                                 :key="field.value+'c'+editedItem[field.value][i][field.childLabelKey]+'tab'"
                          >
                            {{ $t(editedItem[field.value][i][field.childLabelKey].toLowerCase()) }}
                            <span class="red--text" v-if="i===0"
                            > * </span>
                          </v-tab>
                        </v-tabs>
                      </div>
                    </div>
                  </div>


                  <v-tabs-items v-model="tab" class="mt-8">
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


                </div>

              </template>
              <div>
                <div style="display: grid;grid-template-columns: repeat(2,1fr);grid-gap: 24px">
                  <template v-for="(field,index) in requiredFields">
                    <div :key="'f1'+index"
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
              </div>
            </v-card>
          </div>
          <v-card v-if="notRequiredFields.length>0" outlined height="fit-content" class="pa-4 px-6 mt-8">
            <div class="d-flex  mt-2 ">
              <div class="text-h4 font-weight-medium">{{ $t('选填信息') }}</div>
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
              以下的内容并不是必需填写的。我们会为您自动准备好相应的内容。点击以编辑。<br><br>
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
                      Array.isArray(editedItem[field.value]) ? editedItem[field.value].length + '个' : editedItem[field.value]
                    }}
                  </template>
                </v-chip>
              </template>
            </div>
          </v-card>
          <div class="mt-8 pl-1">
            <v-btn
                color="primary"
                elevation="0"
                class="mr-4"
                :disabled="!valid"
                @click="save"
            >
              {{ $t('保存改动') }}
            </v-btn>
            <v-btn
                outlined
                v-if="editedIndex===-1"
                elevation="0"
                class="mr-0"
                :disabled="!valid"
                @click="save(false)"
            >
              {{ $t('保存并继续添加') }}
            </v-btn>
          </div>

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

  },

  data: function () {
    return {
      realDialog: this.dialog,
      valid: true,
      tab: null,
      IKDataEntity: IKDataEntity,
      showOptionalField: false,
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
    notImageField: function () {
      return this.formField.filter(f => f.dataType
          !== IKDataEntity.Types.Image)
    },
    name () {
      return (this?.editedItem?.name ?? this.editedItem?.dishName ?? this.title)
    },
  },
  watch: {
    realDialog (val) {
      if (val) {
        this.$refs.form.resetValidation()
      }
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

    save (close=true) {
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

<template>

  <v-dialog
      fullscreen
      v-model="realDialog"
  >
    <v-card tile color="#f6f6f6">
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
              color="success darken-4"
              elevation="0"
              class="mr-0"
              :disabled="!valid"
              @click="save"
          >
            {{ $t('Save') }}
          </v-btn>

        </div>
        <v-form ref="form" v-model="valid" lazy-validation>
          <div style="display: grid;grid-template-columns: auto 400px;grid-gap: 20px">
            <div>
              <template v-for="(field,index) in groupedFields">
                <v-card :key="field.value+index+'group'" height="fit-content" class="pa-4 px-6 my-4">
                  <h2 class="mb-6">
                    {{ $t('' + field.groupName) }}
                  </h2>

                  <div
                      class="my-2"
                      style="grid-column: 1/3"
                      :key="'f2'+index"
                  >

                    <div>
                      <template v-for="(child,i) in field.children">
                        <div class="py-0">
                                <span
                                    class="subtitle-1 grey--text font-weight-bold"
                                >{{ $t(editedItem[field.value][i][field.childLabelKey]) }}</span>
                        </div>
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
                      </template>
                    </div>
                  </div>
                </v-card>

              </template>


              <v-card height="fit-content" class="pa-4 px-6 my-4">
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

            <v-card height="fit-content" class="pa-4 px-6 my-4">
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

    </v-card>
  </v-dialog>

</template>

<script>
import FormField from './FormField'
import { IKDataEntity } from '../../index'

export default {
  name: 'GeneralForm',
  components: { FormField },
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
    fieldIsRequired (field) {
      return field.required && (
          (field.requiredEdit && this.editedIndex !== -1) ||
          (field.requiredNew && this.editedIndex === -1))
    },

    close () {
      this.realDialog = false
      this.$emit('change-general-form', false)
    },

    save () {
      if (this.$refs.form.validate()) {
        this.$emit('change-general-form', true)
      }
    },
  },
}
</script>

<style scoped>

</style>

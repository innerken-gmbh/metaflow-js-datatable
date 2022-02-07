<template>

  <v-dialog
      :fullscreen="$vuetify.breakpoint.smAndDown"
      v-model="realDialog"
      max-width="80vw"
  >
    <v-card>
      <v-toolbar dense flat color="primary" dark>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer/>
        <v-btn
            text
            @click="close"
        >
          {{ $t('Cancel') }}
        </v-btn>
        <v-btn
            text
            :disabled="!valid"
            @click="save"
        >
          {{ $t('Save') }}
        </v-btn>
      </v-toolbar>

      <div
          style="display: grid; grid-template-columns: 200px auto; max-height: 90vh; padding-right: 28px"
      >


        <v-tabs vertical v-model="tab" >
          <v-tab>
            <v-icon left>mdi-menu</v-icon>
            {{ $t('必填信息') }}
          </v-tab>
          <v-tab>
            <v-icon left>mdi-dots-vertical</v-icon>
            {{ $t('选填信息') }}
          </v-tab>
        </v-tabs>

        <div style="overflow: scroll; max-height: 90vh; padding-top: 5px">
          <v-tabs-items v-model="tab" >
            <v-tab-item >
              <div style="display: grid; grid-template-columns: repeat(2,1fr); grid-column-gap: 40px">


                <template v-for="(field,index) in requiredFields">
                  <template v-if="field.dataType===IKDataEntity.Types.Group">
                    <div
                        style="grid-column: 1/3"
                        :key="'f1'+index"
                    >
                      <div class="display-1 font-weight-bold mt-3">
                        <span>{{ $t('' + field.groupName) }}</span>
                      </div>

                      <div style="display: grid; grid-template-columns: repeat(2,1fr); grid-column-gap: 40px">
                        <template v-for="(child,i) in field.children">
                          <div style="grid-column: 1 / 3" class="py-0 mt-1">
                        <span class="subtitle-1 grey--text font-weight-bold">
                          {{ $t(editedItem[field.value][i][field.childLabelKey]) }}</span>
                          </div>

                          <template v-for="(c,t) in child">
                            <div class="px-0" :key="field.id+'t'+t+'c'+i">
                              <form-field
                                  v-if="editedItem[field.value]"
                                  :field="c"
                                  :current-state="editedIndex"
                                  :edited-item="editedItem[field.value][i]"
                              />
                            </div>
                          </template>
                        </template>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <!--                  <div :key="'f1'+index">-->
                    <!--                    <form-field-->
                    <!--                      :field="field"-->
                    <!--                      :current-state="editedIndex"-->
                    <!--                      :edited-item="editedItem"-->
                    <!--                    />-->
                    <!--                  </div>-->

                    <div :key="'f1'+index"
                    >
                      <form-field
                          :field="field"
                          :current-state="editedIndex"
                          :edited-item="editedItem"
                      />
                    </div>
                    <template v-if="field.dataType===IKDataEntity.Types.Image ">
                      <v-spacer></v-spacer>
                    </template>


                  </template>
                </template>

              </div>
            </v-tab-item>
            <v-tab-item >

              <div style="display: grid; grid-template-columns: repeat(2,1fr); grid-column-gap: 40px">
                <template v-for="(field,index) in notRequiredFields">
                  <template v-if="field.dataType===IKDataEntity.Types.Group">
                    <div
                        style="grid-column: 1/3"
                        :key="'f2'+index"
                    >
                      <div class="d-flex justify-space-between align-center">
                        <span class="subtitle-1 font-weight-bold">{{ $t('' + field.groupName) }}</span>
                      </div>

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
                              />
                            </div>
                          </template>
                        </template>
                      </div>
                    </div>
                  </template>
                  <template v-else>

                    <div :key="'f2'+index"
                         :style="field.dataType===IKDataEntity.Types.Image ? {'grid-column': '1/3', 'width':'50%'}:{}"
                    >
                      <form-field
                          :field="field"
                          :current-state="editedIndex"
                          :edited-item="editedItem"
                      />
                    </div>
                    <!--                  <template v-if="field.dataType===IKDataEntity.Types.Image">-->
                    <!--                    <v-spacer></v-spacer>-->
                    <!--                  </template>-->

                  </template>
                </template>
              </div>
            </v-tab-item>
          </v-tabs-items>
        </div>
      </div>

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
      return this.formField.filter(f => this.fieldIsRequired(f))
    },
    notRequiredFields: function () {
      return this.formField.filter(f => !this.fieldIsRequired(f))
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
      this.$emit('change-general-form', true)
    },
  },
}
</script>

<style scoped>

</style>

<template>

    <v-dialog
            v-model="realDialog"
            max-width="500px"
    >
        <v-card>
            <v-card-title>
                <span class="headline">{{ title }}</span>
            </v-card-title>
            <v-card-text>
                <v-form
                        v-model="valid"
                        :lazy-validation="false"
                >
                    <v-container>
                        <v-row>
                            <template v-for="field in realFormField">
                                <template v-if="field.dataType===IKDataEntity.Types.Group">
                                    <v-col
                                            cols="12"
                                    >
                                        <div class="d-flex justify-space-between align-center">
                                            <span class="subtitle-1 font-weight-bold">{{ $t(''+field.groupName) }}</span>
                                        </div>
                                        <v-row>

                                            <template v-for="(child,i) in field.children">
                                                <v-col cols="12">
                                                    <span class="subtitle-1 font-weight-bold">{{ $t(editedItem[field.value][i][field.childLabelKey]) }}</span>
                                                </v-col>
                                                <template v-for="(c,t) in child">
                                                    <form-field
                                                            v-if="editedItem[field.value]"
                                                            :key="field.id+'t'+t+'c'+i"
                                                            :field="c"
                                                            :current-state="editedIndex"
                                                            :edited-item="editedItem[field.value][i]"
                                                    />
                                                </template>
                                            </template>
                                        </v-row>
                                    </v-col>

                                </template>
                                <template v-else>
                                    <form-field
                                            :key="field.id"
                                            :field="field"
                                            :current-state="editedIndex"
                                            :edited-item="editedItem"
                                    />
                                </template>
                            </template>
                        </v-row>
                    </v-container>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer/>
                <v-btn
                        color="blue darken-1"
                        text
                        @click="close"
                >
                    {{ $t('Cancel') }}
                </v-btn>
                <v-btn
                        :disabled="!valid"
                        color="blue darken-1"
                        text
                        @click="save"
                >
                    {{ $t('Save') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script>
import FormField from './FormField'
import { IKDataEntity } from 'innerken-utils'

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
      IKDataEntity: IKDataEntity,
      realFormField: this.formField.map((i, index) => {
        return {
          id: index,
          ...i,
        }
      }),
    }
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

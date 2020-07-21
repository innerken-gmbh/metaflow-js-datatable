<template>
    <v-sheet
            v-if="(currentState===-1&&inNew)||(currentState>-1&&inEdit)"
    >
        <template v-if="type.name==='text'">
            <v-text-field
                    :hide-details="noDetails"
                    v-model="editedItem[value]"
                    :disabled="shouldDisable"
                    :rules="rules"
                    :label="text"
            />
        </template>
        <template v-else-if="type.name==='select'">
            <v-select
                    :hide-details="noDetails"
                    v-model="editedItem[value]"
                    :disabled="shouldDisable"
                    :items="selectItems"
                    :item-text="type.itemText"
                    :item-value="type.itemValue"
                    :multiple="type.multiple"
                    :label="text"
                    :rules="rules"
            />
        </template>
        <template v-else-if="type.name==='switch'">
            <v-switch
                    v-model="editedItem[value]"
                    :disabled="shouldDisable"
                    :label="text"
                    :rules="rules"
            />
        </template>
        <template v-else-if="type.name==='image'">
            <div>
                <img-with-loading
                        v-if="editedItem[type.fileStorage]"
                        :height="'200px'"
                        :img-src="uploadUrl"
                />
                <template
                        v-else-if="currentState>-1"
                >
                    <img-with-loading
                            :height="'200px'"
                            :img-src="root + editedItem[value]"
                    />
                </template>
            </div>
            <v-file-input
                    v-model="editedItem[type.fileStorage]"
                    :disabled="shouldDisable"
                    :label="text"
                    :rules="rules"
                    show-size
                    counter
            />
        </template>
        <template v-else-if="type.name==='switch'">
            <v-switch
                    v-model="editedItem[value]"
                    :disabled="shouldDisable"
                    :label="text"
                    :rules="rules"
            />
        </template>
        <template v-else-if="type.name==='time'">
            <v-dialog
                    ref="dialog"
                    v-model="timePickerShow"
                    :return-value.sync="editedItem[value]"
                    persistent
                    width="290px"
            >
                <template v-slot:activator="{ on }">
                    <v-text-field
                            v-model="editedItem[value]"
                            :label="text"
                            prepend-icon="mdi-clock-outline"
                            readonly
                            v-on="on"
                    />
                </template>
                <v-time-picker
                        v-if="timePickerShow"
                        v-model="editedItem[value]"
                        full-width
                >
                    <v-spacer/>
                    <v-btn
                            text
                            color="primary"
                            @click="timePickerShow = false"
                    >
                        {{ $t('Cancel') }}
                    </v-btn>
                    <v-btn
                            text
                            color="primary"
                            @click="$refs.dialog.save(editedItem[value])"
                    >
                        {{ $t('OK') }}
                    </v-btn>
                </v-time-picker>
            </v-dialog>
        </template>
        <template v-else-if="type.name==='date'">
            <v-dialog
                    ref="dialog"
                    v-model="datePickerShow"
                    :return-value.sync="editedItem[value]"
                    persistent
                    width="290px"
            >
                <template v-slot:activator="{ on }">
                    <v-text-field
                            v-model="editedItem[value]"
                            :label="text"
                            prepend-icon="mdi-clock-outline"
                            readonly
                            v-on="on"
                    />
                </template>
                <v-date-picker
                        v-if="datePickerShow"
                        v-model="editedItem[value]"
                        full-width
                        :locale="locale"
                >
                    <v-spacer/>
                    <v-btn
                            text
                            color="primary"
                            @click="datePickerShow = false"
                    >
                        {{ $t('Cancel') }}
                    </v-btn>
                    <v-btn
                            text
                            color="primary"
                            @click="$refs.dialog.save(editedItem[value])"
                    >
                        {{ $t('OK') }}
                    </v-btn>
                </v-date-picker>
            </v-dialog>
        </template>
        <template v-else>
            <slot/>
        </template>
    </v-sheet>
</template>

<script>

import ImgWithLoading from './ImgWithLoading'
import Utils from '../../Utlis/Utils'

export default {
  name: 'FormField',
  components: { ImgWithLoading },
  props: {
    field: {
      type: Object,
      default: () => {
      },
    },
    editedItem: {
      type: Object,
      default: () => {
      },
    },
    currentState: {
      type: Number,
      default: -1,
    },
    noDetails: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    // console.log(this.field)
    return {
      timePickerShow: false,
      datePickerShow: false,
      ...this.field,
    }
  },
  computed: {
    selectItems: function () {
      let selectItems = []
      const post = (items) => {
        let result = []
        if (typeof this.type.disabledItem === 'function') {
          result = items.map((item) => this.type.disabledItem(item, this.editedItem))
        } else {
          result = items.map(item => ({
            ...item,
            disabled: false,
          }))
        }
        return result
      }
      if (typeof this.type.selectItems === 'function') {
        if (this.type.selectItems().then) {
          this.type.selectItems().then(res => {
            res = post(res)
            this.type.selectItems = res
          })
        } else {
          selectItems = this.type.selectItems()
        }
      } else {
        selectItems = this.type.selectItems
      }
      selectItems = post(selectItems)
      return selectItems
    },
    uploadUrl: function () {
      return URL.createObjectURL(this.editedItem[this.type.fileStorage])
    },
    isNew: function () {
      return this.currentState === -1
    },
    shouldDisable: function () {
      return (this.disableNew && this.isNew) ||
        (this.disableEdit && !this.isNew)
    },
    rules: function () {

      let rules = this.rule
      if (this.required && this.type.name !== 'switch') {
        if (!this.overwriteRule) {
          if (this.isNew && this.requiredNew) {
            rules = rules.concat(Utils.ValidateRules.NotEmpty)
          } else if (!this.isNew && this.requiredEdit) {
            rules = rules.concat(Utils.ValidateRules.NotEmpty)
          }
        }

      }
      return rules
    },
    locale: function () {
      let locale = this.dateLocale
      return locale
    },
    root: function () {
      return typeof this.type.root === 'function' ? this.type.root() : this.type.root
    },
  },
}
</script>

<style scoped>

</style>

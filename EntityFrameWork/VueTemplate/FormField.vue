<template>
  <v-sheet
      v-if="(currentState===-1&&inNew)||(currentState>-1&&inEdit)"
  >
    <template v-if="type.name==='text'">
      <v-text-field
          dense
          :hide-details="noDetails"
          v-model="editedItem[value]"
          :disabled="shouldDisable"
          :rules="rules"
          :label="text"
      />
    </template>
    <template v-else-if="type.name==='select'">
      <v-select
          dense
          clearable
          @click:clear="$emit('clear')"
          :hide-details="noDetails"
          v-model="editedItem[value]"
          :disabled="shouldDisable"
          :items="selectItemList"
          :item-text="type.itemText"
          :item-value="type.itemValue"
          :multiple="type.multiple"
          :label="text"
          :rules="rules"
      />
    </template>
    <template v-else-if="type.name==='switch'">
      <v-checkbox
          dense
          hide-details
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
          dense
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
              dense
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
              dense
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
    <template v-else-if="type.name==='color'">
      <v-text-field
          dense
          v-model=editedItem[value]
          hide-details
          :label="text"
      >
        <template
            v-slot:append
        >
          <v-menu
              v-model="colorPickerShow"
              top
              nudge-bottom="105"
              nudge-left="16"
              :close-on-content-click="false"
          >
            <template v-slot:activator="{ on }">
              <div
                  :style="swatchStyle"
                  v-on="on"
              />
            </template>
            <v-card>
              <v-card-text
                  class="pa-0"
              >
                <v-color-picker
                    v-model="editedItem[value]"
                    flat
                />
              </v-card-text>
            </v-card>
          </v-menu>
        </template>
      </v-text-field>
    </template>
    <template v-else>
      <slot/>
    </template>
  </v-sheet>
</template>

<script>

import ImgWithLoading from './ImgWithLoading'
import Utils from 'innerken-js-utils'

export default {
  name: 'FormField',
  components: { ImgWithLoading },
  props: {
    field: {
      type: Object,
      default: () => {
      }
    },
    editedItem: {
      type: Object,
      default: () => {
      }
    },
    currentState: {
      type: Number,
      default: -1
    },
    noDetails: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      timePickerShow: false,
      datePickerShow: false,
      colorPickerShow: false,
      ...this.field
    }
  },
  computed: {
    swatchStyle () {
      const { colorPickerShow } = this
      return {
        backgroundColor: this.editedItem.color,
        cursor: 'pointer',
        height: '30px',
        width: '30px',
        borderStyle: 'solid',
        borderColor: '#c1c1c1',
        borderWidth: '1px',
        borderRadius: colorPickerShow ? '50%' : '4px',
        transition: 'border-radius 200ms ease-in-out'
      }
    },
    selectItemsIsDynamic: function () {
      return typeof this.type.selectItems === 'function'
    },
    selectItemList: function () {
      let selectItems = []
      const post = (items) => {
        let result = []
        if (typeof this.type.disabledItem === 'function') {
          result = items.map((item) => this.type.disabledItem(item, this.editedItem))
        } else {
          result = items.map(item => ({
            ...item,
            disabled: false
          }))
        }
        return result
      }
      if (this.selectItemsIsDynamic) {
        selectItems = this.type._selectItems ? this.type._selectItems : []
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
      const locale = this.dateLocale
      return locale
    },
    root: function () {
      return typeof this.type.root === 'function' ? this.type.root() : this.type.root
    }
  },
  watch: {
    editedItem: {
      deep: true,
      handler: function (val) {
        this.preProcessOptions()
      }
    }
  },
  methods: {
    async preProcessOptions () {
      if (this.selectItemsIsDynamic) {
        if (this.type.selectItems().then) {
          const res = await this.type.selectItems()
          this.$set(this.type, '_selectItems', res)
        } else {
          this.$set(this.type, '_selectItems', this.type.selectItems())
        }
      }
    }
  },
  mounted () {
    this.preProcessOptions()
  }
}
</script>

<style scoped>

</style>

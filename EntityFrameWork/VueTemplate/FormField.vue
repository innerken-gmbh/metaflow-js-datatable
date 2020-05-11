<template>
  <v-col
    v-if="(currentState===-1&&inNew)||(currentState>-1&&inEdit)"
    :cols="cols"
    :md="md"
    :sm="sm"
  >
    <template v-if="type.name==='text'">
      <v-text-field
        v-model="editedItem[value]"
        :disabled="shouldDisable"
        :rules="rules"
        :label="text"
      />
    </template>
    <template v-else-if="type.name==='select'">
      <v-select
        v-model="editedItem[value]"
        :disabled="shouldDisable"
        :items="typeof type.selectItems==='function'?
          type.selectItems()
          :type.selectItems"
        :item-text="type.itemText"
        :item-value="type.itemValue"
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
      <div
        v-if="currentState>-1"
      >
        <img-with-loading
          :height="'200px'"
          :img-src="root + editedItem[value]"
        />
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
            Cancel
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="$refs.dialog.save(editedItem[value])"
          >
            OK
          </v-btn>
        </v-time-picker>
      </v-dialog>
    </template>
    <template v-else>
      <slot/>
    </template>
  </v-col>
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
    },
    data: function () {
      // console.log(this.field)
      return {
        timePickerShow: false,
        ...this.field,
      }
    },
    computed: {
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
          if (this.isNew && this.requiredNew) {
            rules = rules.concat(Utils.ValidateRules.NotEmpty)
          } else if (!this.isNew && this.requiredEdit) {
            rules = rules.concat(Utils.ValidateRules.NotEmpty)
          }
        }
        return rules
      },
      root: function () {
        return typeof this.type.root === 'function' ? this.type.root() : this.type.root
      },
    },
  }
</script>

<style scoped>

</style>

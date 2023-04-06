<template>
    <div
            v-if="(currentState===-1&&inNew)||(currentState>-1&&inEdit)"
    >
        <div v-if="type.name!=='image'&&text&&!hideSelect" class="pb-1">
            <div class="text-caption">
                {{ $t(text) }}
                <span v-if="text&&required&&!hideSelect" class="red--text text-body-1">*</span>
            </div>
            <template v-if="hint">
                <div class="text-caption text--secondary">{{ $t(hint) }}</div>
            </template>
        </div>
        <template v-if="type.name==='text'">

            <v-text-field
                    v-if="!textArea"
                    outlined
                    v-model="editedItem[value]"
                    :disabled="shouldDisable"
                    :rules="rules"
            />
            <v-textarea
                    v-else
                    auto-grow
                    outlined
                    counter
                    rows="1"
                    v-model="editedItem[value]"
                    :disabled="shouldDisable"
                    :rules="rules"
                    :counter="maxLength||''"
            />
        </template>
        <template v-if="type.name==='float'">
            <v-text-field
                    outlined
                    v-model="editedItem[value]"
                    :disabled="shouldDisable"
                    :rules="rules"
                    type="number"
                    step="0.01"
            >
                <template #append>€</template>
            </v-text-field>
        </template>
        <template v-if="type.name==='integer'">
            <v-text-field
                    outlined
                    v-model="editedItem[value]"
                    :disabled="shouldDisable"
                    :rules="rules"
                    type="number"
                    step="1"
            >
            </v-text-field>
        </template>
        <template v-else-if="type.name==='select'">
            <v-select
                    outlined
                    :placeholder="$t(text)"
                    :menu-props="{offsetY:true, outlined:true, contentClass:'elevation-2 ikRounded',
          nudgeBottom:'16px',closeOnContentClick: !type.multiple,}"
                    @click:clear="$emit('clear')"
                    v-model="editedItem[value]"
                    :disabled="shouldDisable"
                    :items="selectItemList"
                    :item-text="type.itemText"
                    :item-value="type.itemValue"
                    :multiple="type.multiple"
                    :rules="rules"
                    :clearable="hideSelect"
            >
                <template v-if="type.showButton&&!hideSelect" v-slot:prepend-item>
                    <v-list-item @click="$emit('click')">
                        <v-list-item-content>
                            <v-list-item-title class="primary--text">{{ $t('NewOthers') }}{{ text }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider></v-divider>
                </template>
                <template v-if="hideSelect" v-slot:selection="{ item, index }">
          <span
                  v-if="index==0"
                  class="grey--text text-caption"
          >
          {{ $t(text) }}({{ showText(item) }})
        </span>
                </template>
            </v-select>
        </template>
        <template v-else-if="type.name==='switch'">
            <v-select
                    outlined

                    :placeholder="$t(text)"
                    :menu-props="{offsetY:true, outlined:true, contentClass:'elevation-2 ikRounded',
          nudgeBottom:'16px',closeOnContentClick: !type.multiple,}"
                    @click:clear="$emit('clear')"
                    v-model="editedItem[value]"
                    :disabled="shouldDisable"
                    :items="[{text:$t('yes'),value:true},{text:$t('no'),value:false}]"
                    :rules="rules"
                    :clearable="hideSelect"
            />

        </template>
        <template v-else-if="type.name==='image'">
            <div class="d-flex flex-column align-center">
                <v-card @click="startUpload" width="160px" height="160px" flat color="#eeeeee"
                        class="d-flex justify-center align-center"
                >
                    <img-with-loading
                            v-if="editedItem[type.fileStorage]"
                            :height="'160px'"
                            :img-src="uploadUrl"
                    />
                    <template
                            v-else-if="currentState>-1"
                    >
                        <img-with-loading
                                :height="'160px'"
                                :img-src="root + editedItem[value]"
                        />
                    </template>
                    <v-btn absolute style="right: -12px" bottom fab x-small color="primary">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-card>
                <v-file-input
                        outlined
                        dense
                        ref="file"
                        style="height: 0px;opacity: 0"
                        class="mt-2"
                        prepend-icon=""
                        prepend-inner-icon="mdi-file"
                        :hide-details="noDetails"
                        :placeholder="$t(text)"
                        v-model="editedItem[type.fileStorage]"
                        :disabled="shouldDisable"
                        :label="$t(text)"
                        :rules="rules"
                        show-size
                        counter
                />
                <div class="text-caption text--secondary">{{ $t(hint) }}</div>

            </div>

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
                    <div>
                        <v-text-field
                                outlined
                                v-model="editedItem[value]"
                                prepend-inner-icon="mdi-clock-outline"
                                readonly
                                v-on="on"
                        />
                    </div>

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
                            :placeholder="$t(text)"
                            :dense="!fullHeight"
                            v-model="editedItem[value]"
                            :label="$t(text)"
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
            <v-item-group mandatory v-model="editedItem[value]">
                <div style="display: grid;
        grid-template-columns: repeat(auto-fill,48px);
        grid-gap: 4px;"
                >
                    <v-item
                            :key="color"
                            v-for="color in colorList"
                            :value="color"
                            v-slot="{active,toggle}"
                    >
                        <v-card
                                @click="toggle" :color="color"
                                width="48px" height="48px"
                                class="d-flex align-center justify-center"
                        >
                            <v-icon v-if="active">mdi-check</v-icon>
                        </v-card>
                    </v-item>
                </div>

            </v-item-group>

        </template>
        <template v-else>
            <slot/>
        </template>

    </div>
</template>

<script>
export const colorList = ['#FFCDD2', '#F8BBD0', '#E1BEE7',
    '#D1C4E9', '#C5CAE9', '#BBDEFB',
    '#B3E5FC', '#B2EBF2', '#B2DFDB',
    '#C8E6C9', '#DCEDC8', '#F0F4C3',
    '#FFF9C4', '#FFECB3', '#FFE0B2',
    '#FFCCBC', '#D7CCC8', '#CFD8DC', '#FFFFFF']
import ImgWithLoading from './Base/ImgWithLoading'
import Utils from 'innerken-js-utils'

const noSpecialCharRule=v=>!/[',"]/g.test(v)||'不能使用单引号或双引号'

export function getColorLightness (c) {
    if (c?.startsWith('#')) {
        if (c.length < 5) {
            c += 'fff'
        }
        const rgb = parseInt(c.substring(1), 16) // convert rrggbb to decimal
        const r = (rgb >> 16) & 0xff // extract red
        const g = (rgb >> 8) & 0xff // extract green
        const b = (rgb >> 0) & 0xff // extract blue
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    } else {
        return 0
    }
}

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
        onToolbar: {
            type: Boolean,
            default: false,
        },
        fullHeight: { default: false },
        hideSelect: { default: false },
        solo: { default: false },
        outsideDisabled: { default: false },
    },
    data: function () {
        return {
            colorList,
            timePickerShow: false,
            datePickerShow: false,
            textArea: false,
            hint: '',
            ...this.field,
        }
    },
    computed: {

        selectItemsIsDynamic: function () {
            return typeof this?.type?.selectItems === 'function'
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
                        disabled: false,
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
            return this.outsideDisabled||
                (this.disableNew && this.isNew) ||
                (this.disableEdit && !this.isNew)
        },
        rules: function () {
            let rules = this.rule
            if (this.required && this.type.name !== 'switch') {
                if (!this.overwriteRule) {
                    if (this.isNew && this.requiredNew) {
                        rules = rules.concat(Utils.ValidateRules.NotEmpty)
                        rules.push(noSpecialCharRule)
                    } else if (!this.isNew && this.requiredEdit) {
                        rules = rules.concat(Utils.ValidateRules.NotEmpty)
                        rules.push(noSpecialCharRule)
                    }
                }
            }
            return this.hideSelect ? [] : rules
        },
        locale: function () {
            const locale = this.dateLocale
            return locale
        },
        root: function () {
            return typeof this.type.root === 'function' ? this.type.root() : this.type.root
        },
    },
    watch: {
        editedItem: {
            deep: true,
            handler: function (val) {
                // console.log("type flag 3 editedItem",this.editedItem)
                this.preProcessOptions()
            },
        },
    },
    methods: {
        showText (item) {
            const value = this.editedItem[this.value]
            return Array.isArray(value) ? '+' + value.length : item[this.type.itemText]
        },
        startUpload () {
            console.log(this.$refs.file.$refs.input)
            this.$refs.file.$refs.input.click()
        },
        colorIsDark (color) {
            return getColorLightness(color) < 128
        },
        async preProcessOptions () {
            // console.log("type flag 2")
            if (this.selectItemsIsDynamic) {
                if (this.type.selectItems().then) {
                    const res = await this.type.selectItems()
                    this.$set(this.type, '_selectItems', res)
                } else {
                    this.$set(this.type, '_selectItems', this.type.selectItems())
                }
            }
        },
    },
    mounted () {
        this.preProcessOptions()
    },
}
</script>

<style scoped>

</style>

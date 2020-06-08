import Utils from '../Utlis/Utils.js'
import { hillo, IKUtils } from '../index'

export const Types = {
    Integer: Symbol('Type:Integer'),
    Float: Symbol('Type:Float'),
    String: Symbol('Type:String'),
    Boolean: Symbol('Type:Boolean'),
    Object: Symbol('Type:Object'),
    Image: Symbol('Type:Image'),
    Time: Symbol('Type:Time'),
    Option: Symbol('Type:Option'),
    Group: Symbol('Type:Group'),
    getTypeDefault (type) {
        if (!type) {
            type = Types.String
        }
        if (type === Types.Integer) {
            return -1
        } else if (type === Types.Float) {
            return 0
        } else if (type === Types.String) {
            return ''
        } else if (type === Types.Boolean) {
            return false
        } else if (type === Types.Object) {
            return null
        } else if (type === Types.Image) {
            return ''
        } else if (type === Types.Time) {
            return ''
        } else if (type === Types.Option) {
            return []
        } else if (type === Types.Group) {
            return []
        } else {
            return undefined
        }
    },
    parseValue (type, value) {
        if (type === Types.Integer) {
            return parseInt(value)
        } else if (type === Types.Float) {
            return parseFloat(value)
        } else if (type === Types.Boolean) {
            return parseInt(value)
        } else if (type === Types.Option) {
            if (value.includes(',')) {
                return value.split(',').map(item => parseInt(item))
            }
            return parseInt(value)
        } else if (type === Types.Group) {
            return value
        } else {
            return value
        }
    },
}

Object.freeze(Types)

export async function generalLoad (url, data) {
    return (await hillo.get(url, { ...data }))

}

/**
 * @param {function(*=, ...[*]=): null} asyncListFunc
 * @param {*} conditionFunc
 */
export async function generalGetOne (asyncListFunc, conditionFunc) {
    const _list = await asyncListFunc()
    return _list.find(item => conditionFunc(item))
}

export function ModelFactory (entity, config) {
    let list = config.list || null

    const load = config.load || async function () {
        return []
    }
    const add = function () {
        return new Promise.reject('Add is not Definded')
    }
    const edit = function () {
        return new Promise.reject('Add is not Definded')
    }
    const remove = function () {
        return new Promise.reject('Add is not Definded')
    }
    let loading = false
    const getList = async function (force = false, ...filter) {

        if (!list || force) {
            if (!loading) {
                loading = true
                list = await load(filter)
                const cache = {}

                list.filter(i => !i['__parsed']).forEach(i => {
                    try {
                        i = parseDataForEntity(i, entity, cache)
                    } catch (e) {
                        console.error(e)
                    }

                })

                loading = false
            } else {
                await IKUtils.wait(0.2)
                return await getList()
            }
        }

        return list
    }
    const getOne = async function (conditionFunc) {
        return generalGetOne(getList, conditionFunc)
    }

    const DefaultConfig = {
        getList,
        add,
        edit,
        remove,
        getOne,
    }

    config = IKUtils.extend(DefaultConfig, config)

    return {
        entity,
        ...config,
    }

}

const DefaultEntity = {
    value: '',
    displayName: '',
    type: Types.String,
    form: true, // shows in form
    header: true, // shows in header
    formConfig: {
        default: '',
        cols: 12,
        md: 6,
        merge: true,
        sm: 12,
        type: { name: 'text' },
        // PossibleValue of types
        /*
        Text:{ name: 'text' }
        Select:
          {
            name:'select',
            selectItems:[],//options
            itemText:'',//bind-item-key
            itemValue:''//bind-item-key
           }
        Switch:{name:'switch'}
        File:
          {
            name:'file',
            root:'',//root of src images
            fileStorage:''//fileStorageItemKey will generate a key auto, default:file
           }
        * */
        inNew: true,
        inEdit: true,
        disableNew: false,
        disableEdit: false,
        rule: [],
        required: true,
        requiredEdit: true,
        requiredNew: true,
    },
    tableConfig: {
        overwrite: false,
        displayChild: () => true,
    },
}
const GroupTableConfig = {
    displayChild: () => true,
}
const TimeFormConfig = {
    type: { name: 'time' },
}

const OptionFormConfig = {
    type: {
        name: 'select',
        itemText: 'name',
        itemValue: 'id',
        selectItems: [],
        multiple: false,
    },
}

const ImageFormConfig = {
    type: {
        name: 'image',
        root: () => '/',
        fileStorage: 'file',
    },
}

const BooleanFormConfig = {
    type: {
        name: 'switch',
    },
}

/**
 * @param {*} _field
 * @param {string} key
 */
function generateField (_field, key) {
    if (_field.type === Types.Boolean) {
        if (_field.formConfig) {
            if (_field.formConfig.type) {
                _field.formConfig.type = Utils.extend(BooleanFormConfig.type, _field.formConfig.type)
            }
        }
        _field.formConfig = Utils.extend(BooleanFormConfig, _field.formConfig)
    }
    if (_field.type === Types.Time) {
        if (_field.formConfig) {
            if (_field.formConfig.type) {
                _field.formConfig.type = Utils.extend(TimeFormConfig.type, _field.formConfig.type)
            }
        }
        _field.formConfig = Utils.extend(TimeFormConfig, _field.formConfig)
    }
    if (_field.type === Types.Image) {
        if (_field.formConfig) {
            if (_field.formConfig.type) {
                _field.formConfig.type = Utils.extend(ImageFormConfig.type, _field.formConfig.type)
            }
        }
        _field.formConfig = Utils.extend(ImageFormConfig, _field.formConfig)
    }
    if (_field.type === Types.Option) {
        if (_field.formConfig) {
            if (_field.formConfig.type) {
                _field.formConfig.type = Utils.extend(OptionFormConfig.type, _field.formConfig.type)
            }
        }
        _field.formConfig = Utils.extend(OptionFormConfig, _field.formConfig)
    }
    let _children = []
    if (_field.type === Types.Group) {
        if (_field.children) {
            _field.childKey = [_field.childKey].flat()
            _children = _field.children.map(item => getFieldFromModel(item))
            const newChildren = []
            _children.forEach(child => {
                child = child.filter(i => {
                    return _field.childKey.includes(i.value)
                })
                newChildren.push(child)
            })
            _children = newChildren
        }
        if (!_field.tableConfig.displayChild) {
            _field.tableConfig.displayChild = GroupTableConfig.displayChild
        }
    }
    _field.formConfig = Utils.extend(DefaultEntity.formConfig, _field.formConfig)
    const field = Utils.extend(DefaultEntity, _field)
    return {
        value: key,
        text: field.displayName ? field.displayName : key,
        dataType: field.type,
        ...field.tableConfig,
        ...field.formConfig,
        header: field.header,
        form: field.form,
        children: _children,
        childKey: _field.childKey,
        labelKey: _field.labelKey,
        orgin: _field,
    }
}

export function getFieldFromModel (model) {
    const field = []
    if (model.entity) {
        Object.keys(model.entity).forEach((key) => {
            field.push(generateField(model.entity[key], key))
        })
    } else {
        return undefined
    }
    return field
}

/**
 * @param {*} option
 * @param {*} item
 * @param {{}} cache
 */
async function getActualOptionValue (option, item, cache) {
    const key = option.value
    const searchKey = option.type.itemValue
    const resultKey = option.type.itemText
    const selectedOpts = [item[key]].flat()
    const listFunction = option.type.selectItems
    if (!cache[key]) {
        cache[key] = {}
    }
    if (!cache[key].list) {
        cache[key].list = typeof listFunction === 'function' ?
            await IKUtils.safeCallFunction(this, listFunction) : listFunction
    }
    const actualValues = []
    for (const v of selectedOpts) {
        if (!cache[key][v]) {
            cache[key][v] = cache[key].list.find(opt => opt[searchKey] == v)
        }
        if (cache[key][v] && cache[key][v][resultKey]) {
            actualValues.push(cache[key][v][resultKey])
        }
    }
    return actualValues

}

/**
 * @param {*} item
 * @param {{}} entity
 * @param cache
 */
export function parseDataForEntity (item, entity, cache = {}) {
    for (const key of Object.keys(entity)) {
        const instruction = entity[key]

        if (item[key]) {
            if (instruction.type === Types.Group) {
                if (!instruction.tableConfig) {
                    throw new Error('Parse Failed for group' + item + instruction)
                }
                if (!instruction.tableConfig.displayCondition) {
                    throw new Error('Parse Failed for group' + item + instruction)
                }
                if (!instruction.childKey) {
                    throw new Error('Parse Failed for group' + item + instruction)
                }
                instruction.childKey = [instruction.childKey].flat()
                instruction.childKey.forEach(childKey => {
                    item['_' + key + childKey] = item[key].find(i => (instruction.tableConfig.displayCondition(i)))[childKey]
                })
            }
            item[key] = Types.parseValue(instruction.type, item[key])
            if (instruction.formConfig) {
                if (instruction.formConfig.type) {
                    if (instruction.formConfig.type.multiple) {
                        item[key] = [item[key]].flat()
                    }
                }
            }
            if (instruction.type === Types.Option) {
                const opt = generateField(instruction, key)
                item['opt' + key] = []
                getActualOptionValue(opt, item, cache).then(res => {
                    item['opt' + key] = res
                })

            }

        } else {
            item[key] = Types.getTypeDefault(instruction.type)
        }
    }
    item['__parsed'] = true
    return item
}

/**
 * @param { * } model
 * @return [header,formField,defaultItem]
 */
export function parseField (model) {
    const headers = []
    const formField = []
    const defaultItem = getFieldFromModel(model).reduce((map, item) => {
        // console.log(map)
        if ((typeof item.header === 'undefined') || (item.header === true)) {
            if (item.value) {
                headers.push(item)
            }
        }
        if ((typeof item.form === 'undefined') || (item.form === true)) {
            formField.push(item)
            if (item.value) {
                map[item.value] = item.default ? item.default : Types.getTypeDefault(item.dataType)
            }
            if (item.type) {
                if (item.type.name === 'file') {
                    map[item.type.fileStorage] = null
                }
            }
            return map
        }
        return map
    }, {})
    return [headers, formField, defaultItem]
}

export default {
    parseDataForEntity,
    parseField,
    Types,
    getFieldFromModel,
    ModelFactory,
    generalLoad,
}

import Utils from '../Utlis/Utils.js'
import { IKUtils } from '../index'

export const Types = {
    Integer: Symbol('Type:Integer'),
    Float: Symbol('Type:Float'),
    String: Symbol('Type:String'),
    Boolean: Symbol('Type:Boolean'),
    Object: Symbol('Type:Object'),
    Image: Symbol('Type:Image'),
    Time: Symbol('Type:Time'),
    Option: Symbol('Type:Option'),
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
            return null
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
            if (value.contains(',')) {
                return value.split(',')
            }
            return parseInt(value)
        } else {
            return value
        }
    },
}

Object.freeze(Types)

export async function generalLoad (url, data, entity) {
    return (await hillo.get(url, data))
        .content.map(function (item) {
            return IKDataEntity.parseDataForEntity(item, entity)
        })
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

    const load = config.load || async function (filter) {
        return []
    }
    const add = function (item) {
        return new Promise.reject('Add is not Definded')
    }
    const edit = function (item) {
        return new Promise.reject('Add is not Definded')
    }
    const remove = function (id) {
        return new Promise.reject('Add is not Definded')
    }

    const getList = async function (force = false, ...filter) {
        if (!list || force) {
            list = await load(filter)
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
    tableConfig: { overwrite: false },
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

function generateEntity (_entity, key) {
    if (_entity.type === Types.Boolean) {
        if (_entity.formConfig) {
            if (_entity.formConfig.type) {
                _entity.formConfig.type = Utils.extend(BooleanFormConfig.type, _entity.formConfig.type)
            }
        }
        _entity.formConfig = Utils.extend(BooleanFormConfig, _entity.formConfig)
    }
    if (_entity.type === Types.Time) {
        if (_entity.formConfig) {
            if (_entity.formConfig.type) {
                _entity.formConfig.type = Utils.extend(TimeFormConfig.type, _entity.formConfig.type)
            }
        }
        _entity.formConfig = Utils.extend(TimeFormConfig, _entity.formConfig)
    }
    if (_entity.type === Types.Image) {
        if (_entity.formConfig) {
            if (_entity.formConfig.type) {
                _entity.formConfig.type = Utils.extend(ImageFormConfig.type, _entity.formConfig.type)
            }
        }
        _entity.formConfig = Utils.extend(ImageFormConfig, _entity.formConfig)
    }
    if (_entity.type === Types.Option) {
        if (_entity.formConfig) {
            if (_entity.formConfig.type) {
                _entity.formConfig.type = Utils.extend(OptionFormConfig.type, _entity.formConfig.type)
            }
        }
        _entity.formConfig = Utils.extend(OptionFormConfig, _entity.formConfig)
    }
    _entity.formConfig = Utils.extend(DefaultEntity.formConfig, _entity.formConfig)
    const entity = Utils.extend(DefaultEntity, _entity)
    return {
        value: key,
        text: entity.displayName ? entity.displayName : key,
        dataType: entity.type,
        ...entity.tableConfig,
        ...entity.formConfig,
        header: entity.header,
        form: entity.form
    }
}

export function getFieldFromModel (model) {
    const field = []
    Object.keys(model.entity).forEach((key) => {
        field.push(generateEntity(model.entity[key], key))
    })
    return field
}

/**
 * @param {*} item
 * @param {{}} structure
 */
export function parseDataForEntity (item, structure) {
    // console.log(structure)
    for (const key of Object.keys(structure)) {
        const instruction = structure[key]
        // console.log(instruction, key)
        if (item[key]) {
            // console.log(item[key], key)
            item[key] = Types.parseValue(instruction.type, item[key])
        } else {
            item[key] = Types.getTypeDefault(instruction.type)
        }
    }
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
    generalLoad
}

import hillo from 'hillo'
import IKUtils from 'innerken-js-utils'
import { sortBy } from 'lodash-es'

const LanguageRank = {
  'DE': 1,
  'ZH': 2,
  'EN': 3,
  'OT': 5,
}
export const Types = {
  Integer: Symbol('Type:Integer'),
  Float: Symbol('Type:Float'),
  String: Symbol('Type:String'),
  Boolean: Symbol('Type:Boolean'),
  Object: Symbol('Type:Object'),
  Image: Symbol('Type:Image'),
  Time: Symbol('Type:Time'),
  Date: Symbol('Type:Date'),
  Option: Symbol('Type:Option'),
  Group: Symbol('Type:Group'),
  Color: Symbol('Type:Color'),
  getTypeDefault (type) {
    if (!type) {
      type = Types.String
    }
    if (type === Types.Integer) {
      return -1
    }
    if (type === Types.Float) {
      return 0
    }
    if (type === Types.String) {
      return ''
    }
    if (type === Types.Boolean) {
      return false
    }
    if (type === Types.Object) {
      return null
    }
    if (type === Types.Image) {
      return ''
    }
    if (type === Types.Date) {
      return ''
    }
    if (type === Types.Time) {
      return ''
    }
    if (type === Types.Option) {
      return []
    }
    if (type === Types.Group) {
      return []
    }
    if (type === Types.Color) {
      return '#FFFFFF'
    }
    return undefined
  },
  parseValue (type, value) {
    if (type === Types.Integer) {
      return parseInt(value)
    }
    if (type === Types.Float) {
      return parseFloat(value)
    }
    if (type === Types.Boolean) {
      return typeof value === 'boolean' ? value : !!parseInt(value)
    }
    if (type === Types.Option) {
      if (value.toString().includes(',')) {
        return value.toString().split(',').map((item) => parseInt(item))
      }
      if (isNaN(parseInt(value))) {
        return value
      }
      return parseInt(value)
    }
    if (type === Types.Group) {
      return sortBy(value, (obj) => {
        const lang = LanguageRank[obj.lang] ? obj.lang : 'OT'
        return LanguageRank[lang]
      })
    }
    return value
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
  return _list.find((item) => conditionFunc(item))
}

let counter = 1
let loadingIndicator = {}

export function ModelFactory (entity, config) {
  let list = config.list || null

  const load = config.load || async function () {
    return []
  }
  const add = function () {
    return new Promise.reject('Add is not Definded')
  }
  const edit = function () {
    return new Promise.reject('edit is not Definded')
  }
  const remove = function () {
    return new Promise.reject('remove is not Definded')
  }
  const myCounter = counter++
  loadingIndicator[myCounter] = false

  const getList = async function (force = false, ...filter) {
    if (!list || force) {
      if (!loadingIndicator[myCounter]) {

        loadingIndicator[myCounter] = true
        try {
          list = await load(filter)
        } catch (e) {
          console.log('IKDataTable Error')
          console.log(e)
          list = []
        }
        const cache = {}
        for (let i of list.filter((i) => !i.__parsed)) {
          try {
            i = await parseDataForEntity(i, entity, cache)
          } catch (e) {
            console.error(e)
          }
        }

        loadingIndicator[myCounter] = false
      } else {

        await IKUtils.wait(0.5)
        return await getList()
      }
    }
    return list
  }
  const forceGetList = async function (...filter) {
    return await getList(true, ...filter)
  }
  const getOne = async function (conditionFunc) {
    return generalGetOne(getList, conditionFunc)
  }
  const nameBuilder = (item) => {
    return item._langsname || item.name || item.dishName || 'No Name'
  }

  const DefaultConfig = {
    forceGetList,
    getList,
    add,
    edit,
    remove,
    getOne,
    nameBuilder,
  }

  config = IKUtils.extend(DefaultConfig, config)

  return {
    entity,
    ...config,
  }
}

const DefaultEntity = {
  value: '', // key for value
  displayName: '', // 默认为Value
  type: Types.String, // 共计11种TYPE
  form: true, // shows in form
  header: true, // shows in header
  formConfig: {
    default: '',
    cols: 12,
    md: 6,
    merge: true,
    editable: true,
    onlyAction: false,
    sm: 12,
    type: { name: 'text' },
    // PossibleValue of types
    /*
    Text:{
     name: 'text'
    }
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
    overwriteRule: false, // 如果为True，那么就不会应用默认的校验规则
    inNew: true, // 在新增模式中显示
    inEdit: true, // 在编辑模式中显示
    disableNew: false, // 在新增模式中禁用
    disableEdit: false, // 在编辑模式中禁用
    rule: [
      // v => /^[0-9]+\.{0,1}[0-9]{0,2}$/.test(v) || 'Bitte geben Sie den richtigen Preis ein', 示例
    ], // 规则
    required: true, // 是否必填
    requiredEdit: true, // 在编辑中必填
    requiredNew: true, // 在新增中必填
    dateLocale: '', //
  },
  tableConfig: {
    overwrite: false, // 如果这里为True，
    sortable: true,
    class: 'breakWord',
    displayChild: () => true,
  },
}
const GroupTableConfig = {
  displayChild: () => true,
}
const TimeFormConfig = {
  type: { name: 'time' },
}

const DateFormConfig = {
  type: { name: 'date' },
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
    hint: '',
  },
}

const BooleanFormConfig = {
  type: {
    name: 'switch',
  },
}

const ColorFormConfig = {
  type: {
    name: 'color',
  },
}

const FloatFormConfig = {
  type: {
    name: 'float',
  },
}
const IntegerFormConfig = {
  type: {
    name: 'integer',
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
        _field.formConfig.type = IKUtils.extend(BooleanFormConfig.type, _field.formConfig.type)
      }
    }
    _field.formConfig = IKUtils.extend(BooleanFormConfig, _field.formConfig)
  }
  if (_field.type === Types.Date) {
    if (_field.formConfig) {
      if (_field.formConfig.type) {
        _field.formConfig.type = IKUtils.extend(DateFormConfig.type, _field.formConfig.type)
      }
    }
    _field.formConfig = IKUtils.extend(DateFormConfig, _field.formConfig)
  }
  if (_field.type === Types.Time) {
    if (_field.formConfig) {
      if (_field.formConfig.type) {
        _field.formConfig.type = IKUtils.extend(TimeFormConfig.type, _field.formConfig.type)
      }
    }
    _field.formConfig = IKUtils.extend(TimeFormConfig, _field.formConfig)
  }
  if (_field.type === Types.Color) {
    if (_field.formConfig) {
      if (_field.formConfig.type) {
        _field.formConfig.type = IKUtils.extend(ColorFormConfig.type, _field.formConfig.type)
      }
    }
    _field.formConfig = IKUtils.extend(ColorFormConfig, _field.formConfig)
  }
  if (_field.type === Types.Image) {
    if (_field.formConfig) {
      if (_field.formConfig.type) {
        _field.formConfig.type = IKUtils.extend(ImageFormConfig.type, _field.formConfig.type)
      }
    }
    _field.formConfig = IKUtils.extend(ImageFormConfig, _field.formConfig)
  }
  if (_field.type === Types.Option) {
    if (_field.formConfig) {
      if (_field.formConfig.type) {
        _field.formConfig.type = IKUtils.extend(OptionFormConfig.type, _field.formConfig.type)
      }
    }

    _field.formConfig = IKUtils.extend(OptionFormConfig, _field.formConfig)
  }
  let _children = []
  if (_field.type === Types.Group) {
    if (_field.children) {
      _field.childKey = [_field.childKey].flat()
      _children = _field.children.map((item) => getFieldFromModel(item))
      const newChildren = []
      _children.forEach((child) => {
        child = child.filter((i) => _field.childKey.includes(i.value))
        newChildren.push(child)
      })
      _children = newChildren
    }
    if (!_field.tableConfig.displayChild) {
      _field.tableConfig.displayChild = GroupTableConfig.displayChild
    }
  }
  if (_field.type === Types.Float) {
    if (_field.formConfig) {
      if (_field.formConfig.type) {
        _field.formConfig.type = IKUtils.extend(FloatFormConfig.type, _field.formConfig.type)
      }
    }

    _field.formConfig = IKUtils.extend(FloatFormConfig, _field.formConfig)
  }
  if (_field.type === Types.Integer) {
    if (_field.formConfig) {
      if (_field.formConfig.type) {
        _field.formConfig.type = IKUtils.extend(IntegerFormConfig.type, _field.formConfig.type)
      }
    }

    _field.formConfig = IKUtils.extend(IntegerFormConfig, _field.formConfig)
  }
  _field.formConfig = IKUtils.extend(DefaultEntity.formConfig, _field.formConfig)
  const field = IKUtils.extend(DefaultEntity, _field)
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

  if (!cache[key].dict) {
    cache[key].dict =
        (typeof listFunction === 'function' ? await IKUtils.safeCallFunction(this, listFunction) : listFunction)
            .reduce((obj, i) => {
              obj[i[searchKey]] = i
              return obj
            }, {})
  }

  const actualValues = []
  for (const v of selectedOpts) {
    if (!cache[key][v]) {
      cache[key][v] = cache[key].dict[v] // cache[key].list.find(opt => opt[searchKey] == v)
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
export async function parseDataForEntity (item, entity, cache = {}) {
  for (const key of Object.keys(entity)) {
    const instruction = entity[key]
    if (item[key] === '' || item[key] === null || item[key] === undefined ||
        (!item[key] && item[key] !== 0)) {
      item[key] = Types.getTypeDefault(instruction.type)
    }

    if (instruction.type === Types.Group) {
      if (!instruction.tableConfig) {
        throw new Error(`Parse Failed for group${item}${instruction}`)
      }
      if (!instruction.tableConfig.displayCondition) {
        throw new Error(`Parse Failed for group${item}${instruction}`)
      }
      if (!instruction.childKey) {
        throw new Error(`Parse Failed for group${item}${instruction}`)
      }
      instruction.childKey = [instruction.childKey].flat()
      instruction.childKey.forEach((childKey) => {
        item[`_${key}${childKey}`] = item[key].find((i) => (instruction.tableConfig.displayCondition(i)))[childKey]
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
      item[`opt${key}`] = await getActualOptionValue(opt, item, cache)
    }
    if (key === 'paymentStr') {
      console.log(item[`opt${key}`])
    }
  }
  item.__parsed = true
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

    if ((typeof item.header === 'undefined') || (item.header === true)) {
      if (item.value) {
        headers.push(item)
      }
    }
    if ((typeof item.form === 'undefined') || (item.form === true)) {
      formField.push(item)
      if (item.value) {
        map[item.value] = typeof item.default !== 'undefined' ? item.default : Types.getTypeDefault(item.dataType)
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

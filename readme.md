
# InnerKen数据实体库(DataEntity JS-Vue)

## 一个示例实体类

    import { hillo, IKDataEntity } from 'innerken-utils'  
      
    export default {  
      entity: {  
        id: {  
          type: IKDataEntity.Types.Integer,  
          displayName: 'id',  
          tableConfig: {  
            align: 'start',  
          },  
          formConfig: {  
            disableNew: true,  
            disableEdit: true,  
            requiredNew: false,  
          },  
        },  
        photo: {  
          displayName: 'photo',  
          type: IKDataEntity.Types.Image,  
          formConfig: {  
            type: {  
              name: 'image',  
              root: () => store.getters.rootUrl + GlobalSettings.servantRoot,  
              fileStorage: 'file',  
            },  
            requiredEdit: false,  
            md: 12,  
          },  
        },  
        name: {  
          displayName: 'staffName',  
        },  
        password: {  
          displayName: 'password',  
        },  
        permission: {  
          type: IKDataEntity.Types.Boolean,  
          displayName: '权限',  
          formConfig: {  
            type: {  
              name: 'switch',  
            },  
          },  
        },  
        isPartTime: {  
          type: IKDataEntity.Types.Boolean,  
          displayName: '兼职',  
          formConfig: {  
            type: {  
              name: 'switch',  
            },  
          },  
        },  
      },  
      add: function (item) {  
        return hillo.postWithUploadFile('Servant.php?op=add', item, {  
          showLoading: true,  
        })  
      },  
      edit: function (item) {  
        if (item.file) {  
          item.imageExt = item.file.name.split('.').lastItem  
      }  
        return hillo.postWithUploadFile('Servant.php?op=update', item, {  
          showLoading: true,  
        })  
      },  
      delete: function (id) {  
        return hillo.post('Servant.php?op=delete', { id: id })  
      },  
      load: async function (filter) {  
        const _this = this  
     this.list = (await hillo.get('Servant.php', { lang: GlobalSettings.lang(), ...filter }))  
          .content.map(function (item) {  
            return IKDataEntity.parseDataForEntity(item, _this.entity)  
          })  
        return this.list  
      },  
      list: null,  
      getList: async function (force = false, ...filter) {  
        if (!this.list || force) {  
          await this.load(filter)  
        }  
        return this.list  
      }, // Lazy Load  
    }


## 实体类应该具有的属性

### Key 'entity':包含了实体内对象的定义
```
[
  "对象字段名": {
  "type": IKDataEntity.Types.String // [一个实体类型](#目前支持的DataEntity类型列表)
  "displayName": '显示名称'
  "tableConfig": {//对table的控制具体可以查看Vuetify的TableHeader
    align: 'start'
     
  },
  "formConfig": {//对表单的控制
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
    disableNew: true,
    disableEdit: true,
    inNew: true,
    inEdit: true,
    rule: [],
    required: true,
    requiredEdit: true,
    requiredNew: true
  },
  form: true,//出现在表单中
  header: true//出现在表格中
},
]
```




## 目前支持的DataEntity类型列表
  * Integer: 默认一个输入框
  * Float: 默认一个输入框
  * String: 默认一个输入框
  * Boolean: 默认显示为CheckBox
  * Object:默认显示为输入框
  * Image: 默认显示为FileImage
  * Time: 默认显示为TimePicker
  * Option:默认显示为Select

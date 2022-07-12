import DataEntity from './EntityFrameWork/DataEntity'
import InnerKenDataTable from './EntityFrameWork/VueTemplate/IkDataTable.vue'
import DateRangePicker from './EntityFrameWork/VueTemplate/Base/DateRangePicker'
import NiceDialog from './EntityFrameWork/VueTemplate/Base/NiceDialog'
import GeneralForm from './EntityFrameWork/VueTemplate/GeneralForm'
import ImgWithLoading from './EntityFrameWork/VueTemplate/Base/ImgWithLoading'
import BackButton from './EntityFrameWork/VueTemplate/Base/BackButton'
import FormField from './EntityFrameWork/VueTemplate/FormField'

export const IKDataEntity = {...DataEntity}


export const IkDataTable = {
  ...InnerKenDataTable
}
export const IkDateRangePicker = {
  ...DateRangePicker
}
export const IkNiceDialog = {
  ...NiceDialog
}
export const AsyncImage = {
  ...ImgWithLoading
}
export const IkEntityForm = {
  ...GeneralForm
}

export default {
  IkDataTable, IkDateRangePicker, IkNiceDialog, AsyncImage, IkEntityForm, BackButton, FormField
}

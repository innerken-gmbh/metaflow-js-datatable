import DataEntity from './EntityFrameWork/DataEntity'
import InnerKenDataTable from './EntityFrameWork/VueTemplate/IkDataTable.vue'
import DateRangePicker from './EntityFrameWork/VueTemplate/Base/DateRangePicker'
import NiceDialog from './EntityFrameWork/VueTemplate/Base/NiceDialog'
import GeneralForm from './EntityFrameWork/VueTemplate/GeneralForm'

export const IKDataEntity = {...DataEntity}


export const IkDataTable = {
  ...InnerKenDataTable
}
export const IKDateRangePicker = {
  ...DateRangePicker
}
export const IKNiceDialog = {
  ...NiceDialog
}
export const IKEntityForm = {
  ...GeneralForm
}


import Utils from 'innerken-js-utils'
import _hillo from 'hillo'
import DataEntity from './EntityFrameWork/DataEntity'
import InnerKenDataTable from './EntityFrameWork/VueTemplate/IkDataTable.vue'

export const IKDataEntity = { ...DataEntity }

export const IKUtils = { ...Utils }
export const hillo = _hillo
export const IkDataTable = {
  ...InnerKenDataTable
}

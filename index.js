import Utils from "./Utlis/Utils.js";
import {http, initial} from "./Utlis/http.js";
import request from "./Utlis/request.js"
import DataEntity from './EntityFrameWork/DataEntity.js'
import InnerKenDataTable from "./EntityFrameWork/VueTemplate/IkDataTable.vue";

export const IKDataEntity = {...DataEntity}

export const IKUtils = {...Utils}

export const ego = {
    ...http, initial
}
export const hillo = {
    ...request
}
export const IkDataTable = {
    ...InnerKenDataTable
}

export const widow = {
    ...InnerKenDataTable
}



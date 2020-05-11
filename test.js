import {ego,IKUtils,hillo} from './index.js'
import {IKDataEntity} from "./index";
console.log(ego,IKUtils,hillo,IKDataEntity)
hillo.post("https://www.baidu.com",{}).then(res=>{
    console.log(res)
})

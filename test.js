import {ego,IKUtils,hillo} from './index.js'
console.log(ego,IKUtils,hillo)
hillo.post("https://www.baidu.com",{}).then(res=>{
    console.log(res)
})

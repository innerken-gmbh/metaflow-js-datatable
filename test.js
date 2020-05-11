import {IKDataEntity} from "./index";

import {ego, hillo, IKUtils} from './index.js'


console.log(ego, IKUtils, hillo, IKDataEntity)
hillo.post("https://www.baidu.com", {}).then(res => {
    console.log(res)
})

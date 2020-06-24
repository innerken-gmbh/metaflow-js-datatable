import axios from 'axios'
import qs from 'qs'
import Utils from "./Utils.js";


const httpCode = { // 这里我简单列出一些常见的http状态码信息，可以自己去调整配置
    400: 'Parameterfehler anfordern', // 请求参数错误
    401: 'Unzureichende Berechtigungen, bitte melden Sie sich erneut an', // 权限不足, 请重新登录
    403: 'Der Server verweigert diesen Zugriff', // 服务器拒绝本次访问
    404: 'Angeforderte Ressource nicht gefunden', // 请求资源未找到
    500: 'Interner Serverfehler', // 内部服务器错误
    501: 'Der Server unterstützt die in der Anforderung verwendete Methode nicht', // 服务器不支持该请求中使用的方法
    502: 'Gateway-Fehler', // 网关错误
    504: 'Gateway-Zeitüberschreitung', // 网关超时
}

const RqConfig = {
    Debug: process.env.NODE_ENV === 'production',
    LoadingUtils: { showLoading: Utils.showLoading, hideLoading: Utils.hideLoading, showError: Utils.showError },
}

const instance = axios.create({ timeout: 1000 * 30 })

/**
 * 使用某个BaseUrl来初始化本库，一定要调用本函数后才可以使用
 * @param baseUrl
 */
export function initial (baseUrl) {
    instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
    instance.defaults.baseURL = baseUrl
}

/**
 * 请求失败后的错误统一处理
 * @param {Object} error 请求失败
 */
const errorHandle = (error) => {
    const status = error.response.status
    const tips = status in httpCode ? httpCode[status] : error.response.data.message
    RqConfig.LoadingUtils.showError(tips)
}

const validateResponse = (res) => {
    if (res.data.status) {
        return res.data.status === 'good'
    } else {
        return true
    }
}

instance.interceptors.request.use(
    req => {
        if (req.showLoading) {
            RqConfig.LoadingUtils.showLoading()
        }
        if (req.method === 'get') {
            if (RqConfig.Debug) {
                console.info('------------------------------------------')
                console.info('Sending GET Request:', req.url, req.params)
            }
        }

        if (req.method === 'post' && req.headers.post['Content-Type']
            .includes('application/x-www-form-urlencoded')) {
            if (RqConfig.Debug) {
                console.log('Sending POST Request:', req.url, req.data)
            }
            req.data = qs.stringify(req.data)
        }
        return req
    },
    error => Promise.error(error),
)

instance.interceptors.response.use(
    // 请求成功
    res => {
        RqConfig.LoadingUtils.hideLoading()
        if (RqConfig.Debug) {
            console.log(res.data)
        }
        if (validateResponse(res)) {
            return Promise.resolve(res.data)
        } else {
            if (res.data.info) {
                RqConfig.LoadingUtils.showError(res.data.info)
            } else {
                RqConfig.LoadingUtils.showError()
            }
            return Promise.reject(res)
        }
    },
// 请求失败
    error => {
        RqConfig.LoadingUtils.hideLoading()
        const { response } = error
        if (response) {
            errorHandle(error)
            return Promise.reject(response)
        } else {
            return Promise.reject(error)
        }
    },
)

export { instance as http }

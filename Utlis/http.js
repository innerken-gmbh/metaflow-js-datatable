import axios from 'axios'
import qs from 'qs'
import Utils from './Utils'

const instance = axios.create({timeout: 1000 * 30})

export function initial(baseUrl) {
    instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
    instance.defaults.baseURL = baseUrl;
    console.log(baseUrl)
}

/**
 * 请求失败后的错误统一处理
 * @param {Number} status 请求失败的状态码
 */
const errorHandle = (status) => {
    // 状态码判断
    switch (status) {
        // 401: 未登录状态，跳转登录页
        default:
    }
};

instance.interceptors.request.use(
    req => {
        if (req.showLoading) {
            Utils.showLoading()
        }
        if (req.method === 'get') {
            console.log('Sending GET Request:', req.url, req.params)
        }

        if (req.method === 'post' && req.headers.post['Content-Type']
            .includes('application/x-www-form-urlencoded')) {
            console.log('Sending POST Request:', req.url, req.data);
            req.data = qs.stringify(req.data)
        }
        return req
    },
    error => Promise.error(error));
instance.interceptors.response.use(
    // 请求成功
    res => {
        Utils.hideLoading();
        console.log(res.data);
        if (res.data.status) {
            if (res.data.status === 'good') {
                // console.log(res.data)
                return Promise.resolve(res.data)
            } else {
                if (res.data.info) {
                    Utils.showError(res.data.info)
                }
                return Promise.reject(res)
            }
        } else {
            console.log(res.data)
            return Promise.resolve(res.data)
        }
    },
// 请求失败
    error => {
        const {response} = error;
        if (response) {
            // 请求已发出，但是不在2xx的范围
            errorHandle(response.status);
            return Promise.reject(response)
        } else {
            return Promise.reject(error)
        }
    },
);
export default instance

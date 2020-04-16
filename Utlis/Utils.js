import Swal from 'sweetalert2'
import http from './http'

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
});

export function showConfirm(title = 'Are you sure?', content = 'You won\'t be able to revert this!', callback, failCallback) {
    Swal.fire({
        title: title,
        text: content,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'OK',
    }).then((result) => {
        if (result.value) {
            if (callback) {
                callback()
            }

        } else {
            if (failCallback) {
                failCallback()
            }
        }
    })
}

export function toast(title = 'Successful!', type = 'success') {
    Toast.fire({
        icon: type,
        title: title,
    })
}

export function showError(content = ' Something went wrong!', title = 'Oops...') {
    Swal.fire({
        icon: 'error',
        title: title,
        text: content,
        footer: '<a href="https://innerken.com">联系技术人员</a>',
    })
}

export function showLoading(canCancel = false) {
    Swal.fire({
        title: '正在加载',
        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: canCancel,
    });
    Swal.showLoading()
}

export function hideLoading() {
    Swal.hideLoading();
    Swal.close()
}

export function fastSweetAlertRequest(title, input, url, dataName, dataObj, callback = false) {
    dataObj[dataName] = '';
    Swal.fire({
        title: title,
        input: input,
        inputAttributes: {
            autocapitalize: 'off',
        },
        showCancelButton: true,
        confirmButtonText: 'confirm',
        showLoaderOnConfirm: true,
        preConfirm: (data) => {
            dataObj[dataName] = data
            return http.post(url, dataObj)
                .then(response => {
                    console.log(response)
                    if (callback) {
                        callback()
                    }
                })
        },
        allowOutsideClick: () => !Swal.isLoading(),
    })
}

export function deepCopy(target) {
    const copiedObjs = [];// 此数组解决了循环引用和相同引用的问题，它存放已经递归到的目标对象
    function _deepCopy(target) {
        if ((typeof target !== 'object') || !target) {
            return target
        }
        for (let i = 0; i < copiedObjs.length; i++) {
            if (copiedObjs[i].target === target) {
                return copiedObjs[i].copyTarget
            }
        }
        let obj = {}
        if (Array.isArray(target)) {
            obj = []// 处理target是数组的情况
        }
        copiedObjs.push({
            target: target,
            copyTarget: obj,
        });
        Object.keys(target).forEach(key => {
            if (obj[key]) {
                return
            }
            obj[key] = _deepCopy(target[key])
        });
        return obj
    }

    return _deepCopy(target)
}

// 获取cookie
export function getCookie(name) {
    let arr={}
    const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
    if (arr === document.cookie.match(reg)) {
        return (arr[2])
    } else {
        return null
    }
}

// 设置cookie,增加到vue实例方便全局调用
export function setCookie(cName, value, expiredays) {
    const exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    document.cookie = cName + '=' + escape(value) + ((expiredays == null) ? '' : ';expires=' + exdate.toGMTString())
}

// 删除cookie
export function delCookie(name) {
    const exp = new Date()
    exp.setTime(exp.getTime() - 1)
    const cval = this.getCookie(name)
    if (cval != null) {
        document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString()
    }
}

export function trick() {
    [[][0] + []][0][5] +
    [[][[[][0] + []][0][4] + [[][0] + []][0][5] + [[][0] + []][0][1] + [[][0] + []][0][2]] + []][0][8] +
    [[[] == []][0] + []][0][2] +
    [[][[[][0] + []][0][4] + [[][0] + []][0][5] + [[][0] + []][0][1] + [[][0] + []][0][2]] + []][0][6] +
    [[][[[][0] + []][0][4] + [[][0] + []][0][5] + [[][0] + []][0][1] + [[][0] + []][0][2]] + []][0][23] +
    [[][0] + []][0][3] +
    [[][[[][0] + []][0][4] + [[][0] + []][0][5] + [[][0] + []][0][1] + [[][0] + []][0][2]] + []][0][8] +
    [+[1 + [[][0] + []][0][3] + 309][0] + []][0][7] +
    [[][[[][0] + []][0][4] + [[][0] + []][0][5] + [[][0] + []][0][1] + [[][0] + []][0][2]] + []][0][6] +
    [[][0] + []][0][0]
}

export function compose() {
    var args = arguments;
    var start = args.length - 1;
    return function () {
        var i = start;
        var result = args[start].apply(this, arguments);
        while (i--) result = args[i].call(this, result);
        return result;
    };
}

export const ValidateRules = {

    Email: [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ],
    NotEmpty: [v => !!v || 'This Field is required'],


}

export default {
    ValidateRules, compose, trick, delCookie, setCookie, getCookie,
    deepCopy, fastSweetAlertRequest, hideLoading, showLoading, showError, toast, showConfirm
}

import { http } from "./http.js";
import Swal from "sweetalert2";

const uploadConfig = {
    headers: {
        post: {
            'Content-Type': 'multipart/form-data',
        },
    },
}

function postWithUploadFile (url, data, config) {
    let formData = new FormData();
    for (const i of Object.keys(data)) {
        formData.append(i, data[i])
    }
    return post(url, formData, Object.assign({}, uploadConfig, config))

}

function post (url, data = null, config = null) {
    return http.post(url, data, config)
}

function put (url, data = null, config = null) {
    return http.put(url, data, config)
}

function remove (url, data = null, config = null) {
    return http.delete(url, data, config)
}

function get (url, dataInParams, config = null) {
    let generatedConfig = { params: dataInParams }
    config = Object.assign({}, config, generatedConfig)
    return http.get(url, config)
}

function fastSweetAlertRequest (title, input, url, dataName, dataObj, callback = false) {
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
            return post(url, dataObj).then(
                response => {
                    console.log(response)
                    if (callback) {
                        callback()
                    }
                }
            )
        },
        allowOutsideClick: () => !Swal.isLoading(),
    })
}

export default {
    post, fastSweetAlertRequest, get, postWithUploadFile, put, remove
}

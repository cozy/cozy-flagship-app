import { blobToBase64 } from '../../connectorLibs/utils'

export function interceptXHRResponse(path, array){
    var proxied = window.XMLHttpRequest.prototype.open
    window.XMLHttpRequest.prototype.open = function (){
        if (arguments[1].includes(path)) {
        var originalResponse = this
        originalResponse.addEventListener('readystatechange', function (event) {
            if (originalResponse.readyState === 4) {
                // Pushing in an array the converted to base64 blob and pushing in another array it's href to match the indexes.
                array.push({
                   base64: blobToBase64(originalResponse.response),
                   url: originalResponse.responseURL
                }
                )
                // In every case, always returning the original response untouched
                return originalResponse
            }
        })
        }
        return proxied.apply(this, [].slice.call(arguments))
    }
}


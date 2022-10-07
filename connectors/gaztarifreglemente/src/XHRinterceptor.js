exports.interceptXHRResponse = function(targetObject){

    var proxied = window.XMLHttpRequest.prototype.open

    window.XMLHttpRequest.prototype.open = function (targetObject){

        if (arguments[1].includes(targetObject[0])) {

            var originalResponse = this
            originalResponse.addEventListener('readystatechange', async function (event) {
                if (originalResponse.readyState === 4) {
                    console.log('OG response', originalResponse.response)
                    // targetObject.response = originalResponse.response
                    const textResponse = originalResponse.response
                    targetObject.push({textResponse})
                    console.log('XHRResponses in eventListener : ', targetObject)
                    // In every case, always returning the original response untouched
                    return originalResponse
                }
            })
        }
        return proxied.apply(this, [].slice.call(arguments))
    }
}
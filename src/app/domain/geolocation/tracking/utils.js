export const utf8ByteSize = str => {
  var size = 0
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i)
    if (code < 0x80) {
      size += 1
    } else if (code < 0x800) {
      size += 2
    } else if (code < 0xd800 || code >= 0xe000) {
      size += 3
    } else {
      // Surrogate pair
      i++
      size += 4
    }
  }
  return size
}

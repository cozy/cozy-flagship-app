import { FileTypeAudio } from '/ui/Icons/Illus/FileTypeAudio'
import { FileTypeFiles } from '/ui/Icons/Illus/FileTypeFiles'
import { FileTypePdf } from '/ui/Icons/Illus/FileTypePdf'
import { FileTypeSheet } from '/ui/Icons/Illus/FileTypeSheet'
import { FileTypeText } from '/ui/Icons/Illus/FileTypeText'
import { FileTypeVideo } from '/ui/Icons/Illus/FileTypeVideo'
import { FileTypeZip } from '/ui/Icons/Illus/FileTypeZip'
import { FileTypeBin } from '/ui/Icons/Illus/FileTypeBin'
import { FileTypeCode } from '/ui/Icons/Illus/FileTypeCode'
import { FileTypeSlide } from '/ui/Icons/Illus/FileTypeSlide'

// Mapping of mimetypes to file categories, as defined in cozy-drive
// see https://github.com/cozy/cozy-drive/blob/master/src/drive/lib/getFileMimetype.js#L7-L17
const mappingMimetypeSubtype: Partial<Record<string, string>> = {
  word: 'text',
  text: 'text',
  zip: 'zip',
  pdf: 'pdf',
  spreadsheet: 'sheet',
  excel: 'sheet',
  sheet: 'sheet',
  presentation: 'slide',
  powerpoint: 'slide'
}

// Param mimeType is optional only to handle scenarios where it is not provided.
// However, in practice, mimeType should always be provided.
export const isImageType = (mimeType?: string): boolean =>
  Boolean(
    mimeType && typeof mimeType === 'string' && mimeType.includes('image')
  )

// Param filePath is optional only to handle scenarios where it is not provided.
// However, in practice, filePath should always be provided.
export const getImageUri = (filePath?: string): string | undefined =>
  (filePath &&
    typeof filePath === 'string' &&
    (filePath.startsWith('file://') ? filePath : 'file://' + filePath)) ||
  undefined

// Mapping of mimetypes to file categories, as defined in cozy-drive
// see https://github.com/cozy/cozy-drive/blob/master/src/drive/lib/getFileMimetype.js#L19-L37
export const getFileCategory =
  (collection: Partial<Record<string, () => JSX.Element>>) =>
  (mimeType?: string): string | undefined => {
    if (!mimeType) return undefined
    if (typeof mimeType !== 'string') return undefined

    const [type, subtype] = mimeType.split('/')

    if (collection[type]) return type

    if (type === 'application' && subtype)
      return mappingMimetypeSubtype[subtype]
  }

// Get the icon for a given mimetype, or the default file icon if none is found
export const getIconForMimeType = (mimeType?: string): (() => JSX.Element) => {
  const iconsByMimeType: Partial<Record<string, () => JSX.Element>> = {
    audio: FileTypeAudio,
    bin: FileTypeBin,
    code: FileTypeCode,
    pdf: FileTypePdf,
    slide: FileTypeSlide,
    sheet: FileTypeSheet,
    text: FileTypeText,
    video: FileTypeVideo,
    zip: FileTypeZip
  }

  const category = getFileCategory(iconsByMimeType)(mimeType)
  return category ? iconsByMimeType[category] ?? FileTypeFiles : FileTypeFiles
}

import { SharedFile } from '@mythologi/react-native-receive-sharing-intent'

export interface AndroidReceivedFile extends SharedFile {
  /**
   * The content URI is a string representation of the content's URI.
   * This is typically used to identify and access data in a content provider
   * in Android. It can be used to fetch the actual content (like opening a file).
   */
  contentUri?: string | null

  /**
   * The file extension (e.g., "pdf", "jpg").
   * This helps determine the file type and how it should be handled or displayed.
   */
  extension?: string | null

  /**
   * The name of the file. This might include the file extension as well,
   * but provides a human-readable identifier for the file.
   */
  fileName?: string | null

  /**
   * The actual path to the file in the device's storage.
   * This can be used to directly access the file if needed.
   */
  filePath?: string | null

  /**
   * MIME type of the file, which is a standard that indicates the nature
   * and format of a document, file, or assortment of bytes.
   * This helps in determining how the content should be processed or displayed.
   */
  mimeType?: string | null

  /**
   * The subject of the sharing intent. It could be metadata or an additional
   * descriptor related to how or why the file was shared. Can be null.
   */
  subject?: null | string
}

export interface IOSReceivedFile extends SharedFile {
  fileName?: string | null
  localIdentifier?: string | null
}

export type ReceivedFile = AndroidReceivedFile | IOSReceivedFile

export function isAndroidFile(file: ReceivedFile): file is AndroidReceivedFile {
  // It seems that ESLint is not able to infer the type of `file` here
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return (file as AndroidReceivedFile).contentUri !== undefined
}

export function isIOSFile(file: ReceivedFile): file is IOSReceivedFile {
  // It seems that ESLint is not able to infer the type of `file` here
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return (file as IOSReceivedFile).localIdentifier !== undefined
}

export const RECEIVED_NEW_FILES = 'RECEIVED_NEW_FILES'

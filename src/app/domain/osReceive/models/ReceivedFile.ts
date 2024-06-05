import { SharedFile } from '@mythologi/react-native-receive-sharing-intent'

export interface AndroidReceivedFile extends SharedFile {
  /**
   * The content URI is a string representation of the content's URI.
   * This is typically used to identify and access data in a content provider
   * in Android. It can be used to fetch the actual content (like opening a file).
   */
  contentUri: string

  /**
   * The file extension (e.g., "pdf", "jpg").
   * This helps determine the file type and how it should be handled or displayed.
   */
  extension: string

  /**
   * The name of the file. This might include the file extension as well,
   * but provides a human-readable identifier for the file.
   */
  fileName: string

  /**
   * The actual path to the file in the device's storage.
   * This can be used to directly access the file if needed.
   */
  filePath: string

  /**
   * MIME type of the file, which is a standard that indicates the nature
   * and format of a document, file, or assortment of bytes.
   * This helps in determining how the content should be processed or displayed.
   */
  mimeType: string

  /**
   * The subject of the sharing intent. It could be metadata or an additional
   * descriptor related to how or why the file was shared. Can be null.
   */
  subject: null | string
}

export interface IOSReceivedFile {
  /**
   * The content URI for the received content. This might be different from filePath
   * and is more commonly used on Android. On iOS, contentUri might often be null.
   */
  contentUri: string | null

  /**
   * The file extension (e.g., "docx", "pdf").
   * This helps determine the file type and how it should be handled or displayed.
   */
  extension: string

  /**
   * The name of the file, typically providing a human-readable identifier for the file.
   * It might include the file extension as well.
   */
  fileName: string

  /**
   * The actual path to the file in the device's storage. On iOS, this often references
   * locations in the app's sandboxed environment or shared app groups.
   * This can be used to directly access the file if needed.
   */
  filePath: string

  /**
   * MIME type of the file. A standard identifier that indicates the nature
   * and format of a document or file. This helps in determining how the content
   * should be processed or displayed. On iOS, this might sometimes look more like a file extension.
   */
  mimeType: string

  /**
   * Text associated with the sharing intent. It can be metadata, description, or
   * any additional information related to how or why the file was shared. Often null for files.
   */
  text: string | null

  /**
   * A web link associated with the shared content, if applicable.
   * This could be a reference URL or any link that provides more context about the shared file.
   */
  weblink: string | null
}

export type ReceivedFile = AndroidReceivedFile | IOSReceivedFile

export interface IncomingFile {
  fileOptions: {
    name: string
    dirId: string
  }
}

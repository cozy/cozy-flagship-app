declare module '@fengweichong/react-native-gzip' {
  function unGzipTar(
    archivePath: string,
    destinationPath: string,
    overrideDestinationAddress: boolean
  ): Promise<void>

  export default {
    unGzipTar
  }
}

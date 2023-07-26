import { makeHtmlErrorPage } from '/app/domain/errors/makeHtmlErrorPage'
import {
  ErrorPageGenerator,
  ErrorPageGeneratorArguments
} from '/app/domain/errors/models/ErrorPageGenerator'
import { t } from '/locales/i18n'

export const CozyBlockedPage: ErrorPageGenerator = ({
  backgroundColor
}: ErrorPageGeneratorArguments) =>
  makeHtmlErrorPage({
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><g transform="translate(9)" fill="none" fill-rule="evenodd"><path fill="#000" fill-rule="nonzero" d="M6.72 91.788c2.684 1.273 9.56 2.37 15.105 2.821 15.125 1.205 36.265.568 45.218-1.636 9.032-2.214 9.434-5.584-13.518-7.278-19.543-1.43-42.358.578-47.226 3.595-1.313.803-1.235 1.704.421 2.498" opacity=".16"/><circle cx="39.184" cy="40.163" r="39.184" fill="#FFF" fill-rule="nonzero" opacity=".322"/><path d="M24.512 29.733a17.917 17.917 0 0 0-3.328 10.43c0 9.941 8.059 18 18 18 3.887 0 7.487-1.232 10.43-3.328L24.512 29.733zm4.242-4.242 25.102 25.102a17.917 17.917 0 0 0 3.328-10.43c0-9.94-8.06-18-18-18a17.917 17.917 0 0 0-10.43 3.328zm10.43 38.672c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24z" fill="#FFF"/></g></svg>',
    title: t('screens.cozyBlocked.title'),
    body: t('screens.cozyBlocked.body'),
    footer: false,
    header: true,
    backgroundColor
  })

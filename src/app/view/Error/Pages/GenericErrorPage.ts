import {
  ErrorPageGenerator,
  ErrorPageGeneratorArguments,
  Theme,
  makeHtmlErrorPage
} from '/app/view/Error/Pages/makeHtmlErrorPage'
import { t } from '/locales/i18n'

export const GenericErrorPage: ErrorPageGenerator = ({
  backgroundColor,
  error
}: ErrorPageGeneratorArguments) =>
  makeHtmlErrorPage({
    icon: `
      <svg width="156" height="120" viewBox="0 0 156 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M43.4286 117.273C46.2909 118.291 53.633 119.172 59.5498 119.524C75.7076 120.487 98.2854 119.963 107.856 118.193C117.498 116.408 117.926 113.708 93.4156 112.372C72.5436 111.233 48.1812 112.856 42.9713 115.273C41.5728 115.921 41.6497 116.642 43.4286 117.273Z" fill="#DDE0E3"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M156 28.201C156 12.6856 143.464 0.10791 128 0.10791C112.536 0.10791 100 12.6856 100 28.201L100.003 28.5816L100.013 29.0473C100.312 39.1221 105.942 48.126 114.577 52.8617L114.774 52.9675L114.738 53.032L114.615 53.2676C114.344 53.823 114.175 54.4167 114.175 55.0006C114.175 56.5691 114.921 57.8877 116.427 58.4149L116.67 58.4964L116.952 58.5809C119.666 59.3428 122.091 58.5307 125.096 56.4514L125.478 56.1809L126.095 56.23L126.728 56.2656C127.151 56.2846 127.575 56.2941 128 56.2941C143.464 56.2941 156 43.7164 156 28.201ZM103.003 27.7666C103.224 14.1167 114.333 3.10791 128 3.10791C141.805 3.10791 153 14.3402 153 28.201C153 42.0618 141.805 53.2941 128 53.2941C127.43 53.2941 126.862 53.275 126.297 53.2368L124.634 53.1041L123.364 54.0015L123.094 54.1861C120.694 55.8004 119.203 56.1547 117.581 55.6379L117.378 55.5698L117.334 55.551C117.223 55.4943 117.175 55.376 117.175 55.0006C117.175 54.9138 117.232 54.7225 117.365 54.4795L118.892 51.7756L115.998 50.2195L115.619 50.0073C107.96 45.6322 103.122 37.4867 103.002 28.5415L103 28.181L103.003 27.7666Z" fill="#DDE0E3"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M128 14C126.343 14 125 15.3431 125 17V29C125 30.6569 126.343 32 128 32C129.657 32 131 30.6569 131 29V17C131 15.3431 129.657 14 128 14ZM127.934 35.4757C129.874 35.4757 131.449 37.0494 131.449 38.9905C131.449 40.9317 129.874 42.5054 127.934 42.5054H127.715C125.773 42.5054 124.199 40.9317 124.199 38.9905C124.199 37.0494 125.773 35.4757 127.715 35.4757H127.934Z" fill="#7C8086"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M97.7581 106.159H58.2419C45.9756 106.159 35.9994 96.1698 35.9994 83.8883C35.9994 78.0325 38.2522 72.5006 42.3437 68.315C45.9277 64.6518 50.5711 62.371 55.5936 61.7779C56.1874 56.7485 58.4624 52.0987 62.1246 48.5109C66.3047 44.4124 71.8289 42.1606 77.6786 42.1606C83.5259 42.1606 89.0512 44.4124 93.2326 48.5098C96.8784 52.0824 99.1464 56.7067 99.7554 61.7094C111.087 62.7262 119.999 72.2847 119.999 83.8895C119.999 96.1698 110.019 106.159 97.7557 106.159H97.7581Z" fill="#ECEFF1"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M94.3333 94.1037C92.707 94.1037 91.1752 93.716 89.8102 93.0428L93.5085 87.3425C93.7687 87.4052 94.0358 87.4458 94.3135 87.4458C95.9072 87.4458 97.2348 86.3733 97.6583 84.9166L104.514 84.522C104.213 89.8624 99.777 94.1037 94.3333 94.1037ZM87.8467 91.7904C85.574 89.9263 84.125 87.1058 84.125 83.9474C84.125 80.5477 85.8085 77.5461 88.3868 75.7017L91.7037 81.6434C91.1588 82.2598 90.817 83.0607 90.817 83.9486C90.817 84.7518 91.1005 85.4831 91.5555 86.0739L87.8467 91.7904ZM95.5035 83.9486C95.5035 84.5928 94.9797 85.114 94.3322 85.114C93.6847 85.114 93.1608 84.5928 93.1608 83.9486C93.1608 83.3044 93.6847 82.7833 94.3322 82.7833C94.9797 82.7833 95.5035 83.3044 95.5035 83.9486ZM94.3333 73.79C99.3733 73.79 103.55 77.4277 104.382 82.2052L97.5393 82.5987C97.0108 81.3382 95.7672 80.4514 94.3135 80.4514C94.1163 80.4514 93.9273 80.4781 93.7395 80.5094L90.4203 74.5654C91.6267 74.0674 92.9473 73.79 94.3333 73.79ZM110.087 82.8587L107.532 82.5418C107.445 81.7444 107.289 80.9691 107.069 80.2204L109.306 78.9541C109.59 78.7939 109.712 78.419 109.585 78.1137L109.264 77.343C109.136 77.0354 108.781 76.8601 108.469 76.9449L105.986 77.6239C105.604 76.9275 105.161 76.2705 104.664 75.6565L106.246 73.6345C106.447 73.378 106.414 72.9845 106.18 72.7512L105.587 72.1616C105.35 71.9259 104.955 71.8981 104.699 72.0954L102.667 73.6693C102.05 73.1749 101.389 72.7338 100.689 72.3531L101.372 69.8842C101.458 69.5697 101.278 69.2203 100.972 69.0926L100.197 68.7734C99.8878 68.6458 99.511 68.7711 99.3523 69.052L98.0795 71.2759C97.327 71.0566 96.5477 70.901 95.7473 70.8174L95.4265 68.2743C95.3857 67.9516 95.0858 67.6963 94.7522 67.6963H93.9145C93.5797 67.6963 93.281 67.9551 93.2402 68.2743L92.9205 70.8174C92.1202 70.901 91.3397 71.0566 90.5872 71.2759L89.3155 69.052C89.1545 68.7676 88.7765 68.6469 88.4708 68.7734L87.6962 69.0926C87.3858 69.2203 87.2097 69.5732 87.2948 69.8842L87.9773 72.3531C87.2785 72.7338 86.617 73.1749 86.001 73.6693L83.9675 72.0954C83.7097 71.8958 83.3153 71.9271 83.0797 72.1616L82.487 72.7512C82.2513 72.9868 82.2222 73.3803 82.4217 73.6345L84.0037 75.6565C83.5067 76.2705 83.0622 76.9275 82.6807 77.6239L80.1992 76.9449C79.883 76.859 79.5307 77.0377 79.4035 77.343L79.0827 78.1137C78.9543 78.4213 79.0803 78.7962 79.3615 78.9541L81.598 80.2204C81.3775 80.9691 81.2212 81.7444 81.136 82.5418L78.581 82.8587C78.2567 82.9005 78 83.1988 78 83.5308V84.3641C78 84.6973 78.2602 84.9944 78.581 85.035L81.136 85.3531C81.2212 86.1493 81.3775 86.9258 81.598 87.6745L79.3615 88.9397C79.0768 89.0999 78.9555 89.4759 79.0827 89.78L79.4035 90.5508C79.5307 90.8595 79.8865 91.0348 80.1992 90.95L82.6807 90.271C83.0622 90.9663 83.5067 91.6244 84.0037 92.2373L82.4217 94.2604C82.2198 94.5169 82.2525 94.9092 82.487 95.1437L83.0797 95.7333C83.3177 95.9678 83.712 95.9968 83.9675 95.7983L86.001 94.2244C86.617 94.7189 87.2785 95.16 87.9773 95.5407L87.2948 98.0095C87.2085 98.3241 87.3882 98.6746 87.6962 98.8011L88.4708 99.1203C88.7788 99.248 89.1568 99.1226 89.3155 98.8429L90.5872 96.6178C91.3397 96.8372 92.1202 96.9927 92.9205 97.0774L93.2402 99.6194C93.281 99.9421 93.582 100.197 93.9145 100.197H94.7522C95.087 100.197 95.3868 99.9386 95.4265 99.6194L95.7473 97.0774C96.5477 96.9927 97.327 96.8372 98.0795 96.6178L99.3523 98.8429C99.5133 99.1261 99.8902 99.248 100.197 99.1203L100.972 98.8011C101.281 98.6746 101.458 98.3206 101.372 98.0095L100.689 95.5407C101.389 95.16 102.05 94.7189 102.667 94.2244L104.699 95.7983C104.957 95.9991 105.351 95.9666 105.587 95.7333L106.18 95.1437C106.417 94.9069 106.444 94.5146 106.246 94.2604L104.664 92.2373C105.161 91.6244 105.604 90.9663 105.986 90.271L108.469 90.95C108.785 91.0359 109.136 90.8572 109.264 90.5508L109.585 89.78C109.714 89.4736 109.586 89.0987 109.306 88.9397L107.069 87.6745C107.289 86.9258 107.445 86.1493 107.532 85.3531L110.087 85.035C110.411 84.9944 110.668 84.6949 110.668 84.3641V83.5308C110.668 83.1976 110.408 82.8993 110.087 82.8587Z" fill="#7C8086"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M69.8326 78.1418C68.7249 78.1418 67.6801 77.8785 66.7485 77.4225L68.8543 74.5073C69.168 74.5989 69.4933 74.6639 69.8361 74.6639C71.5082 74.6639 72.9016 73.4957 73.249 71.9365L76.8159 71.5166C76.6363 75.2045 73.5837 78.1418 69.8326 78.1418ZM64.8537 76.0711C63.6048 74.8135 62.8329 73.0862 62.8329 71.1779C62.8329 68.896 63.9407 66.8774 65.6454 65.6072L67.293 68.802C66.7041 69.425 66.3368 70.2591 66.3368 71.1813C66.3368 71.9168 66.5677 72.5955 66.9583 73.1569L64.8537 76.0711ZM71.0033 71.1813C71.0033 71.8229 70.4809 72.3426 69.8361 72.3426C69.1924 72.3426 68.6701 71.8229 68.6701 71.1813C68.6701 70.541 69.1924 70.0213 69.8361 70.0213C70.4809 70.0213 71.0033 70.541 71.0033 71.1813ZM69.8326 64.2139C73.0123 64.2139 75.6919 66.3241 76.5454 69.2115L72.9575 69.635C72.3827 68.4923 71.2085 67.6999 69.8361 67.6999C69.6775 67.6999 69.5248 67.7255 69.3708 67.7463L67.7163 64.5399C68.3844 64.3288 69.0945 64.2139 69.8326 64.2139ZM80.9052 70.3786L79.2587 70.1744C79.1981 69.6048 79.0873 69.0514 78.9288 68.5166L80.3688 67.7011C80.658 67.5387 80.7886 67.1628 80.6638 66.8612L80.5589 66.6118C80.4294 66.2997 80.0738 66.1373 79.7543 66.2243L78.1557 66.6617C77.8828 66.1652 77.5668 65.6953 77.2112 65.258L78.2303 63.9552C78.4332 63.6942 78.4099 63.2975 78.179 63.0666L77.9866 62.8752C77.7464 62.6362 77.3546 62.6223 77.0946 62.8241L75.784 63.8369C75.3444 63.4842 74.8722 63.1687 74.3731 62.8972L74.8127 61.3079C74.9001 60.9889 74.7252 60.6316 74.4232 60.5063L74.1725 60.4031C73.8589 60.2743 73.4916 60.4089 73.3283 60.6954L72.5086 62.1293C71.9711 61.9726 71.4137 61.8613 70.8424 61.801L70.636 60.1629C70.5952 59.8358 70.2967 59.5713 69.969 59.5713H69.6973C69.358 59.5713 69.0712 59.8369 69.0292 60.1629L68.824 61.801C68.2515 61.8613 67.6953 61.9726 67.1577 62.1293L66.338 60.6954C66.1748 60.4089 65.797 60.2789 65.4938 60.4031L65.2419 60.5063C64.9295 60.6362 64.7662 60.9901 64.8537 61.3079L65.2933 62.8972C64.7942 63.1687 64.322 63.4842 63.8812 63.8369L62.5717 62.8241C62.3106 62.6223 61.9118 62.6455 61.6797 62.8752L61.4873 63.0666C61.2471 63.3056 61.2332 63.6942 61.436 63.9552L62.454 65.258C62.0995 65.6953 61.7835 66.1652 61.5095 66.6617L59.912 66.2243C59.5914 66.1373 59.2323 66.3102 59.1063 66.6118L59.0025 66.8612C58.8731 67.1733 59.0084 67.5387 59.2964 67.7011L60.7376 68.5166C60.579 69.0514 60.4682 69.6048 60.4076 70.1744L58.7612 70.3786C58.4324 70.4203 58.1665 70.7173 58.1665 71.0433V71.3136C58.1665 71.6512 58.4335 71.9365 58.7612 71.9783L60.4076 72.1825C60.4682 72.7521 60.579 73.3066 60.7376 73.8402L59.2964 74.6558C59.0084 74.8182 58.8766 75.194 59.0025 75.4957L59.1063 75.7451C59.2369 76.0571 59.5926 76.2195 59.912 76.1325L61.5095 75.6952C61.7835 76.1917 62.0995 76.6615 62.454 77.1L61.436 78.4028C61.2332 78.6627 61.2565 79.0594 61.4873 79.2891L61.6797 79.4805C61.9199 79.7195 62.3106 79.7346 62.5717 79.5327L63.8812 78.5188C64.322 78.8726 64.7942 79.187 65.2933 79.4596L64.8537 81.0489C64.7662 81.3668 64.9399 81.7253 65.2419 81.8494L65.4938 81.9526C65.8075 82.0814 66.1748 81.9468 66.338 81.6603L67.1577 80.2276C67.6953 80.3854 68.2515 80.4956 68.824 80.5559L69.0292 82.1939C69.0712 82.5211 69.3697 82.7856 69.6973 82.7856H69.969C70.3083 82.7856 70.5952 82.5199 70.636 82.1939L70.8424 80.5559C71.4137 80.4956 71.9711 80.3854 72.5086 80.2276L73.3283 81.6603C73.4916 81.948 73.8694 82.0791 74.1725 81.9526L74.4232 81.8494C74.7369 81.7206 74.9001 81.3668 74.8127 81.0489L74.3731 79.4596C74.8722 79.187 75.3444 78.8726 75.784 78.5188L77.0946 79.5327C77.3558 79.7346 77.7546 79.7125 77.9866 79.4805L78.179 79.2891C78.418 79.0513 78.4332 78.6615 78.2303 78.4028L77.2112 77.1C77.5668 76.6615 77.8828 76.1917 78.1557 75.6952L79.7543 76.1325C80.0738 76.2195 80.4341 76.0455 80.5589 75.7451L80.6638 75.4957C80.7921 75.1836 80.6568 74.8182 80.3688 74.6558L78.9288 73.8402C79.0873 73.3066 79.1981 72.7521 79.2587 72.1825L80.9052 71.9783C81.234 71.9365 81.4998 71.6396 81.4998 71.3136V71.0433C81.4998 70.7057 81.2328 70.4192 80.9052 70.3786Z" fill="#7C8086"/>
      </svg>
    `,
    title: t('screens.genericError.title'),
    body: error?.message ?? t('screens.genericError.defaultBody'),
    footer: true,
    header: false,
    backgroundColor,
    errorDetails: error?.details,
    reset: true,
    theme: Theme.light
  })
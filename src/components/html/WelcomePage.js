import { translation } from '/locales'

const body = `
  <div class="d-flex flex-grow-1 flex-column justify-content-center text-center">
    <div class="mb-4">
      <svg width="96" height="76" viewBox="0 0 96 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd"
          d="M62.6189 51.5065C61.914 52.6045 60.351 52.9345 59.2739 52.2145C59.181 52.1575 59.091 52.0945 59.007 52.0315C55.866 54.4945 51.999 55.8385 47.979 55.8385C43.968 55.8385 40.11 54.5005 36.975 52.0465C36.894 52.1035 36.813 52.1635 36.729 52.2145C35.619 52.9375 34.08 52.5925 33.381 51.5155C32.673 50.4235 32.982 48.9445 34.068 48.2155C35.01 47.5945 35.076 46.3555 35.076 46.3435C35.1 45.6955 35.382 45.0775 35.853 44.6425C36.321 44.2075 36.909 43.9555 37.557 44.0065C38.856 44.0365 39.912 45.1285 39.888 46.4425C39.888 46.4605 39.885 47.1175 39.648 48.0295C44.493 52.0525 51.516 52.0375 56.3429 47.9965C56.166 47.2975 56.1209 46.7395 56.109 46.4815C56.097 45.8065 56.337 45.1945 56.79 44.7295C57.234 44.2735 57.834 44.0155 58.4729 44.0035H58.515C59.8139 44.0035 60.891 45.0505 60.921 46.3525C60.921 46.3525 60.99 47.5975 61.923 48.2125C63.0149 48.9325 63.327 50.4055 62.6189 51.5065ZM72.864 23.408C72.171 17.546 69.576 12.128 65.409 7.94C60.63 3.137 54.315 0.5 47.631 0.5C40.947 0.5 34.635 3.137 29.856 7.943C25.671 12.146 23.07 17.594 22.392 23.489C16.653 24.185 11.346 26.858 7.248 31.151C2.574 36.056 0 42.539 0 49.403C0 63.794 11.4 75.5 25.419 75.5H70.578C84.591 75.5 96 63.794 96 49.403C96 35.804 85.812 24.599 72.864 23.408Z"
          fill="white" />
      </svg>
    </div>

    <div class="h2 mb-3">${translation.screens.welcome.title}</div>

    <div>${translation.screens.welcome.body}</div>
  </div>

  <button class="btn btn-primary" onclick="(() => window.ReactNativeWebView.postMessage('onContinue'))()">
    ${translation.screens.welcome.button}
  </button>
`

export const WelcomePage = body

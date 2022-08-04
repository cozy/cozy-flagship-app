const constants = {
    DEFAULT_SOURCE_ACCOUNT_IDENTIFIER: 'boulanger',
    urls: {
        baseUrl : 'https://m.boulanger.com/',
    },
    selectors: {
        accountButtonSelector: 'a[href="/account/auth"]',
        myOrderPageSelector: 'a[href="/account/my-orders"]',
        loginInputSelector: '#identifier',
        passwordInputSelector: '#login-password',
        loginButtonSelector: '.button-login',
        helloMessageSelector: '.account__header__hello',
        accountInfosSelector: 'a[href="/account/personal-informations"]',
        personnalInformations : {
            familyName: '#familyName',
            givenName: '#givenName',
            country: '#country',
            address: '#address',
            addressComplement: '#deliveryAddress',
            postalCode: '#postalCode',
            city:'#city',
            email: '#contactEmail',
            phoneNumber: '#contactPhoneNumberDigits'
        },
        orders: {
            yearList : '#year',
            orderArticles : 'article[class="account-orders lazy"]'
        }
    },
    buttons: {
        backPanelButtonSelector: '.panel__button',
        logoutButtonSelector: 'button[tnr-id="disconnectBtn"]',
        loginButtonSelector: '.button-login',
        downloadFileButtonSelector: '.orders-completed-more-actions__download',
        downloadLinkedFileButtonSelector: '.download-invoices-container__button',
        closePage: '.bl-popin_quit-button'
    }
    
}

export {constants};
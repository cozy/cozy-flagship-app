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
            orderArticles : 'article[class="account-orders lazy"]',
            vendorRef : 'h3[class="product-global-info__id"]',
            date : 'p[class="product-global-info__date"] > span',
            price : 'p[class="product-global-info__price"] > span'
        }
    },
    buttons: {
        backPanelButtonSelector: '.panel__button',
        logoutButtonSelector: 'button[tnr-id="disconnectBtn"]',
        loginButtonSelector: '.button-login',
        downloadFileButtonSelector: '.orders-completed-more-actions__download',
        downloadLinkedFileButtonSelector: '.download-invoices-container__button',
        downloadLinkedFilePopin: '.popin--container--full',
        closePage: 'bl-popin',
        popinHeader : '.bl-popin_wrapper'
    }
    
}

export {constants};
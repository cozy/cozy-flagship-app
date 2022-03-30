export default {
  data: [
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/contacts',
      attributes: {
        category: 'cozy',
        checksum:
          'c3cdaf5d417813dd3a68ce93e1bf4de76da17e044434df391edce2df58159be4',
        created_at: '2022-03-24T09:50:46.9826556+01:00',
        default_locale: 'en',
        description: 'Contact manager for Cozy Cloud',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon.svg',
        intents: [
          {
            action: 'PICK',
            href: '/services',
            type: ['io.cozy.contacts'],
          },
          {
            action: 'CREATE',
            href: '/services',
            type: ['io.cozy.contacts'],
          },
        ],
        langs: ['de', 'en', 'es', 'fr', 'nl_NL'],
        licence: 'AGPL-3.0',
        locales: {
          de: {
            long_description:
              'Mit Cozy Kontakte kannst du :\n\n* deine Kontakte hinzufügen, bearbeiten und sortieren,\n* deine Gruppen von Kontakten verwalten,\n* dein Teilen aus Cozy Drive mit deinen Kontakten erleichtern,\n* deine Google Kontakte synchronisieren,\n* und bald deine Kontakte von deinem Handy und anderen Online-Diensten (iCloud, Facebook, ...) synchronisieren',
            permissions: {
              apps: {
                description:
                  'Benötigt vom Hauptmenü, um die Symbole der Anwendungen anzuzeigen',
              },
              contacts: {
                description: 'Benötigt, um deine Kontakte zu verwalten',
              },
              contactsAccounts: {
                description:
                  'Benötigt, um deine Kontakte mit deinen Remote-Konten zu verbinden',
              },
              contactsgroups: {
                description: 'Benötigt, um Kontaktgruppen zu verwalten',
              },
              triggers: {
                description: 'Benutzt um Kontakte zu sortieren',
              },
            },
            short_description:
              'Cozy Kontakte hilft dir, all deine Kontakte aus deinem Cozy zu speichern, zu sichern und zu verwalten.',
          },
          en: {
            long_description:
              'With Cozy Contacts you can:\n\n* Add, edit and sort your contacts,\n* Manage your groups of contacts,\n* Make your sharing easier from Cozy Drive with your contacts,\n* Synchronise your contacts from Google,\n* And soon, synchronise your contacts from your mobile and other online services (iCloud, Facebook...)',
            permissions: {
              apps: {
                description:
                  'Required by the main menu to display the icons of the apps',
              },
              contacts: {
                description: 'Required to manage your contacts',
              },
              contactsAccounts: {
                description:
                  'Required to link your contacts with your remote accounts',
              },
              contactsgroups: {
                description: 'Required to manage groups of contacts',
              },
              triggers: {
                description: 'Used to sort contacts',
              },
            },
            short_description:
              'Cozy Contacts helps you to save, secure and manage all your contacts from your Cozy.',
          },
          es: {
            long_description:
              'Con Cozy Contacts usted puede:\n\n* Añadir, editar y ordenar sus contactos,\n* Administrar sus grupos de contactos,\n* Compartir con sus contactos desde Cozy Drive,\n* Sincronizar sus contactos desde Google,\n* Y pronto, sincronizar sus contactos desde su móvil y otros servicios online (iCloud, Facebook...)',
            permissions: {
              apps: {
                description:
                  'Requerido por el menú principal para mostrar los iconos de las aplicaciones',
              },
              contacts: {
                description: 'Necesario para administrar sus contactos',
              },
              contactsAccounts: {
                description:
                  'Necesario para vincular sus contactos con sus cuentas remotas',
              },
              contactsgroups: {
                description: 'Necesario para administrar grupo de contactos',
              },
              triggers: {
                description: 'Necesario para clasificar los contactos',
              },
            },
            short_description:
              'Cozy Contacts le ayuda a guardar, proteger y administrar todos sus contactos desde su Cozy',
          },
          fr: {
            long_description:
              "Avec Cozy Contacts vous pouvez : \n\n* Ajouter, modifier et trier vos contacts, \n* Gérer vos groupes de contacts,\n* Faciliter vos partages depuis Cozy Drive avec vos contacts\n* Synchroniser vos contacts depuis Google,\n* Et bientôt, synchroniser vos contacts depuis votre mobile ou d'autres services en ligne (iCloud, Facebook...)",
            permissions: {
              apps: {
                description:
                  'Utilisé pour afficher la liste des applications dans le menu principal',
              },
              contacts: {
                description: 'Utilisé pour gérer vos contacts',
              },
              contactsAccounts: {
                description:
                  'Utilisé pour faire les associations entre vos contacts et vos comptes distants',
              },
              contactsgroups: {
                description: 'Utilisé pour gérer vos groupes de contacts',
              },
              triggers: {
                description: 'Utilisé pour trier les contacts',
              },
            },
            short_description:
              'Cozy Contacts est l’application de sauvegarde, de sécurisation et de gestion centralisée de tous vos contacts depuis votre Cozy.',
          },
          nl_NL: {
            long_description:
              'Met Cozy Contactpersonen kun je:\n\n* Contactpersonen toevoegen, bewerken en sorteren\n* Groepen beheren\n* Het delen vanuit Cozy Schijf vereenvoudigen\n* Je Google-contactpersonen synchroniseren\n* En binnenkort kun je ook contactpersonen synchroniseren van je telefoon en andere online-diensten (iCloud, Facebook, etc.)',
            permissions: {
              apps: {
                description:
                  'Vereist door het hoofdmenu om app-pictogrammen te tonen',
              },
              contacts: {
                description: 'Vereist om je contactpersonen te kunnen beheren',
              },
              contactsAccounts: {
                description:
                  'Vereist om je contactpersonen te koppelen aan online-accounts',
              },
              contactsgroups: {
                description: 'Vereist om groepen te beheren',
              },
              triggers: {
                description: 'Wordt gebruikt om contactpersonen te sorteren',
              },
            },
            short_description:
              'Cozy Contactpersonen helpt je bij het opslaan en beheren van contactpersonen op je Cozy.',
          },
        },
        name: 'Contacts',
        name_prefix: 'Cozy',
        permissions: {
          apps: {
            type: 'io.cozy.apps',
            verbs: ['GET'],
          },
          contacts: {
            type: 'io.cozy.contacts',
          },
          contactsgroups: {
            type: 'io.cozy.contacts.groups',
          },
          contactsAccounts: {
            type: 'io.cozy.contacts.accounts',
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          triggers: {
            type: 'io.cozy.triggers',
            description: 'Used to sort contacts',
            verbs: ['GET', 'POST'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/services': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot01.png',
          'screenshots/fr/screenshot02.png',
          'screenshots/fr/screenshot03.png',
        ],
        services: {
          keepIndexFullNameAndDisplayNameUpToDate: {
            debounce: '5s',
            file: 'services/keepIndexFullNameAndDisplayNameUpToDate/contacts.js',
            trigger: '@event io.cozy.contacts:CREATED,UPDATED',
            type: 'node',
          },
        },
        slug: 'contacts',
        source: 'registry://contacts/stable',
        state: 'ready',
        type: 'webapp',
        updated_at: '2022-03-24T09:50:46.982656+01:00',
        version: '1.0.0',
      },
      meta: {
        rev: '2-deaebd0bf7385ba060fe284055f9328f',
      },
      links: {
        self: '/apps/contacts',
        related: 'http://contacts.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/contacts/icon/1.0.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/drive',
      attributes: {
        categories: ['cozy'],
        checksum:
          '7362f7467ec1a7a6a5676889ae710f140829d6c5048de9574ea6c68d9bab585b',
        created_at: '2022-03-24T09:50:48.4904642+01:00',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'public/app-icon.svg',
        intents: [
          {
            action: 'OPEN',
            href: '/intents',
            type: ['io.cozy.files'],
          },
          {
            action: 'GET_URL',
            href: '/intents',
            type: ['io.cozy.files'],
          },
          {
            action: 'OPEN',
            href: '/intents',
            type: ['io.cozy.suggestions'],
          },
        ],
        langs: ['en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          en: {
            long_description:
              'With Cozy Drive, you can easily:\n- Store your important files and keep them secure in your Cozy\n- Access to all your documents online & offline, from your desktop, and on your smartphone or tablet\n- Share links to files ans folders with who you like;\n- Automatically retrieve bills, payrolls, tax notices and other data from your main online services (internet, energy, retail, mobile, energy, travel...)\n- Upload files to your Cozy from your Android',
            screenshots: [
              'screenshots/en/screenshot01.png',
              'screenshots/en/screenshot02.png',
              'screenshots/en/screenshot03.png',
              'screenshots/en/screenshot04.png',
            ],
            short_description:
              'Cozy Drive helps you to save, sync and secure your files on your Cozy.',
          },
          fr: {
            long_description:
              'Avec Cozy Drive vous pourrez :\n- Sauvegarder et synchroniser gratuitement tous vos documents importants (carte d’identité, photos de vacances, avis d’imposition, fiches de salaires…);\n- Accéder à vos documents n’importe quand, n’importe ou même en mode avion depuis votre bureau, votre smartphone ou tablette;\n- Partager vos fichiers et dossiers par lien avec qui vous le souhaitez;\n- Récupérer automatiquement vos documents administratifs de vos principaux fournisseurs de service (opérateur mobile, fournisseur d’énergie, assureur, internet, santé…);\n- Rester synchronisé·e lors de vos voyages et déplacements professionnels avec nos applications mobiles.',
            screenshots: [
              'screenshots/fr/screenshot01.png',
              'screenshots/fr/screenshot02.png',
              'screenshots/fr/screenshot03.png',
              'screenshots/fr/screenshot04.png',
            ],
            short_description:
              'Cozy Drive est l’application de sauvegarde, de synchronisation et de sécurisation de tous vos fichiers sur Cozy.',
          },
        },
        name: 'Drive',
        name_prefix: 'Cozy',
        permissions: {
          files: {
            type: 'io.cozy.files',
            description: 'Required to access the files',
          },
          allFiles: {
            type: 'io.cozy.files.*',
            description: 'Required to access the files',
          },
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET'],
          },
          sharings: {
            type: 'io.cozy.sharings',
            description: 'Required to have access to the sharings in realtime',
            verbs: ['GET'],
          },
          albums: {
            type: 'io.cozy.photos.albums',
            description: 'Required to manage photos albums',
            verbs: ['PUT'],
          },
          contacts: {
            type: 'io.cozy.contacts',
            verbs: ['GET', 'POST'],
          },
          groups: {
            type: 'io.cozy.contacts.groups',
            verbs: ['GET'],
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          oauth: {
            type: 'io.cozy.oauth.clients',
            description: 'Required to display the cozy-desktop banner',
            verbs: ['GET'],
          },
          reporting: {
            type: 'cc.cozycloud.sentry',
            description:
              'Allow to report unexpected errors to the support team',
            verbs: ['POST'],
          },
          mail: {
            type: 'io.cozy.jobs',
            description: 'Send feedback emails to the support team',
            verbs: ['POST'],
            selector: 'worker',
            values: ['sendmail'],
          },
          konnectors: {
            type: 'io.cozy.konnectors',
            description:
              'Required to display additional information in the viewer for files automatically retrieved by services',
            verbs: ['GET'],
          },
          accounts: {
            type: 'io.cozy.accounts',
            description:
              'Required to display additional information in the viewer for files automatically retrieved by services',
            verbs: ['GET'],
          },
          triggers: {
            type: 'io.cozy.triggers',
            description:
              'Required to display additional information in the viewer for files automatically retrieved by services',
            verbs: ['GET'],
          },
          dacc: {
            type: 'cc.cozycloud.dacc',
            description:
              "Remote-doctype required to send anonymized measures to the DACC shared among mycozy.cloud's Cozy.",
            verbs: ['POST'],
          },
          'dacc-eu': {
            type: 'eu.mycozy.dacc',
            description:
              "Remote-doctype required to send anonymized measures to the DACC shared among mycozy.eu's Cozy.",
            verbs: ['POST'],
          },
        },
        platforms: [
          {
            type: 'ios',
            url: 'https://itunes.apple.com/us/app/cozy-drive/id1224102389?mt=8',
          },
          {
            type: 'android',
            url: 'https://play.google.com/store/apps/details?id=io.cozy.drive.mobile',
          },
        ],
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/intents': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
          '/preview': {
            folder: '/public',
            index: 'index.html',
            public: true,
          },
          '/public': {
            folder: '/public',
            index: 'index.html',
            public: true,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot01.png',
          'screenshots/fr/screenshot02.png',
          'screenshots/fr/screenshot03.png',
          'screenshots/fr/screenshot04.png',
        ],
        services: {
          dacc: {
            file: 'services/dacc/drive.js',
            trigger: '@every 720h',
            type: 'node',
          },
          qualificationMigration: {
            debounce: '24h',
            file: 'services/qualificationMigration/drive.js',
            trigger: '@event io.cozy.files:CREATED,UPDATED',
            type: 'node',
          },
        },
        slug: 'drive',
        source: 'registry://drive/stable',
        state: 'ready',
        type: 'webapp',
        updated_at: '2022-03-24T09:50:48.4904645+01:00',
        version: '1.40.0',
      },
      meta: {
        rev: '2-4e71325746f9dea4b910688e9d0b6cd0',
      },
      links: {
        self: '/apps/drive',
        related: 'http://drive.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/drive/icon/1.40.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/home',
      attributes: {
        categories: ['cozy', 'konnectors'],
        checksum:
          'e41ebe4d57fc64088316caaf96553be7bfca9f50233396bf733302741728285e',
        created_at: '2022-03-24T09:50:47.8156966+01:00',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon.svg',
        intents: [
          {
            action: 'CREATE',
            href: '/intents',
            type: ['io.cozy.accounts'],
          },
          {
            action: 'REDIRECT',
            data: ['account', 'konnector'],
            href: '/#/redirect',
            type: ['io.cozy.accounts'],
          },
        ],
        langs: ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl_NL'],
        licence: 'AGPL-3.0',
        locales: {
          de: {
            changes:
              'Du hast es nicht verpasst, der Store ist in deinem Cozy angekommen!\nWir haben es genutzt, um Collect zu verbessern:\n * Store Anpassungen.\n * Kachelzusammenführung: Wenn du mehrere Konten bei einem Dienst hast, werden diese nun unter die Dienstleister-Kachel zusammengeführt.\n * Verbesserungen einiger Connector-Seiten.',
            long_description:
              'Mit Cozy Collect kannst du ganz einfach:\n * Dokumente all deiner Dienste herunterladen\n * Festlegen, wie häufig Cozy deine Rechnungen holt\n * Direkt auf all die von Cozy gesammelten Dokumente zugreifen',
            name: 'Zuhause',
            short_description:
              'Cozy Collect ist die Anwendung, die dir hilft, alle deine persönlichen Daten in Cozy zu sammeln.',
          },
          en: {
            changes:
              "You haven't missed it, the Store arrived in your Cozy!\nWe took advantage of it to improve Collect:\n * Store adaptation.\n * Tile merge: when you have several accounts for a single supplier, the former are now merged under the supplier tile.\n * Improvement of some Connectors pages.",
            long_description:
              'With Cozy Collect, you can easily:\n * Downloads documents from all your suppliers\n * Set how often Cozy will collect your bills\n * Access directly to the documents gathered by your Cozy',
            name: 'Home',
            short_description:
              'Cozy Collect is the application that help you gather all your personal data inside Cozy.',
          },
          es: {
            changes:
              'Seguro ya se ha dado cuenta, el Store ha llegado a su Cozy\nAprovechamos para mejorar Collect:\n*Adaptación a Store.\n*Fusión de fichas: cuando se tienen diversas cuentas en un proveedor, la primera se fusiona baja la ficha del proveedor.\n*Mejora de algunas páginas de Conectores.',
            long_description:
              'Con Cozy Collect, usted puede facilmente:\n* Descargar documentos de todos sus proveedores\n* Establecer la frecuencia con la que Cozy recopilará sus facturas\n* Acceder directoamente a los documentos recopilados por su Cozy',
            name: 'Inicio',
            short_description:
              'Cozy Collect es la aplicación que le ayuda a recopilar todos sus datos personales que están en Cozy.',
          },
          fr: {
            changes:
              'Cela ne vous aura pas échappé, le Store est arrivé dans Cozy !\nNous en avons profité pour améliorer Collect :\n\n * Adaptation au Store.\n * Fusion des tuiles : lorsque vous avez plusieurs comptes pour un même fournisseur ces derniers sont désormais réunis sous la tuile de ce fournisseur.\n * Amélioration des pages des connecteurs.',
            long_description:
              'Avec Cozy Collect, vous pouvez facilement :\n\n * Télécharger les documents de tous vos fournisseurs\n * Configurer la fréquence à laquelle Cozy va récupérer vos factures\n * Accéder directement aux documents récupérés par votre Cozy',
            name: 'Accueil',
            short_description:
              "Cozy Collect est l'application de récupération de vos données personnelles disponible sur Cozy.",
          },
          it: {
            changes:
              "You haven't missed it, the Store arrived in your Cozy!\nWe took advantage of it to improve Collect:\n * Store adaptation.\n * Tile merge: when you have several accounts for a single supplier, the former are now merged under the supplier tile.\n * Improvement of some Connectors pages.",
            long_description:
              'With Cozy Collect, you can easily:\n * Downloads documents from all your suppliers\n * Set how often Cozy will collect your bills\n * Access directly to the documents gathered by your Cozy',
            name: 'Home',
            short_description:
              'Cozy Collect is the application that help you gather all your personal data inside Cozy.',
          },
          ja: {
            changes:
              'なくなっていません。Cozy にストアが登場しました!\n以下のようなコレクトの改善を行いました:\n* ストアの対応。\n* タイルマージ: サプライヤーのアカウントが複数ある場合、サプライヤータイルの下にマージされます。\n* いくつかのコネクターページの改善。',
            long_description:
              'Cozy コレクトを使用すると、次のことが簡単にできます:\n* すべてのサプライヤーからドキュメントをダウンロード\n* Cozy が請求書を収集する頻度の設定\n* Cozy で集められたドキュメントに直接アクセス',
            name: 'ホーム',
            short_description:
              'Cozy コレクトは、すべてのパーソナルデータを Cozy に収集するのに役立つアプリケーションです。',
          },
          nl_NL: {
            changes:
              "Je kunt het niet gemist hebben: de Winkel is gearriveerd op jouw Cozy!\nWe hebben daar gebruik van gemaakt om Verzamelingen te verbeteren door:\n * winkelintegratie.\n * tegelsamenvoeging: als je meerdere accounts bij dezelfde leverancier hebt, dan zijn ze nu samengevoegd onder één tegel.\n * sommige connector-pagina's te verbeteren.",
            long_description:
              'Met Cozy Verzamelingen kun je eenvoudig:\n * documenten downloaden van al je leveranciers\n * instellen hoe vaak Cozy je rekeningen moet verzamelen\n * toegang krijgen tot documenten die jouw Cozy verzameld heeft',
            name: 'Startpagina',
            short_description:
              'Cozy Verzamelingen is dé app die je helpt al je persoonlijke gegevens binnen Cozy te verzamelen.',
          },
        },
        name: 'Home',
        name_prefix: 'Cozy',
        permissions: {
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET', 'POST', 'PUT'],
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar display Claudy and to know which applications are coming soon',
            verbs: ['GET'],
          },
          konnectors: {
            type: 'io.cozy.konnectors',
            description: 'Required to get the list of konnectors',
            verbs: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          accounts: {
            type: 'io.cozy.accounts',
            description: 'Required to manage accounts associated to konnectors',
            verbs: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          files: {
            type: 'io.cozy.files',
            description: 'Required to access folders',
            verbs: ['GET', 'POST', 'PATCH'],
          },
          jobs: {
            type: 'io.cozy.jobs',
            description: 'Required to run the konnectors',
          },
          contacts: {
            type: 'io.cozy.contacts',
            description:
              'Required for the service to update the myself contact, and to add contacts to contracts/accounts',
          },
          triggers: {
            type: 'io.cozy.triggers',
            description: 'Required to run the konnectors',
          },
          permissions: {
            type: 'io.cozy.permissions',
            description: 'Required to run the konnectors',
          },
          appSuggestions: {
            type: 'io.cozy.apps.suggestions',
            description: 'Required to display konnector suggestions',
            verbs: ['GET', 'PUT'],
          },
          organizations: {
            type: 'com.bitwarden.organizations',
            description: 'Required to update konnector passwords',
          },
          ciphers: {
            type: 'com.bitwarden.ciphers',
            description: 'Required to know if the vault is used or not',
            verbs: ['GET'],
          },
          'bank-accounts': {
            type: 'io.cozy.bank.accounts',
            description: 'Required to edit bank accounts',
          },
          'geojson-timeseries': {
            type: 'io.cozy.timeseries.geojson',
            description: 'Required to display geojson timeseries',
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/intents': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
          '/intro': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
        },
        services: {
          deleteAccounts: {
            file: 'services/deleteAccounts/home.js',
            trigger: '@event com.bitwarden.ciphers:DELETED',
            type: 'node',
          },
          myselfFromIdentities: {
            file: 'services/myselfFromIdenties/home.js',
            trigger: '@event io.cozy.identities:CREATED,UPDATED',
            type: 'node',
          },
          softDeleteOrRestoreAccount: {
            file: 'services/softDeleteOrRestoreAccounts/home.js',
            trigger: '@event com.bitwarden.ciphers:UPDATED:!=:deletedDate',
            type: 'node',
          },
          updateAccounts: {
            file: 'services/updateAccounts/home.js',
            trigger: '@event com.bitwarden.ciphers:UPDATED',
            type: 'node',
          },
        },
        slug: 'home',
        source: 'registry://home/stable',
        state: 'ready',
        type: 'webapp',
        updated_at: '2022-03-24T09:50:47.8156969+01:00',
        version: '1.45.0',
      },
      meta: {
        rev: '2-e310b709584596f766c48c106cf850e3',
      },
      links: {
        self: '/apps/home',
        related: 'http://home.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/home/icon/1.45.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/notes',
      attributes: {
        categories: ['cozy'],
        checksum:
          'ebaf7fe29718a4553bbaee8924206d8b1eb294ec838fcd96c329b40843aefc90',
        created_at: '2022-03-24T09:50:47.8005229+01:00',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon.svg',
        langs: ['atlassian_missing_french', 'en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          atlassian_missing_french: {},
          en: {
            long_description:
              'Notes is an online text editor that can already offer you to:\n\n* Create your own notes with the essential features (bold, underlined, links, tables...)\n* Fill and find your notes with you other documents in files of your personal Drive\n* Edit easily your notes from all your devices\n* Access your notes offline\n* For the fans, use shortcuts and input in markdown format ... and even write with contacts together on the same note (coming soon)!',
            screenshots: [
              'screenshots/en/screenshot01.png',
              'screenshots/en/screenshot02.png',
            ],
            short_description:
              'Cozy Notes is your personal and collaborative note-taking application.',
          },
          fr: {
            long_description:
              'Notes est un éditeur de texte en ligne destiné à :\n\n* Créer vos propres notes avec les fonctionnalités essentielles (gras, souligné, liens, tableaux...)\n* Classer et retrouver vos notes avec vos autres documents, dans les répertoires de votre Drive personnel\n* Éditer facilement vos notes depuis tous vos appareils\n* Accéder à vos notes, même sans internet, stockées sur votre PC\n* Pour les aficionados, utiliser les raccourcis et la saisie au format markdown\n*  ... et même écrire à plusieurs simultanément sur la même note (à venir) ! ',
            screenshots: [
              'screenshots/fr/screenshot01.png',
              'screenshots/fr/screenshot02.png',
            ],
            short_description:
              'Cozy Notes est votre application de prise de notes personnelles et collaboratives.',
          },
        },
        name: 'Notes',
        name_prefix: 'Cozy',
        permissions: {
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET'],
          },
          files: {
            type: 'io.cozy.files',
            description: 'Notes as files',
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          sharings: {
            type: 'io.cozy.sharings',
            description: 'Required to have access to the sharings in realtime',
            verbs: ['GET'],
          },
          contacts: {
            type: 'io.cozy.contacts',
            verbs: ['GET', 'POST'],
          },
          groups: {
            type: 'io.cozy.contacts.groups',
            verbs: ['GET'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/preview': {
            folder: '/',
            index: 'index.html',
            public: true,
          },
          '/public': {
            folder: '/',
            index: 'index.html',
            public: true,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot01.png',
          'screenshots/fr/screenshot02.png',
        ],
        slug: 'notes',
        source: 'registry://notes/stable',
        state: 'ready',
        updated_at: '2022-03-24T09:50:47.8005232+01:00',
        version: '1.19.0',
      },
      meta: {
        rev: '1-db0903137930af10a0d0c4abcffa22df',
      },
      links: {
        self: '/apps/notes',
        related: 'http://notes.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/notes/icon/1.19.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/passwords',
      attributes: {
        categories: ['cozy'],
        checksum:
          '3ce829f80b5d92560398f98554858f71ca142b8c6a9354ca231b149d6ddc91a5',
        created_at: '2022-03-24T09:50:48.1324987+01:00',
        default_locale: 'en',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon.svg',
        langs: ['en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          en: {
            changes: '',
            long_description:
              'Save your passwords and log in to sites with a single click. Cozy Pass remembers and synchronises all your passwords for you. By installing the password manager, your digital life will be more secure and simple.\n\n- Get your passwords from anywhere\n\nYour passwords will be saved once and for all in your 100% personal and secured safe that you can access from your mobile thanks to the Cozy Pass app.\nThe Cozy pass app also allows you to store payments details and identity details that will help you fill in forms.\nThe access is secured thanks to your Cozy password, but you can also lock your mobile app with fingerprint or a PIN code.\nBy default any item in your password manager is only readable by you, secured by your password. Even Cozy Cloud is unable to access your vault.\n\n- Log in automatically on your apps and websites\n\nYour cozy will allow you to instantly fill in the forms of websites, for easy connection to all your services.\nIt will offer you to save credentials that you manually fill in on your websites so that Cozy Pass can fill in them for you for the next connections.\nIt will also offer to generate strong and secured passwords when you need to create accounts.\n\n- Your passwords synchronized accross all your devices\n\nCozy Pass ensures that your credentials are always up to date accross your different devices. Data is synchronized between the mobile app and the add-on on your computer browsers.\n\n- Retrieve your data more easily in your Cozy\n\nYou can connect your brands to your Cozy to recover your data in the blink of an eye. Cozy Pass will highlight brands that can be synchronized to your Cozy and make it easier to connect them. Whenever your credentials are edited, Cozy Pass will be able to be updated and secure the synchronization automatically.\n\n\n- Cozy Pass is secured thanks to Bitwarden technology\n\nAs an open source company, we have worked on password management technologies by screening the best open source global experts on this field. Our open-source philosphy enables independant experts accross the globe to audit our work and make sure our code is secure, stable and flawless. We use the Bitwarden thechnology with GPL 3.0 licence as mentionned here . https://github.com/bitwarden/mobile/blob/master/LICENSE.txt.',
            screenshots: [
              'screenshots/en/screenshot01.png',
              'screenshots/en/screenshot02.png',
              'screenshots/en/screenshot03.png',
            ],
            short_description: "Escape the password's hell.",
          },
          fr: {
            changes: '',
            long_description:
              'Avec Cozy Pass, vos mots de passe, moyens de paiement et coordonnées sont regroupés et chiffrés au sein de votre cloud personnel dont vous êtes l\'unique propriétaire.\n\nCozy Pass vous simplifie et sécurise vos mots de passe : finis les post-it et autres "maman1234" !\n\nEnfin sécurité va rimer avec simplicité.\n\n- Il enregistre et renseigne automatiquement tous vos mots de passe lorsque vous naviguez sur Internet\n- Vos mots de passe sont désormais sûrs car tous différents, C0mpl3x3s et stockés chiffrés\n- Il synchronise vos mots de passe entre vos ordinateurs, navigateurs et téléphone : vos mots de passe accessibles à tout moment, n\'importe où et à jour\n- Il remplit en un clic les formulaires (nom, prénom, date de naissance, numéro de carte bancaire, adresse de livraison...)\n- Il importe vos mots de passe déjà enregistrés dans un autre gestionnaire ou navigateur\n- Il crée des mots de passe sécurisés avec le générateur de mots de passe\n- Il utilise la technologie Bitwarden sous licence GPL 3.0 comme mentionné ici https://github.com/bitwarden/mobile/blob/master/LICENSE.txt',
            screenshots: [
              'screenshots/fr/screenshot01.png',
              'screenshots/fr/screenshot02.png',
              'screenshots/fr/screenshot03.png',
            ],
            short_description: "Libérez-vous de l'enfer des mots de passe.",
          },
        },
        name: 'Pass',
        name_prefix: 'Cozy',
        permissions: {
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET'],
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET', 'PUT'],
          },
          organizations: {
            type: 'com.bitwarden.organizations',
            description: 'Required to share passwords with other people',
          },
          contacts_bitwarden: {
            type: 'com.bitwarden.contacts',
            description: 'Required to share passwords with other people',
          },
          ciphers: {
            type: 'com.bitwarden.ciphers',
            description: 'Required to share passwords with other people',
          },
          contacts: {
            type: 'io.cozy.contacts',
            description: 'Required to share passwords with other people',
            verbs: ['GET', 'POST'],
          },
          groups: {
            type: 'io.cozy.contacts.groups',
            description: 'Required to share passwords with other people',
            verbs: ['GET'],
          },
          sharings: {
            type: 'io.cozy.sharings',
            description: 'Required to have access to the sharings in realtime',
            verbs: ['GET', 'POST'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/public': {
            folder: '/',
            index: 'index.html',
            public: true,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot01.png',
          'screenshots/fr/screenshot02.png',
          'screenshots/fr/screenshot03.png',
        ],
        slug: 'passwords',
        source: 'registry://passwords/stable',
        state: 'ready',
        updated_at: '2022-03-24T09:50:48.132499+01:00',
        version: '2.0.4',
      },
      meta: {
        rev: '1-3301033b5a3878e1f161de24e90cf511',
      },
      links: {
        self: '/apps/passwords',
        related: 'http://passwords.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/passwords/icon/2.0.4',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/photos',
      attributes: {
        categories: ['cozy'],
        checksum:
          '0a980c6e1371814b5063801897155eb6439f12a66e6acdfbade91a69df1213d5',
        created_at: '2022-03-24T09:50:48.3708008+01:00',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'public/app-icon.svg',
        langs: ['en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          en: {
            long_description:
              'With Cozy Photos, you can:\n- Get a timeline of all your memories\n- Organize your photos through albums\n- Share albums with just a link',
            screenshots: [
              'screenshots/en/screenshot01.jpg',
              'screenshots/en/screenshot02.jpg',
              'screenshots/en/screenshot03.jpg',
            ],
            short_description:
              'Cozy Photos allows you to view and manage your photos on your Cozy',
          },
          fr: {
            long_description:
              'Avec Cozy Photos vous pourrez :\n- Visualiser toutes les photos présentes dans votre Cozy, classées par date;\n- Organisez vos photos en albums;\n- Partager vos albums avec qui vous le souhaitez.',
            screenshots: [
              'screenshots/fr/screenshot01.jpg',
              'screenshots/fr/screenshot02.jpg',
              'screenshots/fr/screenshot03.jpg',
            ],
            short_description:
              'Cozy Photos est l’application de visualisation et gestion de vos photos sur Cozy.',
          },
        },
        name: 'Photos',
        name_prefix: 'Cozy',
        permissions: {
          files: {
            type: 'io.cozy.files',
            description: 'Required for photo access',
            verbs: ['GET', 'POST', 'PUT', 'PATCH'],
          },
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET', 'PUT'],
          },
          albums: {
            type: 'io.cozy.photos.albums',
            description: 'Required to manage photos albums',
            verbs: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          },
          photos_settings: {
            type: 'io.cozy.photos.settings',
            description: 'Required to manage photos albums settings',
            verbs: ['GET', 'POST', 'PUT'],
          },
          contacts: {
            type: 'io.cozy.contacts',
            description: 'Required to to share photos with your contacts',
            verbs: ['GET', 'POST'],
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          oauth: {
            type: 'io.cozy.oauth.clients',
            description: 'Required to display the cozy-desktop banner',
            verbs: ['GET'],
          },
          reporting: {
            type: 'cc.cozycloud.sentry',
            description:
              'Allow to report unexpected errors to the support team',
            verbs: ['POST'],
          },
          triggers: {
            type: 'io.cozy.triggers',
            description: 'Required to re-execute the clustering',
            verbs: ['POST'],
            selector: 'worker',
            values: ['service'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/public': {
            folder: '/public',
            index: 'index.html',
            public: true,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot01.jpg',
          'screenshots/fr/screenshot02.jpg',
          'screenshots/fr/screenshot03.jpg',
        ],
        services: {
          onPhotoUpload: {
            debounce: '5m',
            file: 'services/onPhotoUpload/photos.js',
            trigger: '@event io.cozy.files:CREATED:image:class',
            type: 'node',
          },
        },
        slug: 'photos',
        source: 'registry://photos/stable',
        state: 'ready',
        type: 'webapp',
        updated_at: '2022-03-24T09:50:48.3708011+01:00',
        version: '1.40.0',
      },
      meta: {
        rev: '2-8ce59071f137483b50b4fd06443e9fdf',
      },
      links: {
        self: '/apps/photos',
        related: 'http://photos.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/photos/icon/1.40.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/settings',
      attributes: {
        checksum:
          '84fc49fde16c465c59ad0ce4e99421fbf1453b297a8b1eddf5808bbf8f197631',
        created_at: '2022-03-24T09:50:47.066319+01:00',
        developer: {
          name: 'Cozy',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'app-icon.svg',
        intents: [
          {
            action: 'CLAUDY',
            href: '/services/claudy',
            type: ['io.cozy.settings'],
          },
          {
            action: 'SUPPORT',
            href: '/services/support',
            type: ['io.cozy.settings'],
          },
          {
            action: 'REDIRECT',
            href: '/#/redirect',
            type: ['io.cozy.settings'],
          },
        ],
        langs: ['de', 'de_DE', 'en', 'es', 'fr', 'ja', 'nl_NL'],
        licence: 'AGPL-3.0',
        locales: {
          de: {
            name: 'Einstellungen',
          },
          de_DE: {
            name: 'Einstellungen',
          },
          en: {
            name: 'Settings',
          },
          es: {
            name: 'Ajustes',
          },
          fr: {
            name: 'Paramètres',
          },
          ja: {
            name: '設定',
          },
          nl_NL: {
            name: 'Instellingen',
          },
        },
        name: 'Settings',
        name_prefix: 'Cozy',
        permissions: {
          settings: {
            type: 'io.cozy.settings',
            description: 'Required to manage your settings',
            verbs: ['GET', 'POST', 'PUT'],
          },
          exports: {
            type: 'io.cozy.exports',
            description: 'Required to export the Cozy data',
            verbs: ['GET', 'POST'],
          },
          imports: {
            type: 'io.cozy.imports',
            description: 'Required to import the Cozy data',
            verbs: ['GET', 'POST'],
          },
          sessions: {
            type: 'io.cozy.sessions.logins',
            description: 'Required to manage your sessions',
            verbs: ['GET'],
          },
          current_sessions: {
            type: 'io.cozy.sessions',
            description: 'Required to manage your sessions',
            verbs: ['GET'],
          },
          oauth: {
            type: 'io.cozy.oauth.clients',
            description: 'Required to manage devices connected to your Cozy',
            verbs: ['GET', 'DELETE'],
          },
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET', 'POST', 'PUT'],
          },
          accounts: {
            type: 'io.cozy.accounts',
            description: 'Required to manage accounts associated to konnectors',
            verbs: ['GET'],
          },
          jobs: {
            type: 'io.cozy.jobs',
            description: 'Required to send emails to support',
          },
          files: {
            type: 'io.cozy.files',
            description: 'Required to select folders to synchronize on devices',
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/services/claudy': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
          '/services/support': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
        },
        slug: 'settings',
        source: 'registry://settings/stable',
        state: 'ready',
        type: 'webapp',
        updated_at: '2022-03-24T09:50:47.0663192+01:00',
        version: '1.17.0',
      },
      meta: {
        rev: '1-1239ac950a35ca9fa0fda50becbbbbce',
      },
      links: {
        self: '/apps/settings',
        related: 'http://settings.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/settings/icon/1.17.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/store',
      attributes: {
        categories: ['cozy'],
        checksum:
          '62bddd6b97ef87b029a6c98e96975cec31a818ab11aa1589f0d5b488494df53f',
        created_at: '2022-03-24T09:50:46.4249681+01:00',
        description: 'The apps store for Cozy V3',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon-store.svg',
        intents: [
          {
            action: 'REDIRECT',
            data: [
              'category',
              'doctype',
              'slug',
              'tag',
              'type',
              'pendingUpdate',
              'step',
            ],
            href: '/#/redirect',
            type: ['io.cozy.apps'],
          },
          {
            action: 'INSTALL',
            data: ['slug'],
            href: '/intents',
            type: ['io.cozy.apps'],
          },
        ],
        licence: 'AGPL-3.0',
        locales: {},
        name: 'Store',
        name_prefix: 'Cozy',
        permissions: {
          terms: {
            type: 'io.cozy.terms',
            description: 'Required to save accepted applications terms',
          },
          apps: {
            type: 'io.cozy.apps',
            description: 'Required to manage applications',
          },
          konnectors: {
            type: 'io.cozy.konnectors',
            description: 'Required to manage konnectors',
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/intents': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
        },
        slug: 'store',
        source: 'registry://store/stable',
        state: 'ready',
        type: 'webapp',
        updated_at: '2022-03-24T09:50:46.4249683+01:00',
        version: '1.9.11',
      },
      meta: {
        rev: '1-39b56b16e95e4ec6a343306483e725d8',
      },
      links: {
        self: '/apps/store',
        related: 'http://store.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/store/icon/1.9.11',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/store',
      attributes: {
        categories: ['cozy'],
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        description: 'The apps store for Cozy V3',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon-store.svg',
        intents: [
          {
            action: 'REDIRECT',
            data: [
              'category',
              'doctype',
              'slug',
              'tag',
              'type',
              'pendingUpdate',
              'step',
            ],
            href: '/#/redirect',
            type: ['io.cozy.apps'],
          },
          {
            action: 'INSTALL',
            data: ['slug'],
            href: '/intents',
            type: ['io.cozy.apps'],
          },
        ],
        licence: 'AGPL-3.0',
        locales: {},
        name: 'Store',
        name_prefix: 'Cozy',
        permissions: {
          terms: {
            type: 'io.cozy.terms',
            description: 'Required to save accepted applications terms',
          },
          apps: {
            type: 'io.cozy.apps',
            description: 'Required to manage applications',
          },
          konnectors: {
            type: 'io.cozy.konnectors',
            description: 'Required to manage konnectors',
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/intents': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
        },
        slug: 'store',
        source: 'file://localhost/home/anc/cozy/cozy-store/build',
        state: 'ready',
        type: 'webapp',
        updated_at: '0001-01-01T00:00:00Z',
        version: '1.9.11',
      },
      meta: {},
      links: {
        self: '/apps/store',
        related: 'http://store.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/store/icon/1.9.11',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/mespapiers',
      attributes: {
        categories: [],
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        developer: {
          name: 'cozy',
          url: '',
        },
        editor: 'Cozy',
        icon: 'icon.svg',
        langs: ['en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          en: {},
          fr: {},
        },
        name: 'Mes papiers',
        permissions: {
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET'],
          },
          contacts: {
            type: 'io.cozy.contacts.*',
            description: 'Required to access the contacts',
            verbs: ['GET'],
          },
          files: {
            type: 'io.cozy.files',
            description: 'Required to access the files',
          },
          sharings: {
            type: 'io.cozy.sharings',
            description: 'Required to have access to the sharings in realtime',
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          'mespapiers.settings': {
            type: 'io.cozy.mespapiers.settings',
            description: 'Used to manage your papers settings',
            verbs: ['GET', 'POST', 'PUT'],
          },
          permissions: {
            type: 'io.cozy.permissions',
            description: 'Required to run the konnectors',
          },
          konnectors: {
            type: 'io.cozy.konnectors',
            description:
              'Required to display additional information in the viewer for files automatically retrieved by services',
            verbs: ['GET'],
          },
          accounts: {
            type: 'io.cozy.accounts',
            description:
              'Required to display additional information in the viewer for files automatically retrieved by services',
            verbs: ['GET'],
          },
          triggers: {
            type: 'io.cozy.triggers',
            description:
              'Required to display additional information in the viewer for files automatically retrieved by services',
            verbs: ['GET'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
        },
        slug: 'mespapiers',
        source: 'file://localhost/home/anc/cozy/mespapiers/build',
        state: 'ready',
        updated_at: '0001-01-01T00:00:00Z',
        version: '0.1.0',
      },
      meta: {},
      links: {
        self: '/apps/mespapiers',
        related: 'http://mespapiers.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/mespapiers/icon/0.1.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/coachco2',
      attributes: {
        categories: [],
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        developer: {
          name: 'cozy',
          url: '',
        },
        editor: 'Cozy Cloud',
        icon: 'icon.svg',
        langs: ['en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          en: {},
          fr: {},
        },
        name: 'Coach CO2',
        permissions: {
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET'],
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          accounts: {
            type: 'io.cozy.accounts',
            description: 'Required to get konnector account',
            verbs: ['GET'],
          },
          files: {
            type: 'io.cozy.files',
            description:
              'Required to access the files for saved your export of trips',
          },
          'geojson-timeseries': {
            type: 'io.cozy.timeseries.geojson',
            description: 'Required to display geojson timeseries',
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
        },
        slug: 'coachco2',
        source: 'file://localhost/home/anc/cozy/coachco2/build',
        state: 'ready',
        updated_at: '0001-01-01T00:00:00Z',
        version: '0.4.0',
      },
      meta: {},
      links: {
        self: '/apps/coachco2',
        related: 'http://coachco2.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/coachco2/icon/0.4.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/photos',
      attributes: {
        categories: ['cozy'],
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'public/app-icon.svg',
        langs: ['en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          en: {
            long_description:
              'With Cozy Photos, you can:\n- Get a timeline of all your memories\n- Organize your photos through albums\n- Share albums with just a link',
            screenshots: [
              'screenshots/en/screenshot01.jpg',
              'screenshots/en/screenshot02.jpg',
              'screenshots/en/screenshot03.jpg',
            ],
            short_description:
              'Cozy Photos allows you to view and manage your photos on your Cozy',
          },
          fr: {
            long_description:
              'Avec Cozy Photos vous pourrez :\n- Visualiser toutes les photos présentes dans votre Cozy, classées par date;\n- Organisez vos photos en albums;\n- Partager vos albums avec qui vous le souhaitez.',
            screenshots: [
              'screenshots/fr/screenshot01.jpg',
              'screenshots/fr/screenshot02.jpg',
              'screenshots/fr/screenshot03.jpg',
            ],
            short_description:
              'Cozy Photos est l’application de visualisation et gestion de vos photos sur Cozy.',
          },
        },
        name: 'Photos',
        name_prefix: 'Cozy',
        permissions: {
          files: {
            type: 'io.cozy.files',
            description: 'Required for photo access',
            verbs: ['GET', 'POST', 'PUT', 'PATCH'],
          },
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET', 'PUT'],
          },
          albums: {
            type: 'io.cozy.photos.albums',
            description: 'Required to manage photos albums',
            verbs: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          },
          photos_settings: {
            type: 'io.cozy.photos.settings',
            description: 'Required to manage photos albums settings',
            verbs: ['GET', 'POST', 'PUT'],
          },
          contacts: {
            type: 'io.cozy.contacts',
            description: 'Required to to share photos with your contacts',
            verbs: ['GET', 'POST'],
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          oauth: {
            type: 'io.cozy.oauth.clients',
            description: 'Required to display the cozy-desktop banner',
            verbs: ['GET'],
          },
          reporting: {
            type: 'cc.cozycloud.sentry',
            description:
              'Allow to report unexpected errors to the support team',
            verbs: ['POST'],
          },
          triggers: {
            type: 'io.cozy.triggers',
            description: 'Required to re-execute the clustering',
            verbs: ['POST'],
            selector: 'worker',
            values: ['service'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/public': {
            folder: '/public',
            index: 'index.html',
            public: true,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot01.jpg',
          'screenshots/fr/screenshot02.jpg',
          'screenshots/fr/screenshot03.jpg',
        ],
        services: {
          onPhotoUpload: {
            debounce: '5m',
            file: 'services/onPhotoUpload/photos.js',
            trigger: '@event io.cozy.files:CREATED:image:class',
            type: 'node',
          },
        },
        slug: 'photos',
        source: 'file://localhost/home/anc/cozy/cozy-drive/build/photos',
        state: 'ready',
        type: 'webapp',
        updated_at: '0001-01-01T00:00:00Z',
        version: '1.41.0',
      },
      meta: {},
      links: {
        self: '/apps/photos',
        related: 'http://photos.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/photos/icon/1.41.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/notes',
      attributes: {
        categories: ['cozy'],
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon.svg',
        langs: ['atlassian_missing_french', 'en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          atlassian_missing_french: {},
          en: {
            long_description:
              'Notes is an online text editor that can already offer you to:\n\n* Create your own notes with the essential features (bold, underlined, links, tables...)\n* Fill and find your notes with you other documents in files of your personal Drive\n* Edit easily your notes from all your devices\n* Access your notes offline\n* For the fans, use shortcuts and input in markdown format ... and even write with contacts together on the same note (coming soon)!',
            screenshots: [
              'screenshots/en/screenshot01.png',
              'screenshots/en/screenshot02.png',
            ],
            short_description:
              'Cozy Notes is your personal and collaborative note-taking application.',
          },
          fr: {
            long_description:
              'Notes est un éditeur de texte en ligne destiné à :\n\n* Créer vos propres notes avec les fonctionnalités essentielles (gras, souligné, liens, tableaux...)\n* Classer et retrouver vos notes avec vos autres documents, dans les répertoires de votre Drive personnel\n* Éditer facilement vos notes depuis tous vos appareils\n* Accéder à vos notes, même sans internet, stockées sur votre PC\n* Pour les aficionados, utiliser les raccourcis et la saisie au format markdown\n*  ... et même écrire à plusieurs simultanément sur la même note (à venir) ! ',
            screenshots: [
              'screenshots/fr/screenshot01.png',
              'screenshots/fr/screenshot02.png',
            ],
            short_description:
              'Cozy Notes est votre application de prise de notes personnelles et collaboratives.',
          },
        },
        name: 'Notes',
        name_prefix: 'Cozy',
        permissions: {
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET'],
          },
          files: {
            type: 'io.cozy.files',
            description: 'Notes as files',
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          sharings: {
            type: 'io.cozy.sharings',
            description: 'Required to have access to the sharings in realtime',
            verbs: ['GET'],
          },
          contacts: {
            type: 'io.cozy.contacts',
            verbs: ['GET', 'POST'],
          },
          groups: {
            type: 'io.cozy.contacts.groups',
            verbs: ['GET'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/preview': {
            folder: '/',
            index: 'index.html',
            public: true,
          },
          '/public': {
            folder: '/',
            index: 'index.html',
            public: true,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot01.png',
          'screenshots/fr/screenshot02.png',
        ],
        slug: 'notes',
        source: 'file://localhost/home/anc/cozy/cozy-notes/build',
        state: 'ready',
        updated_at: '0001-01-01T00:00:00Z',
        version: '1.20.0',
      },
      meta: {},
      links: {
        self: '/apps/notes',
        related: 'http://notes.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/notes/icon/1.20.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/contacts',
      attributes: {
        category: 'cozy',
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        default_locale: 'en',
        description: 'Contact manager for Cozy Cloud',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon.svg',
        intents: [
          {
            action: 'PICK',
            href: '/services',
            type: ['io.cozy.contacts'],
          },
          {
            action: 'CREATE',
            href: '/services',
            type: ['io.cozy.contacts'],
          },
        ],
        langs: ['de', 'en', 'es', 'fr', 'nl_NL'],
        licence: 'AGPL-3.0',
        locales: {
          de: {
            long_description:
              'Mit Cozy Kontakte kannst du :\n\n* deine Kontakte hinzufügen, bearbeiten und sortieren,\n* deine Gruppen von Kontakten verwalten,\n* dein Teilen aus Cozy Drive mit deinen Kontakten erleichtern,\n* deine Google Kontakte synchronisieren,\n* und bald deine Kontakte von deinem Handy und anderen Online-Diensten (iCloud, Facebook, ...) synchronisieren',
            permissions: {
              apps: {
                description:
                  'Benötigt vom Hauptmenü, um die Symbole der Anwendungen anzuzeigen',
              },
              contacts: {
                description: 'Benötigt, um deine Kontakte zu verwalten',
              },
              contactsAccounts: {
                description:
                  'Benötigt, um deine Kontakte mit deinen Remote-Konten zu verbinden',
              },
              contactsgroups: {
                description: 'Benötigt, um Kontaktgruppen zu verwalten',
              },
              triggers: {
                description: 'Benutzt um Kontakte zu sortieren',
              },
            },
            short_description:
              'Cozy Kontakte hilft dir, all deine Kontakte aus deinem Cozy zu speichern, zu sichern und zu verwalten.',
          },
          en: {
            long_description:
              'With Cozy Contacts you can:\n\n* Add, edit and sort your contacts,\n* Manage your groups of contacts,\n* Make your sharing easier from Cozy Drive with your contacts,\n* Synchronise your contacts from Google,\n* And soon, synchronise your contacts from your mobile and other online services (iCloud, Facebook...)',
            permissions: {
              apps: {
                description:
                  'Required by the main menu to display the icons of the apps',
              },
              contacts: {
                description: 'Required to manage your contacts',
              },
              contactsAccounts: {
                description:
                  'Required to link your contacts with your remote accounts',
              },
              contactsgroups: {
                description: 'Required to manage groups of contacts',
              },
              triggers: {
                description: 'Used to sort contacts',
              },
            },
            short_description:
              'Cozy Contacts helps you to save, secure and manage all your contacts from your Cozy.',
          },
          es: {
            long_description:
              'Con Cozy Contacts usted puede:\n\n* Añadir, editar y ordenar sus contactos,\n* Administrar sus grupos de contactos,\n* Compartir con sus contactos desde Cozy Drive,\n* Sincronizar sus contactos desde Google,\n* Y pronto, sincronizar sus contactos desde su móvil y otros servicios online (iCloud, Facebook...)',
            permissions: {
              apps: {
                description:
                  'Requerido por el menú principal para mostrar los iconos de las aplicaciones',
              },
              contacts: {
                description: 'Necesario para administrar sus contactos',
              },
              contactsAccounts: {
                description:
                  'Necesario para vincular sus contactos con sus cuentas remotas',
              },
              contactsgroups: {
                description: 'Necesario para administrar grupo de contactos',
              },
              triggers: {
                description: 'Necesario para clasificar los contactos',
              },
            },
            short_description:
              'Cozy Contacts le ayuda a guardar, proteger y administrar todos sus contactos desde su Cozy',
          },
          fr: {
            long_description:
              "Avec Cozy Contacts vous pouvez : \n\n* Ajouter, modifier et trier vos contacts, \n* Gérer vos groupes de contacts,\n* Faciliter vos partages depuis Cozy Drive avec vos contacts\n* Synchroniser vos contacts depuis Google,\n* Et bientôt, synchroniser vos contacts depuis votre mobile ou d'autres services en ligne (iCloud, Facebook...)",
            permissions: {
              apps: {
                description:
                  'Utilisé pour afficher la liste des applications dans le menu principal',
              },
              contacts: {
                description: 'Utilisé pour gérer vos contacts',
              },
              contactsAccounts: {
                description:
                  'Utilisé pour faire les associations entre vos contacts et vos comptes distants',
              },
              contactsgroups: {
                description: 'Utilisé pour gérer vos groupes de contacts',
              },
              triggers: {
                description: 'Utilisé pour trier les contacts',
              },
            },
            short_description:
              'Cozy Contacts est l’application de sauvegarde, de sécurisation et de gestion centralisée de tous vos contacts depuis votre Cozy.',
          },
          nl_NL: {
            long_description:
              'Met Cozy Contactpersonen kun je:\n\n* Contactpersonen toevoegen, bewerken en sorteren\n* Groepen beheren\n* Het delen vanuit Cozy Schijf vereenvoudigen\n* Je Google-contactpersonen synchroniseren\n* En binnenkort kun je ook contactpersonen synchroniseren van je telefoon en andere online-diensten (iCloud, Facebook, etc.)',
            permissions: {
              apps: {
                description:
                  'Vereist door het hoofdmenu om app-pictogrammen te tonen',
              },
              contacts: {
                description: 'Vereist om je contactpersonen te kunnen beheren',
              },
              contactsAccounts: {
                description:
                  'Vereist om je contactpersonen te koppelen aan online-accounts',
              },
              contactsgroups: {
                description: 'Vereist om groepen te beheren',
              },
              triggers: {
                description: 'Wordt gebruikt om contactpersonen te sorteren',
              },
            },
            short_description:
              'Cozy Contactpersonen helpt je bij het opslaan en beheren van contactpersonen op je Cozy.',
          },
        },
        name: 'Contacts',
        name_prefix: 'Cozy',
        permissions: {
          apps: {
            type: 'io.cozy.apps',
            verbs: ['GET'],
          },
          contacts: {
            type: 'io.cozy.contacts',
          },
          contactsgroups: {
            type: 'io.cozy.contacts.groups',
          },
          contactsAccounts: {
            type: 'io.cozy.contacts.accounts',
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          triggers: {
            type: 'io.cozy.triggers',
            description: 'Used to sort contacts',
            verbs: ['GET', 'POST'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/services': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot01.png',
          'screenshots/fr/screenshot02.png',
          'screenshots/fr/screenshot03.png',
        ],
        services: {
          keepIndexFullNameAndDisplayNameUpToDate: {
            debounce: '5s',
            file: 'services/keepIndexFullNameAndDisplayNameUpToDate/contacts.js',
            trigger: '@event io.cozy.contacts:CREATED,UPDATED',
            type: 'node',
          },
        },
        slug: 'contacts',
        source: 'file://localhost/home/anc/cozy/cozy-contacts/build',
        state: 'ready',
        type: 'webapp',
        updated_at: '0001-01-01T00:00:00Z',
        version: '1.1.0',
      },
      meta: {},
      links: {
        self: '/apps/contacts',
        related: 'http://contacts.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/contacts/icon/1.1.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/home',
      attributes: {
        categories: ['cozy', 'konnectors'],
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon.svg',
        intents: [
          {
            action: 'CREATE',
            href: '/intents',
            type: ['io.cozy.accounts'],
          },
          {
            action: 'REDIRECT',
            data: ['account', 'konnector'],
            href: '/#/redirect',
            type: ['io.cozy.accounts'],
          },
        ],
        langs: ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl_NL'],
        licence: 'AGPL-3.0',
        locales: {
          de: {
            changes:
              'Du hast es nicht verpasst, der Store ist in deinem Cozy angekommen!\nWir haben es genutzt, um Collect zu verbessern:\n * Store Anpassungen.\n * Kachelzusammenführung: Wenn du mehrere Konten bei einem Dienst hast, werden diese nun unter die Dienstleister-Kachel zusammengeführt.\n * Verbesserungen einiger Connector-Seiten.',
            long_description:
              'Mit Cozy Collect kannst du ganz einfach:\n * Dokumente all deiner Dienste herunterladen\n * Festlegen, wie häufig Cozy deine Rechnungen holt\n * Direkt auf all die von Cozy gesammelten Dokumente zugreifen',
            name: 'Zuhause',
            short_description:
              'Cozy Collect ist die Anwendung, die dir hilft, alle deine persönlichen Daten in Cozy zu sammeln.',
          },
          en: {
            changes:
              "You haven't missed it, the Store arrived in your Cozy!\nWe took advantage of it to improve Collect:\n * Store adaptation.\n * Tile merge: when you have several accounts for a single supplier, the former are now merged under the supplier tile.\n * Improvement of some Connectors pages.",
            long_description:
              'With Cozy Collect, you can easily:\n * Downloads documents from all your suppliers\n * Set how often Cozy will collect your bills\n * Access directly to the documents gathered by your Cozy',
            name: 'Home',
            short_description:
              'Cozy Collect is the application that help you gather all your personal data inside Cozy.',
          },
          es: {
            changes:
              'Seguro ya se ha dado cuenta, el Store ha llegado a su Cozy\nAprovechamos para mejorar Collect:\n*Adaptación a Store.\n*Fusión de fichas: cuando se tienen diversas cuentas en un proveedor, la primera se fusiona baja la ficha del proveedor.\n*Mejora de algunas páginas de Conectores.',
            long_description:
              'Con Cozy Collect, usted puede facilmente:\n* Descargar documentos de todos sus proveedores\n* Establecer la frecuencia con la que Cozy recopilará sus facturas\n* Acceder directoamente a los documentos recopilados por su Cozy',
            name: 'Inicio',
            short_description:
              'Cozy Collect es la aplicación que le ayuda a recopilar todos sus datos personales que están en Cozy.',
          },
          fr: {
            changes:
              'Cela ne vous aura pas échappé, le Store est arrivé dans Cozy !\nNous en avons profité pour améliorer Collect :\n\n * Adaptation au Store.\n * Fusion des tuiles : lorsque vous avez plusieurs comptes pour un même fournisseur ces derniers sont désormais réunis sous la tuile de ce fournisseur.\n * Amélioration des pages des connecteurs.',
            long_description:
              'Avec Cozy Collect, vous pouvez facilement :\n\n * Télécharger les documents de tous vos fournisseurs\n * Configurer la fréquence à laquelle Cozy va récupérer vos factures\n * Accéder directement aux documents récupérés par votre Cozy',
            name: 'Accueil',
            short_description:
              "Cozy Collect est l'application de récupération de vos données personnelles disponible sur Cozy.",
          },
          it: {
            changes:
              "You haven't missed it, the Store arrived in your Cozy!\nWe took advantage of it to improve Collect:\n * Store adaptation.\n * Tile merge: when you have several accounts for a single supplier, the former are now merged under the supplier tile.\n * Improvement of some Connectors pages.",
            long_description:
              'With Cozy Collect, you can easily:\n * Downloads documents from all your suppliers\n * Set how often Cozy will collect your bills\n * Access directly to the documents gathered by your Cozy',
            name: 'Home',
            short_description:
              'Cozy Collect is the application that help you gather all your personal data inside Cozy.',
          },
          ja: {
            changes:
              'なくなっていません。Cozy にストアが登場しました!\n以下のようなコレクトの改善を行いました:\n* ストアの対応。\n* タイルマージ: サプライヤーのアカウントが複数ある場合、サプライヤータイルの下にマージされます。\n* いくつかのコネクターページの改善。',
            long_description:
              'Cozy コレクトを使用すると、次のことが簡単にできます:\n* すべてのサプライヤーからドキュメントをダウンロード\n* Cozy が請求書を収集する頻度の設定\n* Cozy で集められたドキュメントに直接アクセス',
            name: 'ホーム',
            short_description:
              'Cozy コレクトは、すべてのパーソナルデータを Cozy に収集するのに役立つアプリケーションです。',
          },
          nl_NL: {
            changes:
              "Je kunt het niet gemist hebben: de Winkel is gearriveerd op jouw Cozy!\nWe hebben daar gebruik van gemaakt om Verzamelingen te verbeteren door:\n * winkelintegratie.\n * tegelsamenvoeging: als je meerdere accounts bij dezelfde leverancier hebt, dan zijn ze nu samengevoegd onder één tegel.\n * sommige connector-pagina's te verbeteren.",
            long_description:
              'Met Cozy Verzamelingen kun je eenvoudig:\n * documenten downloaden van al je leveranciers\n * instellen hoe vaak Cozy je rekeningen moet verzamelen\n * toegang krijgen tot documenten die jouw Cozy verzameld heeft',
            name: 'Startpagina',
            short_description:
              'Cozy Verzamelingen is dé app die je helpt al je persoonlijke gegevens binnen Cozy te verzamelen.',
          },
        },
        name: 'Home',
        name_prefix: 'Cozy',
        permissions: {
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET', 'POST', 'PUT'],
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar display Claudy and to know which applications are coming soon',
            verbs: ['GET'],
          },
          konnectors: {
            type: 'io.cozy.konnectors',
            description: 'Required to get the list of konnectors',
            verbs: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          accounts: {
            type: 'io.cozy.accounts',
            description: 'Required to manage accounts associated to konnectors',
            verbs: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          files: {
            type: 'io.cozy.files',
            description: 'Required to access folders',
            verbs: ['GET', 'POST', 'PATCH'],
          },
          jobs: {
            type: 'io.cozy.jobs',
            description: 'Required to run the konnectors',
          },
          contacts: {
            type: 'io.cozy.contacts',
            description:
              'Required for the service to update the myself contact, and to add contacts to contracts/accounts',
          },
          triggers: {
            type: 'io.cozy.triggers',
            description: 'Required to run the konnectors',
          },
          permissions: {
            type: 'io.cozy.permissions',
            description: 'Required to run the konnectors',
          },
          appSuggestions: {
            type: 'io.cozy.apps.suggestions',
            description: 'Required to display konnector suggestions',
            verbs: ['GET', 'PUT'],
          },
          organizations: {
            type: 'com.bitwarden.organizations',
            description: 'Required to update konnector passwords',
          },
          ciphers: {
            type: 'com.bitwarden.ciphers',
            description: 'Required to know if the vault is used or not',
            verbs: ['GET'],
          },
          'bank-accounts': {
            type: 'io.cozy.bank.accounts',
            description: 'Required to edit bank accounts',
          },
          'geojson-timeseries': {
            type: 'io.cozy.timeseries.geojson',
            description: 'Required to display geojson timeseries',
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/intents': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
          '/intro': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
        },
        services: {
          deleteAccounts: {
            file: 'services/deleteAccounts/home.js',
            trigger: '@event com.bitwarden.ciphers:DELETED',
            type: 'node',
          },
          myselfFromIdentities: {
            file: 'services/myselfFromIdenties/home.js',
            trigger: '@event io.cozy.identities:CREATED,UPDATED',
            type: 'node',
          },
          softDeleteOrRestoreAccount: {
            file: 'services/softDeleteOrRestoreAccounts/home.js',
            trigger: '@event com.bitwarden.ciphers:UPDATED:!=:deletedDate',
            type: 'node',
          },
          updateAccounts: {
            file: 'services/updateAccounts/home.js',
            trigger: '@event com.bitwarden.ciphers:UPDATED',
            type: 'node',
          },
        },
        slug: 'home',
        source: 'file://localhost/home/anc/cozy/cozy-home/build',
        state: 'ready',
        type: 'webapp',
        updated_at: '0001-01-01T00:00:00Z',
        version: '1.46.0',
      },
      meta: {},
      links: {
        self: '/apps/home',
        related: 'http://home.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/home/icon/1.46.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/drive',
      attributes: {
        categories: ['cozy'],
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'public/app-icon.svg',
        intents: [
          {
            action: 'OPEN',
            href: '/intents',
            type: ['io.cozy.files'],
          },
          {
            action: 'GET_URL',
            href: '/intents',
            type: ['io.cozy.files'],
          },
          {
            action: 'OPEN',
            href: '/intents',
            type: ['io.cozy.suggestions'],
          },
        ],
        langs: ['en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          en: {
            long_description:
              'With Cozy Drive, you can easily:\n- Store your important files and keep them secure in your Cozy\n- Access to all your documents online & offline, from your desktop, and on your smartphone or tablet\n- Share links to files ans folders with who you like;\n- Automatically retrieve bills, payrolls, tax notices and other data from your main online services (internet, energy, retail, mobile, energy, travel...)\n- Upload files to your Cozy from your Android',
            screenshots: [
              'screenshots/en/screenshot01.png',
              'screenshots/en/screenshot02.png',
              'screenshots/en/screenshot03.png',
              'screenshots/en/screenshot04.png',
            ],
            short_description:
              'Cozy Drive helps you to save, sync and secure your files on your Cozy.',
          },
          fr: {
            long_description:
              'Avec Cozy Drive vous pourrez :\n- Sauvegarder et synchroniser gratuitement tous vos documents importants (carte d’identité, photos de vacances, avis d’imposition, fiches de salaires…);\n- Accéder à vos documents n’importe quand, n’importe ou même en mode avion depuis votre bureau, votre smartphone ou tablette;\n- Partager vos fichiers et dossiers par lien avec qui vous le souhaitez;\n- Récupérer automatiquement vos documents administratifs de vos principaux fournisseurs de service (opérateur mobile, fournisseur d’énergie, assureur, internet, santé…);\n- Rester synchronisé·e lors de vos voyages et déplacements professionnels avec nos applications mobiles.',
            screenshots: [
              'screenshots/fr/screenshot01.png',
              'screenshots/fr/screenshot02.png',
              'screenshots/fr/screenshot03.png',
              'screenshots/fr/screenshot04.png',
            ],
            short_description:
              'Cozy Drive est l’application de sauvegarde, de synchronisation et de sécurisation de tous vos fichiers sur Cozy.',
          },
        },
        name: 'Drive',
        name_prefix: 'Cozy',
        permissions: {
          files: {
            type: 'io.cozy.files',
            description: 'Required to access the files',
          },
          allFiles: {
            type: 'io.cozy.files.*',
            description: 'Required to access the files',
          },
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET'],
          },
          sharings: {
            type: 'io.cozy.sharings',
            description: 'Required to have access to the sharings in realtime',
            verbs: ['GET'],
          },
          albums: {
            type: 'io.cozy.photos.albums',
            description: 'Required to manage photos albums',
            verbs: ['PUT'],
          },
          contacts: {
            type: 'io.cozy.contacts',
            verbs: ['GET', 'POST'],
          },
          groups: {
            type: 'io.cozy.contacts.groups',
            verbs: ['GET'],
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          oauth: {
            type: 'io.cozy.oauth.clients',
            description: 'Required to display the cozy-desktop banner',
            verbs: ['GET'],
          },
          reporting: {
            type: 'cc.cozycloud.sentry',
            description:
              'Allow to report unexpected errors to the support team',
            verbs: ['POST'],
          },
          mail: {
            type: 'io.cozy.jobs',
            description: 'Send feedback emails to the support team',
            verbs: ['POST'],
            selector: 'worker',
            values: ['sendmail'],
          },
          konnectors: {
            type: 'io.cozy.konnectors',
            description:
              'Required to display additional information in the viewer for files automatically retrieved by services',
            verbs: ['GET'],
          },
          accounts: {
            type: 'io.cozy.accounts',
            description:
              'Required to display additional information in the viewer for files automatically retrieved by services',
            verbs: ['GET'],
          },
          triggers: {
            type: 'io.cozy.triggers',
            description:
              'Required to display additional information in the viewer for files automatically retrieved by services',
            verbs: ['GET'],
          },
          dacc: {
            type: 'cc.cozycloud.dacc',
            description:
              "Remote-doctype required to send anonymized measures to the DACC shared among mycozy.cloud's Cozy.",
            verbs: ['POST'],
          },
          'dacc-eu': {
            type: 'eu.mycozy.dacc',
            description:
              "Remote-doctype required to send anonymized measures to the DACC shared among mycozy.eu's Cozy.",
            verbs: ['POST'],
          },
        },
        platforms: [
          {
            type: 'ios',
            url: 'https://itunes.apple.com/us/app/cozy-drive/id1224102389?mt=8',
          },
          {
            type: 'android',
            url: 'https://play.google.com/store/apps/details?id=io.cozy.drive.mobile',
          },
        ],
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/intents': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
          '/preview': {
            folder: '/public',
            index: 'index.html',
            public: true,
          },
          '/public': {
            folder: '/public',
            index: 'index.html',
            public: true,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot01.png',
          'screenshots/fr/screenshot02.png',
          'screenshots/fr/screenshot03.png',
          'screenshots/fr/screenshot04.png',
        ],
        services: {
          dacc: {
            file: 'services/dacc/drive.js',
            trigger: '@every 720h',
            type: 'node',
          },
          qualificationMigration: {
            debounce: '24h',
            file: 'services/qualificationMigration/drive.js',
            trigger: '@event io.cozy.files:CREATED,UPDATED',
            type: 'node',
          },
        },
        slug: 'drive',
        source: 'file://localhost/home/anc/cozy/cozy-drive/build/drive',
        state: 'ready',
        type: 'webapp',
        updated_at: '0001-01-01T00:00:00Z',
        version: '1.41.0',
      },
      meta: {},
      links: {
        self: '/apps/drive',
        related: 'http://drive.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/drive/icon/1.41.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/settings',
      attributes: {
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        developer: {
          name: 'Cozy',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'app-icon.svg',
        intents: [
          {
            action: 'CLAUDY',
            href: '/services/claudy',
            type: ['io.cozy.settings'],
          },
          {
            action: 'SUPPORT',
            href: '/services/support',
            type: ['io.cozy.settings'],
          },
          {
            action: 'REDIRECT',
            href: '/#/redirect',
            type: ['io.cozy.settings'],
          },
        ],
        langs: ['de', 'de_DE', 'en', 'es', 'fr', 'ja', 'nl_NL'],
        licence: 'AGPL-3.0',
        locales: {
          de: {
            name: 'Einstellungen',
          },
          de_DE: {
            name: 'Einstellungen',
          },
          en: {
            name: 'Settings',
          },
          es: {
            name: 'Ajustes',
          },
          fr: {
            name: 'Paramètres',
          },
          ja: {
            name: '設定',
          },
          nl_NL: {
            name: 'Instellingen',
          },
        },
        name: 'Settings',
        name_prefix: 'Cozy',
        permissions: {
          settings: {
            type: 'io.cozy.settings',
            description: 'Required to manage your settings',
            verbs: ['GET', 'POST', 'PUT'],
          },
          exports: {
            type: 'io.cozy.exports',
            description: 'Required to export the Cozy data',
            verbs: ['GET', 'POST'],
          },
          imports: {
            type: 'io.cozy.imports',
            description: 'Required to import the Cozy data',
            verbs: ['GET', 'POST'],
          },
          sessions: {
            type: 'io.cozy.sessions.logins',
            description: 'Required to manage your sessions',
            verbs: ['GET'],
          },
          current_sessions: {
            type: 'io.cozy.sessions',
            description: 'Required to manage your sessions',
            verbs: ['GET'],
          },
          oauth: {
            type: 'io.cozy.oauth.clients',
            description: 'Required to manage devices connected to your Cozy',
            verbs: ['GET', 'DELETE'],
          },
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET', 'POST', 'PUT'],
          },
          accounts: {
            type: 'io.cozy.accounts',
            description: 'Required to manage accounts associated to konnectors',
            verbs: ['GET'],
          },
          jobs: {
            type: 'io.cozy.jobs',
            description: 'Required to send emails to support',
          },
          files: {
            type: 'io.cozy.files',
            description: 'Required to select folders to synchronize on devices',
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/services/claudy': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
          '/services/support': {
            folder: '/intents',
            index: 'index.html',
            public: false,
          },
        },
        slug: 'settings',
        source: 'file://localhost/home/anc/cozy/cozy-settings/build',
        state: 'ready',
        type: 'webapp',
        updated_at: '0001-01-01T00:00:00Z',
        version: '1.17.0',
      },
      meta: {},
      links: {
        self: '/apps/settings',
        related: 'http://settings.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/settings/icon/1.17.0',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/passwords',
      attributes: {
        categories: ['cozy'],
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        default_locale: 'en',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon.svg',
        langs: ['en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          en: {
            changes: '',
            long_description:
              'Save your passwords and log in to sites with a single click. Cozy Pass remembers and synchronises all your passwords for you. By installing the password manager, your digital life will be more secure and simple.\n\n- Get your passwords from anywhere\n\nYour passwords will be saved once and for all in your 100% personal and secured safe that you can access from your mobile thanks to the Cozy Pass app.\nThe Cozy pass app also allows you to store payments details and identity details that will help you fill in forms.\nThe access is secured thanks to your Cozy password, but you can also lock your mobile app with fingerprint or a PIN code.\nBy default any item in your password manager is only readable by you, secured by your password. Even Cozy Cloud is unable to access your vault.\n\n- Log in automatically on your apps and websites\n\nYour cozy will allow you to instantly fill in the forms of websites, for easy connection to all your services.\nIt will offer you to save credentials that you manually fill in on your websites so that Cozy Pass can fill in them for you for the next connections.\nIt will also offer to generate strong and secured passwords when you need to create accounts.\n\n- Your passwords synchronized accross all your devices\n\nCozy Pass ensures that your credentials are always up to date accross your different devices. Data is synchronized between the mobile app and the add-on on your computer browsers.\n\n- Retrieve your data more easily in your Cozy\n\nYou can connect your brands to your Cozy to recover your data in the blink of an eye. Cozy Pass will highlight brands that can be synchronized to your Cozy and make it easier to connect them. Whenever your credentials are edited, Cozy Pass will be able to be updated and secure the synchronization automatically.\n\n\n- Cozy Pass is secured thanks to Bitwarden technology\n\nAs an open source company, we have worked on password management technologies by screening the best open source global experts on this field. Our open-source philosphy enables independant experts accross the globe to audit our work and make sure our code is secure, stable and flawless. We use the Bitwarden thechnology with GPL 3.0 licence as mentionned here . https://github.com/bitwarden/mobile/blob/master/LICENSE.txt.',
            screenshots: [
              'screenshots/en/screenshot01.png',
              'screenshots/en/screenshot02.png',
              'screenshots/en/screenshot03.png',
            ],
            short_description: "Escape the password's hell.",
          },
          fr: {
            changes: '',
            long_description:
              'Avec Cozy Pass, vos mots de passe, moyens de paiement et coordonnées sont regroupés et chiffrés au sein de votre cloud personnel dont vous êtes l\'unique propriétaire.\n\nCozy Pass vous simplifie et sécurise vos mots de passe : finis les post-it et autres "maman1234" !\n\nEnfin sécurité va rimer avec simplicité.\n\n- Il enregistre et renseigne automatiquement tous vos mots de passe lorsque vous naviguez sur Internet\n- Vos mots de passe sont désormais sûrs car tous différents, C0mpl3x3s et stockés chiffrés\n- Il synchronise vos mots de passe entre vos ordinateurs, navigateurs et téléphone : vos mots de passe accessibles à tout moment, n\'importe où et à jour\n- Il remplit en un clic les formulaires (nom, prénom, date de naissance, numéro de carte bancaire, adresse de livraison...)\n- Il importe vos mots de passe déjà enregistrés dans un autre gestionnaire ou navigateur\n- Il crée des mots de passe sécurisés avec le générateur de mots de passe\n- Il utilise la technologie Bitwarden sous licence GPL 3.0 comme mentionné ici https://github.com/bitwarden/mobile/blob/master/LICENSE.txt',
            screenshots: [
              'screenshots/fr/screenshot01.png',
              'screenshots/fr/screenshot02.png',
              'screenshots/fr/screenshot03.png',
            ],
            short_description: "Libérez-vous de l'enfer des mots de passe.",
          },
        },
        mobile: {
          id_appstore: 'cozy-pass/id1502262449',
          id_playstore: 'io.cozy.pass',
          schema: 'cozypass://',
        },
        name: 'Pass',
        name_prefix: 'Cozy',
        permissions: {
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET'],
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET', 'PUT'],
          },
          organizations: {
            type: 'com.bitwarden.organizations',
            description: 'Required to share passwords with other people',
          },
          contacts_bitwarden: {
            type: 'com.bitwarden.contacts',
            description: 'Required to share passwords with other people',
          },
          ciphers: {
            type: 'com.bitwarden.ciphers',
            description: 'Required to share passwords with other people',
          },
          contacts: {
            type: 'io.cozy.contacts',
            description: 'Required to share passwords with other people',
            verbs: ['GET', 'POST'],
          },
          groups: {
            type: 'io.cozy.contacts.groups',
            description: 'Required to share passwords with other people',
            verbs: ['GET'],
          },
          sharings: {
            type: 'io.cozy.sharings',
            description: 'Required to have access to the sharings in realtime',
            verbs: ['GET', 'POST'],
          },
        },
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/public': {
            folder: '/',
            index: 'index.html',
            public: true,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot01.png',
          'screenshots/fr/screenshot02.png',
          'screenshots/fr/screenshot03.png',
        ],
        slug: 'passwords',
        source: 'file://localhost/home/anc/cozy/cozy-pass-web/build-browser',
        state: 'ready',
        updated_at: '0001-01-01T00:00:00Z',
        version: '2.0.5',
      },
      meta: {},
      links: {
        self: '/apps/passwords',
        related: 'http://passwords.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/passwords/icon/2.0.5',
      },
    },
    {
      type: 'io.cozy.apps',
      id: 'io.cozy.apps/banks',
      attributes: {
        category: 'cozy',
        checksum: '',
        created_at: '0001-01-01T00:00:00Z',
        default_locale: 'en',
        description: 'The banking application for Cozy',
        developer: {
          name: 'Cozy Cloud',
          url: 'https://cozy.io',
        },
        editor: 'Cozy',
        icon: 'icon-banks.svg',
        langs: ['en', 'fr'],
        licence: 'AGPL-3.0',
        locales: {
          en: {
            changes: '',
            long_description:
              'Cozy Banks is the all-in-one personal data banking application to manage and control your money\nAll Cozy Banks is free\n- Automatic categorisation of your transactions\n- Simple graph to balances follow-up (New)\n- Smart notifications (New)\n- Multi-bank synchronisation\n- Personal Financial Management\n- Unlimited historic\n- Privacy by design application: 100% control of your personal finances\n\nMAIN FEATURES FOR MORE CONTROL AND SERVICES\n- Detailed overview of your finances\nYour transactions are automatically categorised and even more as you can re-categorise if need be. In-depth understand of your finances with smart graphs\n- All your bank accounts in one place - even different banks\nUnlimited history for all your transactions.\nReal difference with your actuel bank application.\n\nCheck out the list of 25+ banks and account types available in your Cozy:\nAxa Banque, Banque Populaire, BforBank, BNP Paribas, Boursorama, Bred, Carrefour Banque, Caisse d’Epargne, Casden, CIC, Crédit Agricole, Crédit Coopératif, Crédit Maritime, Crédit Mutuel, Crédit du Nord & banques du groupe, Crédit Mutuel, Fortuneo, HelloBank!, HSBC, ING Direct, LCL, Monabanq, La Banque Postale, Société Générale, Société Marseillaise de Crédit\n- One-click follow up of your health expenses\nCheck out directly in one place all your health expenses and be notified in real-time once reimbursed\n- Smart notifications\nCozy Banks warns you when something important occurs on your bank accounts\n- Magic link between your bills and expenses\nCozy Banks imports and associates automatically your bills to your expenses.\nAWARDS\n- Award-Winning Innovation Grand Prix - Ville de Paris 2018\n- Best Secure Data Service - Disruptive Night - 2018\n- Finance Innovation Label - 2018\nSAFE AND SECURE\n- Encrypted storage, connections and credentials\n- Two-factor authentication\n- Hosting in France \n- User is king\n- Using technology of our provider Budget Insight\n- Open source\n- Decentralized model in opposition to the current GAFA model\n- Cozy Cloud is a French company\nMore information available on https://help.cozy.io/article/268-all-my-data-in-a-secure-place',
            short_description:
              'Cozy Banks is the personal financial management application available on Cozy.',
          },
          fr: {
            changes: '',
            long_description:
              "Avec Cozy Banks, vous pouvez facilement :\n- Regrouper tous vos comptes même issus de banques différentes\n- Catégoriser automatiquement vos dépenses : revenus, loisirs, santé, logement... avec la possibilité de re-catégoriser si nécessaire\n- Suivre l’évolution des soldes de vos différents comptes bancaires (Nouveauté)\n- Paramétrer vos alertes en temps réel en cas de risque de solde négatif ou entrée d’argent importante\n- Accéder à une vision d’ensemble de toutes vos dépenses\n- Accéder directement aux factures des services que vous avez payés grâce à l’importation automatique des données par les connecteurs\n- Suivre vos dépenses et remboursements de santé entre vos différents services et pour tous les membres de la famille\n\nNOS RÉCOMPENSES & PRIX\n- Lauréat Grand Prix de l’Innovation - Catégorie Moonshot 2040 - Ville de Paris - 2018\n- Lauréat d’Or “Sécurité des données” - Disruptive Night - 2018\n- Label Finance Innovation - 2018\n\nNOS ENGAGEMENTS & GARANTIES DE SÉCURITÉ\n- Chiffrement des données stockées, connexions et identifiants\n- Isolation des rôles côté serveur\n- Authentification en deux étapes\n- Hébergement en France\n- Utilisateur comme client-roi\n- Solution open-source\n- Modèle décentralisé en rupture avec le modèle économique actuel des GAFA\n- Cozy Banks est développé par Cozy Cloud, entreprise française dont les serveurs sont situés en France\n- Pour plus d'informations sur la sécurité : https://support.cozy.io/category/5-securite\n\nL'application Cozy Banks est connectée à plus de 100 institutions financières : Caisse d’Epargne, Crédit Agricole, Société Générale, Boursorama, Crédit Mutuel, La Banque Postale, LCL, Banque Populaire, HSBC, Axa Banque, Bred, CIC, BforBank, Hello Bank, Fortuneo Banque, ING Direct, Monabanq, Barclays, BNP Paribas...",
            short_description:
              'Cozy Banks est l’application gratuite et sécurisée pour gérer votre argent et tous vos comptes bancaires.',
          },
        },
        name: 'Banks',
        name_prefix: 'Cozy',
        notifications: {
          'balance-lower': {
            collapsible: true,
            default_priority: 'normal',
            description:
              'Alert the user when his account balance is lower than a certain value',
            multiple: false,
            stateful: false,
            templates: {},
          },
          'budget-alerts': {
            collapsible: false,
            default_priority: 'normal',
            description:
              'Alert the user when sum of expenses goes higher than defined in settings',
            multiple: false,
            stateful: false,
            templates: {},
          },
          'delayed-debit': {
            collapsible: false,
            default_priority: 'normal',
            description:
              'Alert the user when an account balance is going to be negative after delayed debit',
            multiple: false,
            stateful: false,
            templates: {},
          },
          'health-bill-linked': {
            collapsible: false,
            default_priority: 'normal',
            description:
              'Alert the user when a health bill has been linked to a health expense',
            multiple: false,
            stateful: false,
            templates: {},
          },
          'konnector-alerts': {
            collapsible: false,
            default_priority: 'normal',
            description: 'Alert the user when a banking konnector fails',
            multiple: false,
            stateful: false,
            templates: {},
          },
          'late-health-reimbursement': {
            collapsible: false,
            default_priority: 'normal',
            description: 'Alert the user when a health reimbursement is late',
            multiple: false,
            stateful: false,
            templates: {},
          },
          'transaction-greater': {
            collapsible: false,
            default_priority: 'normal',
            description:
              'Alert the user when a transaction amount is greater than a certain value',
            multiple: false,
            stateful: false,
            templates: {},
          },
        },
        permissions: {
          'bank.groups': {
            type: 'io.cozy.bank.groups',
            description: 'Manage groups of bank accounts',
            verbs: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          'bank.accounts': {
            type: 'io.cozy.bank.accounts',
            description: 'Used to list your bank accounts',
            verbs: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          'bank.accounts.stats': {
            type: 'io.cozy.bank.accounts.stats',
            description: 'Used to aggregate stats about bank accounts',
            verbs: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          'bank.operations': {
            type: 'io.cozy.bank.operations',
            description: 'Used to manage your bank operations',
            verbs: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          'bank.settings': {
            type: 'io.cozy.bank.settings',
            description: 'Used to manage your bank settings',
            verbs: ['GET', 'POST', 'PUT'],
          },
          'bank.recipients': {
            type: 'io.cozy.bank.recipients',
            description: 'Show recipients of transfers',
          },
          'bank.recurrence': {
            type: 'io.cozy.bank.recurrence',
            description: 'Manage your recurring bundles your Cozy',
            verbs: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          bills: {
            type: 'io.cozy.bills',
            description: 'Manage bills',
            verbs: ['GET', 'POST', 'PUT', 'DELETE'],
          },
          notifications: {
            type: 'io.cozy.notifications',
            description: 'Used to send notifications',
            verbs: ['POST'],
          },
          apps: {
            type: 'io.cozy.apps',
            description:
              'Required by the cozy-bar to display the icons of the apps',
            verbs: ['GET'],
          },
          triggers: {
            type: 'io.cozy.triggers',
            description: 'Used to configure bank accounts',
          },
          settings: {
            type: 'io.cozy.settings',
            description:
              'Required by the cozy-bar to display Claudy and know which applications are coming soon',
            verbs: ['GET'],
          },
          reporting: {
            type: 'cc.cozycloud.sentry',
            description:
              'Allow to report unexpected errors to the support team',
            verbs: ['POST'],
          },
          autocategorization: {
            type: 'cc.cozycloud.autocategorization',
            description: 'Allow to anonymously send categorized transactions',
            verbs: ['POST'],
          },
          konnectors: {
            type: 'io.cozy.konnectors',
            description:
              'Required to know if a konnector is waiting for a manual update',
            verbs: ['GET'],
          },
          'apps.suggestions': {
            type: 'io.cozy.apps.suggestions',
            description:
              'Used to suggest which apps / connectors might be useful for the user',
            verbs: ['GET', 'POST', 'PUT'],
          },
          jobs: {
            type: 'io.cozy.jobs',
            description: 'Used in services to start other services',
          },
          accounts: {
            type: 'io.cozy.accounts',
            description:
              'Used to create a temporary account for transfers and to configure accounts',
          },
          contacts: {
            type: 'io.cozy.contacts',
            description: 'Used to link accounts to contacts',
            verbs: ['GET', 'POST', 'PUT'],
          },
          identities: {
            type: 'io.cozy.identities',
            description:
              'Used to update the document storing information entered before a transfer',
            verbs: ['GET', 'POST', 'PUT'],
          },
        },
        platforms: [
          {
            type: 'ios',
            url: 'https://itunes.apple.com/us/app/cozy-banks/id1349814380',
          },
          {
            type: 'android',
            url: 'https://play.google.com/store/apps/details?id=io.cozy.banks.mobile',
          },
        ],
        registry_namespace: 'banks',
        routes: {
          '/': {
            folder: '/',
            index: 'index.html',
            public: false,
          },
          '/public': {
            folder: '/public',
            public: true,
          },
        },
        screenshots: [
          'screenshots/fr/screenshot1.png',
          'screenshots/fr/screenshot2.png',
          'screenshots/fr/screenshot3.png',
          'screenshots/fr/screenshot4.png',
          'screenshots/fr/screenshot5.png',
        ],
        services: {
          autogroups: {
            debounce: '5s',
            file: 'autogroups.js',
            trigger: '@event io.cozy.bank.accounts:CREATED',
            type: 'node',
          },
          budgetAlerts: {
            comment:
              'Service is run inside onOperationOrBillCreate. The service described here is for diagnosis/debug.',
            file: 'budgetAlerts.js',
            type: 'node',
          },
          categorization: {
            comment:
              'This service must be called programmatically from konnectors. See https://github.com/cozy/cozy-banks/blob/master/docs/services.md for more information.',
            file: 'categorization.js',
            type: 'node',
          },
          konnectorAlerts: {
            debounce: '60s',
            file: 'konnectorAlerts.js',
            trigger: '@event io.cozy.jobs:UPDATED:konnector:worker',
            type: 'node',
          },
          linkMyselfToAccounts: {
            debounce: '5s',
            file: 'linkMyselfToAccounts.js',
            trigger: '@event io.cozy.bank.accounts:CREATED',
            type: 'node',
          },
          onOperationOrBillCreate: {
            debounce: '75s',
            file: 'onOperationOrBillCreate.js',
            trigger: '@event io.cozy.bills:CREATED',
            type: 'node',
          },
          recurrence: {
            debounce: '1m',
            file: 'recurrence.js',
            trigger: '@event io.cozy.bank.operations:CREATED,UPDATED',
            type: 'node',
          },
          stats: {
            debounce: '1m',
            file: 'stats.js',
            trigger: '@event io.cozy.bank.operations:CREATED,UPDATED',
            type: 'node',
          },
        },
        slug: 'banks',
        source: 'file://localhost/home/anc/cozy/cozy-banks/build',
        state: 'ready',
        tags: ['bank', 'banks', 'money', 'account'],
        type: 'webapp',
        updated_at: '0001-01-01T00:00:00Z',
        version: '1.43.0',
      },
      meta: {},
      links: {
        self: '/apps/banks',
        related: 'http://banks.dev.10-0-2-2.nip.io:8080/',
        icon: '/apps/banks/icon/1.43.0',
      },
    },
  ],
  links: {},
  meta: {
    count: 19,
  },
}

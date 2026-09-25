import type { Dictionary } from './uz';

/** Ўзбекча (кирилл) — лотин луғатининг транслитерацияси. */
export const uzCyrl: Dictionary = {
    /* ── Умумий ──────────────────────────────────────────────────────── */
    'common.save': 'Сақлаш',
    'common.saving': 'Сақланмоқда…',
    'common.cancel': 'Бекор қилиш',
    'common.delete': 'Ўчириш',
    'common.deleting': 'Бажарилмоқда…',
    'common.edit': 'Таҳрирлаш',
    'common.add': 'Қўшиш',
    'common.close': 'Ёпиш',
    'common.actions': 'Амаллар',
    'common.status': 'Ҳолати',
    'common.search': 'Қидириш…',
    'common.allStatuses': 'Барча ҳолатлар',
    'common.active': 'Фаол',
    'common.inactive': 'Нофаол',
    'common.phone': 'Телефон',
    'common.phoneNumber': 'Телефон рақами',
    'common.fullName': 'Ф.И.Ш.',
    'common.firstName': 'Исм',
    'common.lastName': 'Фамилия',
    'common.password': 'Парол',
    'common.name': 'Номи',
    'common.description': 'Тавсиф',
    'common.createdAt': 'Қўшилган сана',
    'common.details': 'Батафсил',
    'common.avatar': 'Расм',

    /* ── Хатолар ─────────────────────────────────────────────────────── */
    'error.unknown': 'Кутилмаган хатолик юз берди',
    'error.network':
        'Серверга уланиб бўлмади. Интернет ёки API манзилини текширинг.',
    'error.requestFailed': 'Сўров бажарилмади ({status})',
    'error.actionFailed': 'Амал бажарилмади',
    'error.noAccess': 'Рухсат йўқ',
    'error.noAccessHint':
        'Бу бўлим учун сизда рухсат йўқ. Керак бўлса, марказ раҳбарига мурожаат қилинг.',

    /* ── Кириш ───────────────────────────────────────────────────────── */
    'auth.title': 'Тизимга кириш',
    'auth.subtitle': 'Тизимга кириш учун телефон рақами ва паролни киритинг',
    'auth.signIn': 'Кириш',
    'auth.signingIn': 'Кирилмоқда…',
    'auth.signOut': 'Чиқиш',
    'auth.failed': 'Киришда хатолик юз берди',
    'auth.showPassword': 'Паролни кўрсатиш',
    'auth.hidePassword': 'Паролни яшириш',
    'auth.contact': 'Ҳисоб очиш ёки саволлар учун:',

    /* ── Меню ────────────────────────────────────────────────────────── */
    'nav.management': 'БОШҚАРУВ',
    'nav.superAdmin': 'СУПЕР АДМИН',
    'nav.users': 'Фойдаланувчилар',
    'nav.roles': 'Роллар',
    'nav.educations': 'Ўқув марказлар',
    'nav.profile': 'Профил',
    'nav.home': 'EDU MS бош саҳифа',
    'nav.openMenu': 'Менюни очиш',
    'nav.closeMenu': 'Менюни ёпиш',
    'nav.collapse': 'Менюни йиғиш',
    'nav.expand': 'Менюни ёйиш',
    'nav.sidebar': 'Ён меню',
    'nav.userMenu': 'Фойдаланувчи менюси',

    /* ── Мавзу ва тил ────────────────────────────────────────────────── */
    'theme.toggle': 'Мавзуни алмаштириш',
    'locale.change': 'Тилни ўзгартириш',

    /* ── Саҳифалаш ───────────────────────────────────────────────────── */
    'pagination.summary': '{count} тадан {from}–{to} кўрсатилмоқда',
    'pagination.perPage': 'Саҳифада',
    'pagination.prev': 'Олдинги',
    'pagination.next': 'Кейинги',

    /* ── Марказ ҳолати ───────────────────────────────────────────────── */
    'educationStatus.active': 'Фаол',
    'educationStatus.suspended': 'Тўхтатилган',
    'educationStatus.inactive': 'Нофаол',

    /* ── Рухсатлар ───────────────────────────────────────────────────── */
    'permissionModule.users': 'Фойдаланувчилар',
    'permissionModule.roles': 'Роллар',
    'permission.users.view': 'Фойдаланувчиларни кўриш',
    'permission.users.create': 'Фойдаланувчи қўшиш',
    'permission.users.update': 'Фойдаланувчини таҳрирлаш ва паролини тиклаш',
    'permission.users.delete': 'Фойдаланувчини ўчириш',
    'permission.roles.view': 'Ролларни кўриш',
    'permission.roles.create': 'Рол яратиш',
    'permission.roles.update': 'Ролни таҳрирлаш',
    'permission.roles.delete': 'Ролни ўчириш',

    /* ── Ўқув марказлар (супер админ) ────────────────────────────────── */
    'educations.title': 'Ўқув марказлар',
    'educations.subtitle': 'Тизимдаги ўқув марказлар ва уларнинг ownerлари',
    'educations.new': 'Янги марказ',
    'educations.edit': 'Марказни таҳрирлаш',
    'educations.search': 'Номи ёки телефон…',
    'educations.empty': 'Марказ топилмади',
    'educations.logo': 'Логотип',
    'educations.deleteTitle': 'Марказни ўчириш',
    'educations.deleteMessage':
        '"{name}" марказы ўчирилади. Унинг фойдаланувчилари тизимга кира олмай қолади.',
    'educations.created': 'Марказ қўшилди',
    'educations.updated': 'Марказ янгиланди',
    'educations.deleted': 'Марказ ўчирилди',
    'educations.backToList': 'Марказлар рўйхатига',
    'educations.owners': 'Ownerлар',
    'educations.ownersHint':
        'Owner — марказнинг барча рухсатларига эга. Қолган роллар ва фойдаланувчиларни у ўзи яратади.',
    'educations.addOwner': 'Owner қўшиш',
    'educations.addOwnerTitle': 'Марказга owner қўшиш',
    'educations.addOwnerHint':
        'Фойдаланувчи марказнинг Owner роли билан яратилади',
    'educations.ownerPhoneHint': 'Бу рақам логин сифатида ишлатилади',
    'educations.ownerCreated': 'Owner қўшилди',
    'educations.noOwners': 'Бу марказда ҳали owner йўқ',

    /* ── Роллар ──────────────────────────────────────────────────────── */
    'roles.title': 'Роллар',
    'roles.subtitle':
        'Рол — рухсатлар тўплами. Фойдаланувчига бир нечта рол бириктириш мумкин.',
    'roles.new': 'Янги рол',
    'roles.edit': 'Ролни таҳрирлаш',
    'roles.search': 'Рол номи…',
    'roles.empty': 'Рол топилмади',
    'roles.namePlaceholder': 'Масалан, Администратор ёки Ўқитувчи',
    'roles.system': 'Тизим роли',
    'roles.ownerDescription': 'Барча рухсатлар. Ўзгартириб бўлмайди.',
    'roles.permissions': 'Рухсатлар',
    'roles.permissionsCount': '{count} / {total}',
    'roles.usersCount': 'Фойдаланувчилар',
    'roles.selectAll': 'Ҳаммаси',
    'roles.ownPermissionsHint':
        'Ролга фақат ўзингизда бор рухсатларни бера оласиз.',
    'roles.readOnlyHint': 'Бу ролни таҳрирлай олмайсиз — фақат кўриш мумкин',
    'roles.deleteTitle': 'Ролни ўчириш',
    'roles.deleteMessage': '"{name}" роли ўчирилади.',
    'roles.deleteInUse':
        '"{name}" роли {count} та фойдаланувчига бириктирилган. Аввал улардан олиб ташланг — акс ҳолда ўчириб бўлмайди.',
    'roles.created': 'Рол яратилди',
    'roles.updated': 'Рол янгиланди',
    'roles.deleted': 'Рол ўчирилди',

    /* ── Фойдаланувчилар ─────────────────────────────────────────────── */
    'users.title': 'Фойдаланувчилар',
    'users.subtitle': 'Марказингиз фойдаланувчилари ва уларнинг роллари',
    'users.new': 'Янги фойдаланувчи',
    'users.edit': 'Фойдаланувчини таҳрирлаш',
    'users.selfEditHint': 'Ўз ролларингиз ва ҳолатингизни ўзгартира олмайсиз',
    'users.search': 'Исм, фамилия ёки телефон…',
    'users.empty': 'Фойдаланувчи топилмади',
    'users.you': '(сиз)',
    'users.roles': 'Роллар',
    'users.allRoles': 'Барча роллар',
    'users.rolesHint':
        'Камида битта рол. Ўзингиздан кенг рухсатли ролларни бириктира олмайсиз.',
    'users.noRoles': 'Аввал «Роллар» бўлимида рол яратинг',
    'users.activeLabel': 'Фаол — тизимга кира олади',
    'users.loginHint': 'Логин сифатида ишлатилади',
    'users.passwordHint': 'Камида 8 та белги',
    'users.newPassword': 'Янги парол',
    'users.resetPassword': 'Паролни тиклаш',
    'users.resetPasswordTitle': 'Паролни тиклаш',
    'users.resetPasswordHint':
        'Эски паролни кўриш мумкин эмас — фақат янгиси ўрнатилади',
    'users.passwordReset': 'Парол янгиланди',
    'users.deleteTitle': 'Фойдаланувчини ўчириш',
    'users.deleteMessage': '{name} ўчирилади ва тизимга кира олмай қолади.',
    'users.created': 'Фойдаланувчи қўшилди',
    'users.updated': 'Фойдаланувчи янгиланди',
    'users.deleted': 'Фойдаланувчи ўчирилди',

    /* ── Файллар ─────────────────────────────────────────────────────── */
    'uploads.selectFiles': 'Файлларни танланг',
    'uploads.uploading': 'Юкланмоқда…',

    /* ── Профил ──────────────────────────────────────────────────────── */
    'profile.title': 'Профил',
    'profile.subtitle': 'Ҳисоб маълумотлари',
    'profile.superAdmin': 'Супер админ',
    'profile.education': 'Ўқув марказ',
    'profile.permissions': 'Рухсатлар',
    'profile.allPermissions': 'Барча рухсатлар (Owner)',
    'profile.noPermissions': 'Рухсат йўқ',
    'profile.editTitle': 'Маълумотларни ўзгартириш',
    'profile.phoneHint':
        'Телефон рақами логин сифатида ишлатилади — уни марказ раҳбари ўзгартиради.',
    'profile.updated': 'Маълумотлар сақланди',
    'profile.passwordTitle': 'Паролни алмаштириш',
    'profile.currentPassword': 'Жорий парол',
    'profile.repeatPassword': 'Янги паролни такрорланг',
    'profile.passwordMismatch': 'Пароллар мос келмади',
    'profile.changePassword': 'Алмаштириш',
    'profile.passwordChanged': 'Парол алмаштирилди',

    /* ── 404 ─────────────────────────────────────────────────────────── */
    'notFound.title': 'Саҳифа топилмади',
    'notFound.message': 'Сиз излаётган саҳифа мавжуд эмас ёки кўчирилган.',
    'notFound.back': 'Бош саҳифага қайтиш',

    /* ── Тариф ва тўлов ──────────────────────────────────────────────── */
    'common.som': 'сўм',
    'common.unlimited': 'Чексиз',
    'auth.noAccount': 'Ҳисобингиз йўқми?',
    'auth.tryFree': '{days} кун бепул синаб кўринг',
    'nav.billing': 'Тариф ва тўлов',
    'nav.tariffs': 'Тарифлар',
    'nav.payments': 'Тўловлар',
    'permissionModule.billing': 'Тариф ва тўлов',
    'permission.billing.manage': 'Тариф танлаш ва тўлов сўровлари',
    'paymentStatus.pending': 'Кутилмоқда',
    'paymentStatus.approved': 'Тасдиқланган',
    'paymentStatus.rejected': 'Рад этилган',
    'paymentStatus.cancelled': 'Бекор қилинган',
    'billing.title': 'Тариф ва тўлов',
    'billing.subtitle': 'Обуна ҳолати, тарифлар ва тўловлар тарихи',
    'billing.subscription': 'Обуна',
    'billing.statusTrial': 'Бепул синов муддати',
    'billing.statusPaid': 'Тариф: {name}',
    'billing.statusExpired': 'Обуна муддати тугаган',
    'billing.activeUntil': '{date} гача амал қилади — {days} кун қолди',
    'billing.expired': 'Муддати тугаган',
    'billing.expiredHint':
        'Тизимдан фойдаланишни давом эттириш учун қуйидаги тарифлардан бирини танланг. Маълумотларингиз сақланиб қолади.',
    'billing.expiredAskOwner':
        'Марказ обунаси тугаган. Давом этиш учун марказ раҳбарига мурожаат қилинг.',
    'billing.noPermission': 'Тариф танлаш учун сизда рухсат йўқ.',
    'billing.bannerTrial': 'Бепул синов муддати: {days} кун қолди',
    'billing.bannerEnding': 'Обуна тугашига {days} кун қолди',
    'billing.bannerExpired': 'Обуна муддати тугаган — тизим блокланган',
    'billing.chooseTariff': 'Тариф танлаш',
    'billing.tariffs': 'Тарифлар',
    'billing.noTariffs': 'Ҳозирча сотувда тариф йўқ',
    'billing.choose': 'Танлаш',
    'billing.requested': 'Сўров юборилган',
    'billing.stackHint':
        'Олдиндан тўласангиз, янги давр жорий муддат тугаган кундан бошланади — қолган кунлар йўқолмайди.',
    'billing.pendingTitle': '«{name}» тарифи учун тўлов кутилмоқда',
    'billing.pendingAmount': 'Тўлов суммаси: {amount}',
    'billing.howToPay': 'Қандай тўлаш керак',
    'billing.pendingHint':
        'Тўлов тушгач, обуна администратор томонидан фаоллаштирилади.',
    'billing.cancelRequest': 'Сўровни бекор қилиш',
    'billing.requestSent': 'Сўров юборилди',
    'billing.requestCancelled': 'Сўров бекор қилинди',
    'billing.requests': 'Тўлов сўровлари',
    'billing.noRequests': 'Ҳали сўров юборилмаган',
    'billing.history': 'Обуналар тарихи',
    'billing.noHistory': 'Обуналар тарихи бўш',
    'billing.tariff': 'Тариф',
    'billing.period': 'Давр',
    'billing.trial': 'Бепул синов',
    'billing.trialDays': 'Синов · {days} кун',
    'billing.paidDays': '{name} · {days} кун',
    'tariffs.title': 'Тарифлар',
    'tariffs.subtitle':
        'Пулли тарифлар — лендинг ва тариф танлаш саҳифасида кўринади',
    'tariffs.new': 'Янги тариф',
    'tariffs.edit': 'Тарифни таҳрирлаш',
    'tariffs.editHint': 'Аллақачон сотиб олинган обуналар ўзгармайди',
    'tariffs.empty': 'Тариф йўқ',
    'tariffs.namePlaceholder': 'Масалан, Стандарт',
    'tariffs.price': 'Нархи',
    'tariffs.duration': 'Муддати',
    'tariffs.dayUnit': 'кун',
    'tariffs.durationValue': '{days} кун',
    'tariffs.perPeriod': '{days} кун учун',
    'tariffs.maxUsers': 'Фойдаланувчилар лимити',
    'tariffs.unlimitedHint': 'Бўш қолдирилса — чексиз',
    'tariffs.usersLimit': '{count} тагача фойдаланувчи',
    'tariffs.usersUnlimited': 'Чексиз фойдаланувчилар',
    'tariffs.sortOrder': 'Тартиб рақами',
    'tariffs.sortOrderHint': 'Кичиги биринчи кўрсатилади',
    'tariffs.activeLabel': 'Сотувда — мижозлар кўради ва танлай олади',
    'tariffs.deleteTitle': 'Тарифни ўчириш',
    'tariffs.deleteMessage':
        '«{name}» тарифи ўчирилади. Сотиб олинган обуналар сақланиб қолади. Вақтинча яшириш учун «Сотувда» белгисини олиб ташлаш кифоя.',
    'tariffs.created': 'Тариф яратилди',
    'tariffs.updated': 'Тариф янгиланди',
    'tariffs.deleted': 'Тариф ўчирилди',
    'payments.title': 'Тўловлар',
    'payments.subtitle':
        'Марказларнинг тўлов сўровлари — пул тушгач тасдиқланг',
    'payments.empty': 'Сўров йўқ',
    'payments.education': 'Ўқув марказ',
    'payments.approve': 'Тасдиқлаш',
    'payments.approveTitle': 'Тўловни тасдиқлаш',
    'payments.approveMessage':
        '{education} маркази учун «{tariff}» тарифи ({amount}) очилади. Пул тушганига ишончингиз комилми?',
    'payments.approved': 'Тўлов тасдиқланди — обуна очилди',
    'payments.reject': 'Рад этиш',
    'payments.rejectTitle': 'Сўровни рад этиш',
    'payments.rejectNote': 'Сабаб',
    'payments.rejectNoteHint': 'Марказга кўрсатилади (ихтиёрий)',
    'payments.rejected': 'Сўров рад этилди',

    /* ── Рўйхатдан ўтиш ──────────────────────────────────────────────── */
    'register.title': '{days} кун бепул синаб кўринг',
    'register.subtitle':
        'Ўқув марказингизни рўйхатдан ўтказинг — карта талаб қилинмайди',
    'register.educationName': 'Ўқув марказ номи',
    'register.educationPlaceholder': 'Масалан, EDU Group',
    'register.phoneHint': 'Шу рақамга SMS код юборилади — у логин бўлади',
    'register.sendCode': 'Код юбориш',
    'register.sending': 'Юборилмоқда…',
    'register.codeSent': '{phone} рақамига 6 хонали код юборилди',
    'register.code': 'SMS код',
    'register.submit': 'Рўйхатдан ўтиш',
    'register.creating': 'Марказ очилмоқда…',
    'register.changeDetails': '← Маълумотларни ўзгартириш',
    'register.resend': 'Кодни қайта юбориш',
    'register.resendIn': 'Қайта юбориш: {seconds} с',
    'register.haveAccount': 'Ҳисобингиз борми?',

    /* ── Лендинг ─────────────────────────────────────────────────────── */
    'landing.backHome': 'Бош саҳифа',
    'landing.navTariffs': 'Тарифлар',
    'landing.openCabinet': 'Кабинетга ўтиш',
    'landing.startFree': 'Бепул бошлаш',
    'landing.seeTariffs': 'Тарифларни кўриш',
    'landing.badge': '{days} кун бепул — карта талаб қилинмайди',
    'landing.heroTitle': 'Ўқув марказингизни битта тизимда бошқаринг',
    'landing.heroText':
        'EduMS — ўқув марказлар учун CRM. Ходимларни қўшинг, ҳар бирига ўз вазифасига мос рухсат беринг ва ҳаммасини бир жойдан назорат қилинг.',
    'landing.noCard':
        'Рўйхатдан ўтиш 1 дақиқа — телефон рақам ва SMS код кифоя',
    'landing.featuresTitle': 'Нималар бор',
    'landing.featureUsersTitle': 'Ходимлар',
    'landing.featureUsersText':
        'Ҳар бир ходимга алоҳида логин. Керак бўлмаса — бир босишда фаолсизлантиринг.',
    'landing.featureRolesTitle': 'Динамик роллар',
    'landing.featureRolesText':
        'Администратор, ўқитувчи, кассир — ролларни ўзингиз яратинг ва рухсатларини белгиланг.',
    'landing.featureSecurityTitle': 'Хавфсизлик',
    'landing.featureSecurityText':
        'Ҳар бир марказ маълумоти алоҳида. Ходим ўзидан катта ҳуқуқни ҳеч кимга бера олмайди.',
    'landing.featureLanguagesTitle': '4 тил',
    'landing.featureLanguagesText':
        'Ўзбек (лотин ва кирилл), рус ва инглиз тилларида. Кундузги ва тунги мавзу.',
    'landing.stepsTitle': 'Қандай бошланади',
    'landing.step1Title': 'Рўйхатдан ўтинг',
    'landing.step1Text':
        'Марказ номи ва телефон рақамингиз — SMS код билан тасдиқлайсиз.',
    'landing.step2Title': '{days} кун бепул ишлатинг',
    'landing.step2Text':
        'Барча имкониятлар очиқ: ходимлар қўшинг, ролларни созланг.',
    'landing.step3Title': 'Тариф танланг',
    'landing.step3Text':
        'Синов тугагач, марказингизга мос тарифни танлаб давом этинг. Маълумотлар сақланади.',
    'landing.tariffsTitle': 'Тарифлар',
    'landing.tariffsText': 'Ҳар бири {days} кунлик бепул синовдан кейин',
    'landing.tariffsSoon':
        'Тарифлар тез орада эълон қилинади. Ҳозир бепул синаб кўришингиз мумкин.',
    'landing.ctaTitle': 'Бугун бошланг',
    'landing.ctaText': '{days} кун давомида ҳеч қандай тўловсиз синаб кўринг.',

    /* ── SMS settings ── */
    'nav.smsSettings': 'SMS созламалари',
    'smsSettings.title': 'SMS созламалари',
    'smsSettings.subtitle':
        'Рўйхатдан ўтиш кодлари юбориладиган Eskiz.uz уланиши',
    'smsSettings.connectionTitle': 'Eskiz уланиши',
    'smsSettings.driver': 'Режим',
    'smsSettings.driverEskiz': 'Eskiz — ҳақиқий SMS',
    'smsSettings.driverConsole': 'Console — фақат сервер логи (тест)',
    'smsSettings.driverEskizHint': 'Кодлар Eskiz.uz орқали телефонга юборилади',
    'smsSettings.driverConsoleHint':
        'SMS юборилмайди, код бэкенд терминалида чиқади. Productionда тақиқланган',
    'smsSettings.email': 'Eskiz email',
    'smsSettings.password': 'Eskiz пароли',
    'smsSettings.passwordHint': 'Eskiz кабинетига кириш пароли',
    'smsSettings.passwordSavedHint':
        'Пароль сақланган. Ўзгартириш учун янгисини киритинг, акс ҳолда бўш қолдиринг',
    'smsSettings.from': 'Жўнатувчи (from)',
    'smsSettings.fromHint': 'Eskiz берган ник ёки рақам, масалан 4546',
    'smsSettings.template': 'SMS шаблони',
    'smsSettings.templateHint':
        '{code} — код ўрни. Матн Eskiz кабинетида тасдиқланган шаблон билан айнан бир хил бўлиши шарт',
    'smsSettings.templateMissingCode': 'Шаблонда {code} бўлиши шарт',
    'smsSettings.saved': 'SMS созламалари сақланди',
    'smsSettings.testTitle': 'Синов SMS',
    'smsSettings.testText':
        'Сақланган созламалар билан шаблон бўйича 123456 кодини юборади. Аввал ўзгаришларни сақланг.',
    'smsSettings.testSend': 'Юбориш',
    'smsSettings.testSending': 'Юборилмоқда…',

    /* ── Parolni tiklash ── */
    'auth.forgotPassword': 'Паролни унутдингизми?',
    'forgot.title': 'Паролни тиклаш',
    'forgot.subtitle': 'Логин телефонингизга SMS код юборамиз',
    'forgot.phoneHint': 'Тизимга кирадиган телефон рақамингиз',
    'forgot.submit': 'Сақлаш ва кириш',
    'forgot.changePhone': '← Рақамни ўзгартириш',
    'forgot.backToLogin': 'Кириш саҳифасига қайтиш',

    /* ── Platforma sozlamalari ── */
    'nav.platformSettings': 'Платформа созламалари',
    'platformSettings.title': 'Платформа созламалари',
    'platformSettings.subtitle': 'Бепул синов муддати ва тўлов кўрсатмаси',
    'platformSettings.trialTitle': 'Бепул синов',
    'platformSettings.trialDays': 'Синов муддати',
    'platformSettings.trialDaysHint':
        'Фақат бундан кейин очиладиган марказларга таъсир қилади — бошланган синовлар ўзгармайди. Лендинг саҳифасида ҳам шу сон кўринади',
    'platformSettings.paymentTitle': 'Тўлов кўрсатмаси',
    'platformSettings.paymentInstructions': 'Кўрсатма матни',
    'platformSettings.paymentInstructionsHint':
        'Марказ тариф танлагач, «Тариф ва тўлов» саҳифасида кўрсатилади: карта рақами, эгаси, изоҳга нима ёзиш кераклиги',
    'platformSettings.paymentInstructionsPlaceholder':
        'Карта: 8600 0000 0000 0000 (Ф.И.Ш.). Тўлов изоҳига марказ номини ёзинг.',
    'platformSettings.saved': 'Созламалар сақланди',
};

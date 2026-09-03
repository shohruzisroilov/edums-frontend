/**
 * Asosiy lug'at — barcha kalitlarning manbasi.
 * Boshqa tillar shu obyektning tipiga bo'ysunadi, shuning uchun kalit
 * unutilsa TypeScript xato beradi.
 */
export const uz = {
    /* ── Umumiy ─────────────────────────────────────────────────────── */
    'common.save': 'Saqlash',
    'common.saving': 'Saqlanmoqda…',
    'common.cancel': 'Bekor qilish',
    'common.delete': "O'chirish",
    'common.deleting': 'Bajarilmoqda…',
    'common.edit': 'Tahrirlash',
    'common.add': "Qo'shish",
    'common.close': 'Yopish',
    'common.actions': 'Amallar',
    'common.status': 'Holati',
    'common.search': 'Qidirish…',
    'common.allStatuses': 'Barcha holatlar',
    'common.active': 'Faol',
    'common.inactive': 'Nofaol',
    'common.unlimited': 'Cheksiz',
    'common.notSelected': 'Tanlanmagan',
    'common.phone': 'Telefon',
    'common.phoneNumber': 'Telefon raqami',
    'common.fullName': 'F.I.Sh.',
    'common.firstName': 'Ism',
    'common.lastName': 'Familiya',
    'common.address': 'Manzil',
    'common.password': 'Parol',
    'common.name': 'Nomi',
    'common.description': 'Tavsif',
    'common.createdAt': "Qo'shilgan sana",
    'common.som': "so'm",

    /* ── Xatolar ────────────────────────────────────────────────────── */
    'error.unknown': 'Kutilmagan xatolik yuz berdi',
    'error.network':
        "Serverga ulanib bo'lmadi. Internet yoki API manzilini tekshiring.",
    'error.requestFailed': "So'rov bajarilmadi ({status})",
    'error.actionFailed': 'Amal bajarilmadi',
    'error.noAccess': "Ruxsat yo'q",
    'error.noAccessHint':
        'Bu bo‘limga sizning rolingiz uchun ruxsat berilmagan.',

    /* ── Kirish ─────────────────────────────────────────────────────── */
    'auth.subtitle': 'Tizimga kirish uchun telefon raqami va parolni kiriting',
    'auth.signIn': 'Kirish',
    'auth.signingIn': 'Kirilmoqda…',
    'auth.signOut': 'Chiqish',
    'auth.failed': 'Kirishda xatolik yuz berdi',
    'auth.showPassword': "Parolni ko'rsatish",
    'auth.hidePassword': 'Parolni yashirish',
    'auth.contact': 'Hisob ochish yoki savollar uchun:',

    /* ── Menyu ──────────────────────────────────────────────────────── */
    'nav.main': 'ASOSIY',
    'nav.superAdmin': 'SUPER ADMIN',
    'nav.dashboard': 'Bosh sahifa',
    'nav.students': "O'quvchilar",
    'nav.centers': "O'quv markazlari",
    'nav.tariffs': 'Tariflar',
    'nav.users': 'Xodimlar',
    'nav.profile': 'Profil',
    'nav.home': 'EDU MS bosh sahifa',
    'nav.openMenu': 'Menyuni ochish',
    'nav.closeMenu': 'Menyuni yopish',
    'nav.collapse': "Menyuni yig'ish",
    'nav.expand': 'Menyuni yoyish',
    'nav.sidebar': 'Yon menyu',
    'nav.userMenu': 'Foydalanuvchi menyusi',

    /* ── Mavzu va til ───────────────────────────────────────────────── */
    'theme.toggle': 'Mavzuni almashtirish',
    'locale.change': "Tilni o'zgartirish",

    /* ── Sahifalash ─────────────────────────────────────────────────── */
    'pagination.summary': '{count} tadan {from}–{to} ko‘rsatilmoqda',
    'pagination.perPage': 'Sahifada',
    'pagination.prev': 'Oldingi',
    'pagination.next': 'Keyingi',

    /* ── Rollar ─────────────────────────────────────────────────────── */
    'role.super_admin': 'Super admin',
    'role.center_admin': 'Markaz admini',
    'role.manager': 'Menejer',
    'role.teacher': "O'qituvchi",

    /* ── Markaz holati ──────────────────────────────────────────────── */
    'centerStatus.active': 'Faol',
    'centerStatus.suspended': "To'xtatilgan",
    'centerStatus.inactive': 'Nofaol',

    /* ── O'quvchi holati ────────────────────────────────────────────── */
    'studentStatus.active': 'Faol',
    'studentStatus.frozen': 'Muzlatilgan',
    'studentStatus.graduated': 'Bitirgan',
    'studentStatus.left': 'Chiqib ketgan',

    /* ── Boshqaruv paneli ───────────────────────────────────────────── */
    'dashboard.title': 'Bosh sahifa',
    'dashboard.generatedAt': "Ma'lumot vaqti: {time}",
    'dashboard.centers': "O'quv markazlari",
    'dashboard.centersHint':
        '{active} faol · {suspended} to‘xtatilgan · {inactive} nofaol',
    'dashboard.tariffs': 'Tariflar',
    'dashboard.tariffsHint': '{active} faol · {inactive} nofaol',
    'dashboard.users': 'Xodimlar',
    'dashboard.students': "O'quvchilar",
    'dashboard.studentsHint': '{active} faol',
    'dashboard.expiring':
        'Yaqin {days} kun ichida obunasi tugaydigan markazlar: {count}',
    'dashboard.byTariff': 'Tariflar bo‘yicha markazlar',
    'dashboard.centersChart': 'Markazlar holati',
    'dashboard.staffChart': 'Xodimlar tarkibi',
    'dashboard.studentsChart': "O'quvchilar faolligi",
    'dashboard.studentsMeter': "{active} / {total} o'quvchi faol",
    'dashboard.ofTotal': 'jami {total} tadan',
    'dashboard.noTariff': 'Tarifsiz',
    'dashboard.noData': 'Ma’lumot yo‘q',
    'dashboard.recentCenters': 'Oxirgi qo‘shilgan markazlar',
    'dashboard.noCenters': 'Hozircha markaz yo‘q',

    /* ── Tariflar ───────────────────────────────────────────────────── */
    'tariffs.title': 'Tariflar',
    'tariffs.subtitle': "O'quv markazlari uchun obuna tariflari",
    'tariffs.new': 'Yangi tarif',
    'tariffs.edit': 'Tarifni tahrirlash',
    'tariffs.search': 'Tarif nomi…',
    'tariffs.empty': 'Tarif topilmadi',
    'tariffs.price': 'Narxi',
    'tariffs.priceLabel': "Narxi (so'm)",
    'tariffs.duration': 'Muddati',
    'tariffs.durationLabel': 'Muddati (kun)',
    'tariffs.days': '{count} kun',
    'tariffs.dayUnit': 'kun',
    'tariffs.maxStudents': "O'quvchi limiti",
    'tariffs.maxStudentsLabel': "Maksimal o'quvchilar",
    'tariffs.maxTeachers': "O'qituvchi limiti",
    'tariffs.maxTeachersLabel': "Maksimal o'qituvchilar",
    'tariffs.unlimitedHint': "Bo'sh qoldirilsa — cheksiz",
    'tariffs.deleteTitle': "Tarifni o'chirish",
    'tariffs.deleteMessage':
        '"{name}" tarifi o‘chiriladi. Unga bog‘langan markazlar saqlanib qoladi.',
    'tariffs.created': 'Tarif yaratildi',
    'tariffs.updated': 'Tarif yangilandi',
    'tariffs.deleted': "Tarif o'chirildi",

    /* ── O'quv markazlari ───────────────────────────────────────────── */
    'centers.title': "O'quv markazlari",
    'centers.subtitle': 'Markazlar, ularning tariflari va obuna muddatlari',
    'centers.new': 'Yangi markaz',
    'centers.edit': 'Markazni tahrirlash',
    'centers.search': 'Nomi yoki telefon…',
    'centers.empty': 'Markaz topilmadi',
    'centers.allTariffs': 'Barcha tariflar',
    'centers.tariff': 'Tarif',
    'centers.noTariff': 'Tarifsiz',
    'centers.subscriptionEnds': 'Obuna tugashi',
    'centers.telegram': 'Telegram',
    'centers.instagram': 'Instagram',
    'centers.phoneHint': 'Format: +998XXXXXXXXX',
    'centers.deleteTitle': "Markazni o'chirish",
    'centers.deleteMessage':
        '"{name}" markazi o‘chiriladi. Markazga bog‘langan xodim va o‘quvchilar ham yo‘qoladi.',
    'centers.created': 'Markaz qo‘shildi',
    'centers.updated': 'Markaz yangilandi',
    'centers.deleted': "Markaz o'chirildi",
    'centers.backToList': 'Markazlar ro‘yxatiga',
    'centers.assignTariff': 'Tarif biriktirish',
    'centers.assignTariffAction': 'Biriktirish',
    'centers.assignTariffHint':
        'Obuna tugash sanasi tarif muddatiga qarab qayta hisoblanadi',
    'centers.leaveWithoutTariff': 'Tarifsiz qoldirish',
    'centers.tariffOption': '{name} — {days} kun',
    'centers.tariffAssigned': 'Tarif biriktirildi',
    'centers.admins': 'Markaz adminlari',
    'centers.addAdmin': 'Admin qo‘shish',
    'centers.addAdminTitle': 'Markaz admini qo‘shish',
    'centers.addAdminHint': 'Rol avtomatik "Markaz admini" bo‘ladi',
    'centers.adminPhoneHint': 'Bu raqam login sifatida ishlatiladi',
    'centers.adminCreated': 'Markaz admini qo‘shildi',
    'centers.noAdmins': 'Bu markazda hali admin yo‘q',

    /* ── Xodimlar ───────────────────────────────────────────────────── */
    'users.title': 'Xodimlar',
    'users.subtitle': 'Markaz adminlari, menejerlar va o‘qituvchilar',
    'users.new': 'Yangi xodim',
    'users.edit': 'Xodimni tahrirlash',
    'users.editHint': 'Rol va markaz bu yerda o‘zgartirilmaydi',
    'users.search': 'Ism, familiya yoki telefon…',
    'users.empty': 'Xodim topilmadi',
    'users.role': 'Rol',
    'users.allRoles': 'Barcha rollar',
    'users.center': 'Markaz',
    'users.allCenters': 'Barcha markazlar',
    'users.loginHint': 'Login sifatida ishlatiladi',
    'users.passwordHint': 'Kamida 8 ta belgi',
    'users.passwordKeepHint': 'Bo‘sh qoldirilsa parol o‘zgarmaydi',
    'users.deleteTitle': "Xodimni o'chirish",
    'users.deleteMessage': '{name} hisobi o‘chiriladi.',
    'users.created': 'Xodim yaratildi',
    'users.updated': 'Xodim yangilandi',
    'users.deleted': "Xodim o'chirildi",

    /* ── O'quvchilar ────────────────────────────────────────────────── */
    'students.title': "O'quvchilar",
    'students.subtitle': 'Markazga qabul qilingan o‘quvchilar ro‘yxati',
    'students.new': 'Yangi o‘quvchi',
    'students.edit': "O'quvchini tahrirlash",
    'students.search': 'Ism, familiya yoki telefon…',
    'students.empty': "O'quvchi topilmadi",
    'students.birthDate': 'Tug‘ilgan sana',
    'students.parent': 'Ota-ona',
    'students.parentName': 'Ota-ona ismi',
    'students.parentPhone': 'Ota-ona telefoni',
    'students.center': "O'quv markazi",
    'students.selectCenter': 'Markazni tanlang',
    'students.centerRequiredHint': 'Super admin uchun majburiy',
    'students.deleteTitle': "O'quvchini o'chirish",
    'students.deleteMessage': '{name} ro‘yxatdan o‘chiriladi.',
    'students.created': 'O‘quvchi qo‘shildi',
    'students.updated': 'O‘quvchi yangilandi',
    'students.deleted': "O'quvchi o'chirildi",

    /* ── Profil ─────────────────────────────────────────────────────── */
    'profile.title': 'Profil',
    'profile.subtitle': 'Hisob ma’lumotlari',
    'profile.nameRow': 'Familiya, ism',
    'profile.center': "O'quv markazi",
    'profile.allCenters': 'Barcha markazlar',
    'profile.attached': 'Biriktirilgan',
    'profile.notAttached': 'Biriktirilmagan',
    'profile.readOnly':
        'Profil ma’lumotlarini o‘zgartirish uchun administratorga murojaat qiling.',
    'profile.superAdmin': 'Super admin',

    /* ── 404 ────────────────────────────────────────────────────────── */
    'notFound.title': 'Sahifa topilmadi',
    'notFound.message': 'Siz izlayotgan sahifa mavjud emas yoki ko‘chirilgan.',
    'notFound.back': 'Bosh sahifaga qaytish',
} as const;

export type TranslationKey = keyof typeof uz;
export type Dictionary = Record<TranslationKey, string>;

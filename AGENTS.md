# EDU MS Frontend — AI agent qoidalari

> Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query

Bu frontend NestJS backend API'siga to‘liq mos qilib yozilgan. Backend
manba kodi va TZ: `../edums-backend` (lokal: `http://localhost:4000/api`,
Swagger: `http://localhost:4000/api-docs`).

**Asosiy qoida: backendda yo‘q narsani frontendda yaratmang.** Har bir sahifa,
maydon va filtr backenddagi aniq endpoint yoki DTO'ga tayanadi.

## Loyiha tuzilishi

```
src/
  app/
    layout.tsx            # root layout, uz lokali, ThemeProvider + Providers
    providers.tsx         # QueryClientProvider + SessionProvider
    page.tsx              # / — landing page (ochiq)
    register/             # /register — ro'yxatdan o'tish (SMS kod)
    login/                # /login — foydalanuvchi va super admin logini
    forgot-password/      # /forgot-password — parolni SMS kod bilan tiklash
    (dashboard)/          # himoyalangan qism (sessiya talab qilinadi)
      layout.tsx          # sidebar + header shell, sessiyani yangilash, obuna bloklash
      dashboard/          # /dashboard — markaz bosh sahifasi (reports.view)
      overview/           # /overview — platforma ko'rsatkichlari (super admin)
      users/              # /users — markaz foydalanuvchilari (users.*)
      roles/              # /roles — dinamik rollar (roles.*)
      branches/           # /branches — filiallar va xonalar (branches.*)
      courses/            # /courses — kurslar (courses.*)
      groups/             # /groups — guruhlar (groups.*)
      schedule/           # /schedule — haftalik dars jadvali (groups.view)
      students/           # /students va /[id] — o'quvchilar (students.*)
      leads/              # /leads — lidlar voronkasi (leads.*)
      cashbox/            # /cashbox — o'quvchi to'lovlari (payments.*); /payments — super admin'niki
      debtors/            # /debtors — qarzdorlar (payments.view)
      audit/              # /audit — harakatlar tarixi (audit.view)
      settings/           # /settings — markaz sozlamalari va saytdagi forma (settings.manage)
      expenses/           # /expenses — xarajatlar (expenses.*)
      salaries/           # /salaries — oyliklar (salaries.*)
      billing/            # /billing — tarif tanlash va to'lov (billing.manage)
      educations/         # /educations va /[id] — o'quv markazlar (super admin)
      tariffs/            # /tariffs — tariflar (super admin)
      payments/           # /payments — to'lov so'rovlari (super admin)
      sms-settings/       # /sms-settings — Eskiz ulanishi (super admin)
      platform-settings/  # /platform-settings — sinov muddati, to'lov ko'rsatmasi (super admin)
      profile/            # /profile — o'z ma'lumotlari va paroli
    not-found.tsx
  components/
    tailgrids/core/       # dizayn tizimi primitivlari (faqat ishlatilganlari)
    common/               # sidebar, header, logotip
    landing/              # landing page bo'limlari; rasmlar — landing/images.ts
    ui/                   # ilova darajasidagi komponentlar (forma, modal, jadval holati)
  services/api/           # har bir backend moduli uchun bitta fayl
  hooks/                  # use-session, use-list-query, use-api-error
  types/api.ts            # backend entity/DTO'larining nusxasi
  utils/                  # access (ruxsatlar), cn, format
```

## Backend bilan shartnoma

- Bazaviy manzil: `NEXT_PUBLIC_API_URL` — lokal `http://localhost:4000/api`.
- Fayllar: `NEXT_PUBLIC_FILES_URL` — lokal `http://localhost:4000` (static `/uploads`).
- Ikkalasining zaxira qiymati `src/services/api/client.ts` da lokal backendga
  qaraydi. Production'da `.env` da haqiqiy manzil beriladi.
- Barcha so'rovlar `src/services/api/client.ts` orqali ketadi — token, xato
  konverti va 401'da chiqarish shu yerda.
- Javob konvertlari: `{ success, data }`, `{ success, data, count, limit, offset }`,
  `{ success, message }`, xato uchun `{ success: false, statusCode, message }`.
- Ro'yxatlar **limit/offset** bilan sahifalanadi (sahifa raqami emas).
- Telefon formati hamma joyda `+998XXXXXXXXX`.

## Ruxsatlar

Batafsil qoidalar: `../edums-backend/README.md` (TZ bo'limi).

- **Super admin** (`POST /super_admin/login`) — faqat `/educations`: markaz
  yaratadi va unga owner qo'shadi. Markaz ichidagi ma'lumotlarga kirmaydi.
- **Markaz foydalanuvchisi** (`POST /auth/login`) — nima ko'rishi rollariga
  bog'liq. Rollar dinamik: markaz ularni o'zi yaratadi va ruxsat beradi.
  Bir foydalanuvchida bir nechta rol bo'lishi mumkin; **Owner** roli barcha
  ruxsatlarga ega.

Login formasi bitta: `signInWithPhone()` avval `/auth/login` ga, 401 kelsa
`/super_admin/login` ga murojaat qiladi.

Sessiyada `permissions` (barcha rollar birlashmasi) va `is_owner` saqlanadi.
Ular har kirishda `(dashboard)/layout.tsx` da `/auth/me` dan yangilanadi.
Interfeysdagi hamma tekshiruvlar `src/utils/access.ts` orqali:

| Funksiya | Nima uchun |
| --- | --- |
| `can(session, 'users.create')` | Menyu bandi, tugma, sahifa |
| `isSuperAdmin(session)` | Super admin bo'limlari |
| `canGrantRole(session, role)` | Rolni biriktirish/tahrirlash mumkinmi |
| `canManageUser(session, user, roles)` | Foydalanuvchini tahrirlash/o'chirish mumkinmi |
| `hasActiveSubscription(session)` | Markaz obunasi amaldami (tugagan bo'lsa faqat `/billing`, `/profile`) |

Sessiyada `subscription` ham bor. Obuna tugaganda backend `402` qaytaradi —
`client.ts` uni ushlab foydalanuvchini `/billing` ga yuboradi, layout esa
boshqa sahifalarni ochmaydi. `SubscriptionBanner` sinov muddati va tugash
haqida eslatadi.

Sahifalar `<AccessGuard allow={(s) => can(s, '...')}>` bilan yopiladi, menyu
`src/components/common/sidebar/data.tsx` da `visible` orqali filtrlanadi. Bu
faqat interfeys to'sig'i — haqiqiy tekshiruv backenddagi `PermissionsGuard`da.
Backend huquqni oshirishga yo'l qo'ymaydi (o'zida yo'q ruxsatni berib
bo'lmaydi); `canGrantRole`/`canManageUser` shu qoidaning nusxasi, rad
etiladigan tugmalarni oldindan yashirish uchun.

### Yangi ruxsat qo'shilganda

1. Backend: `src/permissions/permissions.catalog.ts`.
2. `src/types/api.ts` dagi `PERMISSION_KEYS` (yangi modul bo'lsa
   `PermissionModule` tipi ham).
3. Lug'atlarga `permission.<kalit>` (yangi modul uchun
   `permissionModule.<modul>`) — to'rttala tilda.

## Dizayn

**Brend rangi ko'k (`--primary-500: #3758f9`) — o'zgartirilmaydi.**

## Formatlanadigan maydonlar

Foydalanuvchi o'qishga qulay ko'rinishni ko'radi, backendga xom qiymat ketadi.

| Komponent | Ko'rinish | Yuboriladi |
| --- | --- | --- |
| `PhoneInput` (`ui/phone-input.tsx`) | `+998` (o'zgarmas) + `90 123 45 67` | `+998901234567` |
| `MoneyInput` (`ui/number-input.tsx`) | `300 000 so'm` | `300000` |
| `NumberInput` (`ui/number-input.tsx`) | `12 000 kun` | `12000` |

`+998` maydonning tahrirlanmaydigan qismi — aks holda kursor prefiksdan oldin
qolib, raqamlar noto'g'ri joyga tushardi. Raqamli maydonga oddiy
`type='number'` qo'ymang: minglik ajratgichini ko'rsatmaydi.

## Jadvallar

- **Tartib raqami** — har bir jadvalning birinchi ustuni:
  `<RowNumberHead />` va `<RowNumberCell index={index} offset={offset} />`
  (`ui/row-number.tsx`). Sahifalangan ro'yxatda `offset` beriladi, aks holda
  ikkinchi sahifa yana 1 dan boshlanadi. "Jami" qatorida — bo'sh `<TableCell />`.
- **Holat va toifalar** matn bilan emas, badge bilan: `ui/status-badge.tsx`
  (`LeadStatusBadge`, `PaymentMethodBadge`, `ExpenseCategoryBadge`,
  `LeadSourceBadge`, `AuditActionBadge` va h.k.). Har bir qiymatning o'z
  rangi bor; yangi enum qo'shilsa, rang xaritasiga ham qo'shiladi.
- **Muhim summalar** rangi `utils/tone.ts` dan — badge tokenlari, ikkala
  mavzuda o'qiladi: qarz — `error`, to'lanmagan oylik — `warning`,
  tushum va to'liq to'langan — `success` (`balanceTone()` balans uchun).
  `text-red-600` kabi palitra ranglari yozilmaydi.
- Rang faqat yordamchi: ma'no matnda ham bo'lishi kerak (yorliq, ishora,
  `title`).

## Grafiklar

`src/components/ui/charts.tsx` — kutubxonasiz HTML grafiklar: `StatTile`,
`Meter`, `ColumnChart` (vaqt bo'yicha bitta seriya), `HorizontalBars`.
Bitta seriya — bitta rang (`brand-accent`), legenda yo'q (sarlavha aytadi);
ustun ≤ 24px, uchi yumaloq; faqat oxirgi qiymat yozib qo'yiladi, qolgani —
hover/fokus tooltip va ekran o'quvchi uchun `sr-only` jadvalda. Matn doim
`text-*` tokenlarida, seriya rangida emas. Ikki o'qli (dual-axis) grafik
chizilmaydi.

## Landing page

`src/app/page.tsx` bo'limlarni `src/components/landing/` dan yig'adi: hero,
"Tanish holatmi?", 4 ta katta bo'lim (rasm + matn), imkoniyatlar, qadamlar,
tariflar (bazadan), FAQ, CTA. Qoidalar:

- Faqat tizimda **haqiqatan bor** imkoniyatlar yoziladi. To'qima raqamlar
  ("500+ markaz") va mijoz fikrlari qo'shilmaydi — haqiqiylari bo'lganda.
- FAQ javoblari backend qoidalariga mos (obuna tugashi, `max_users`,
  filiallar soni cheklanmagan). Qoida o'zgarsa, javob ham o'zgaradi.
- Rasmlar `public/landing/` da, yo'li `components/landing/images.ts` da.
  `null` bo'lsa `ImageSlot` rasm uchun ramka ko'rsatadi.

## Kod namunalari

Markaz saytiga qo'yiladigan kod (`settings/lead-form-section.tsx`)
`CodeBlock` (`ui/code-block.tsx`) bilan ko'rsatiladi — nusxa olish tugmasi
bilan. Namunadagi ko'rinadigan matnlar (placeholder, tugma, xabar) ham
`t()` dan olinadi, JS satriga `JSON.stringify` bilan qo'yiladi. Vidjetning
o'zi backendda: `../edums-backend/src/lead_forms/widget/lead-form.js` —
uning 4 tildagi matnlari shu faylda.

## Select komponenti

Barcha ochiladigan ro'yxatlar `src/components/ui/shadcn/select.tsx` orqali —
shadcn/ui Select (Radix asosida), loyiha tokenlariga moslangan.

**shadcn CLI ishlatilmaydi.** `shadcn init` globals.css ga o'zining token
to'plamini yozadi va bu yerdagi iliq palitrani buzadi. Komponent kodi
loyihada — shadcn falsafasiga ko'ra uni shu yerda tahrirlash kerak.

Native `<select>` qo'shmang: uning ro'yxatini operatsion tizim chizadi va
mavzuga moslashtirib bo'lmaydi.

`SelectInput` API: `value` + `onValueChange(value: string)`. Bo'sh satr
"barchasi" degani — ichkarida `__all__` kalitiga almashtiriladi, chunki Radix
bo'sh qiymatni qabul qilmaydi.

## Konvensiyalar

- Fayl nomlari kebab-case, komponent eksportlari PascalCase.
- Hook yoki brauzer API ishlatilsa `'use client'` qo'shiladi.
- **Hech qachon matnni to'g'ridan-to'g'ri yozmang.** Har bir ko'rinadigan satr
  `useT()` orqali keladi: `const t = useT(); t('roles.title')`.
  Yangi matn kerak bo'lsa avval `src/i18n/dictionaries/uz.ts` ga kalit qo'shing,
  keyin `uz-cyrl.ts`, `ru.ts`, `en.ts` ga tarjimasini yozing — `Dictionary`
  tipi to'liqlikni majburlaydi.
- O'rinbosarlar: `t('pagination.summary', { count, from, to })` — lug'atda `{count}`.
- Sana/son formatlari `useFormat()` hookidan olinadi (til bilan bog'langan):
  `formatDate`, `formatDateTime`, `formatNumber`, `formatPrice(value, t('common.som'))`.
- Enum yorliqlari kalit shablonlari orqali: `t(\`educationStatus.\${status}\`)`,
  `t(\`permission.\${key}\`)`. Rol nomlari tarjima qilinmaydi — ularni markaz
  o'zi yozadi.
- **Tipografika:** sarlavhalar `font-display` (Golos Text), qolgan hamma joy
  Inter. Ikkalasi ham `latin, latin-ext, cyrillic, cyrillic-ext` subsetlari
  bilan yuklanadi — `cyrillic-ext` bo'lmasa o'zbek kirillidagi Ў, Қ, Ғ, Ҳ
  tizim shriftiga tushib ketadi. Yangi shrift qo'shsangiz shu to'rt subsetni
  ham bering.
- Raqamli ustunlar va statistika qiymatlarida `tabular-nums` — aks holda
  raqamlar jadvalda tekis turmaydi.
- Ranglar faqat `src/app/globals.css` dagi semantik tokenlar orqali
  (`text-text-*`, `bg-card-*`, `border-card-border`). Hex kodlar yozilmaydi.
- Mavzu `<html data-theme="dark">` orqali ishlaydi. Tailwind'ning `dark:`
  varianti globals.css'da shu belgiga qayta bog'langan, shuning uchun
  `dark:bg-...` utilitalari tugma bilan birga almashadi. Yangi rang qo'shsangiz,
  ikkala mavzuda ham tekshiring.
- Brauzer o'zi chizadigan elementlar (select ro'yxati, sana tanlagich,
  scrollbar) faqat `color-scheme` xossasiga bo'ysunadi — u `css/default.css`
  va `css/dark.css` da belgilangan. CSS bilan bo'yashga urinmang.
- Tungi mavzu palitrasi sof qora emas va **brend ko'k ohangiga** (232°)
  moslangan — shuning uchun ko'k tugmalar fonga qarshi turmaydi. Qatlamlar
  tartibi saqlanishi kerak: sahifa `#181921` → asosiy panel `#1e2029` →
  karta `#272934` → ustki qatlam `#2f303d` → chegara `#464859`.
  Matn: `#e9ebf1` / `#acb0be` / `#9ca0b0` — barchasi WCAG AA dan o'tadi.
- **`brand-500` va `brand-accent` farqi:** `brand-500` (`#5750f1`) — tugma
  foni, ustidagi oq matn kontrasti muhim (5.49). `brand-accent` — kichik
  aksentlar (faol menyu chizig'i, tanlangan variant belgisi, ulush chiziqlari);
  tungi mavzuda u yorug'roq (`#7b7cf5`), chunki `#5750f1` qorong'i fonda
  atigi 2.4–3.2 kontrast beradi.
- **`cn()` da arbitrary `bg-...` qiymatlaridan saqlaning.** tailwind-merge
  ularni fon rangi bilan bitta guruhga qo'shib, oldingi `bg-*` klassini
  o'chirib yuboradi. Fon rasmi kerak bo'lsa alohida element yoki
  globals.css'dagi qoida ishlating (misol: `SelectInput` chevroni).
- Izohlarda ham Tailwind klass shakliga o'xshash matn yozmang — Tailwind uni
  klass deb skanerlaydi va build yiqiladi.
- Forma modallari **faqat ochilganda mount qilinadi** (`{open && <Form .../>}`),
  shuning uchun boshlang'ich holat `useState` initializerida hisoblanadi.
- **Yaratish oynasiga to'g'ridan-to'g'ri havola:** `withNewParam('/students')`
  → `/students?new=1`. Sahifa `useOpenOnNewParam(open, canCreate)`
  (`hooks/use-new-param.ts`) bilan oynani ochadi va parametrni manzildan
  olib tashlaydi. Dashboard qadamlari va tez amallar shu orqali ishlaydi.
- Boshqa sahifaga olib boradigan tugma — `LinkButton` (`ui/link-button.tsx`),
  `Button` emas: yangi oynada ochish ishlashi kerak.
- Server holati — TanStack Query; mahalliy holat — `useState`/context.
  Yangi state kutubxonasi qo'shilmaydi.
- Xatolar `toastApiError()` orqali sonner toast'iga chiqadi.
- Formatlash — Prettier (`.prettierrc`: 4 probel, single quote, 80 belgi).
  ESLint formatlashga aralashmaydi (`eslint-config-prettier` o'chirib qo'ygan).
  Yozib bo'lgach: `npm run lint && npm run format && npm run typecheck`.
  CI (`.github/workflows/ci.yml`) lint'ni `--max-warnings=0` bilan
  ishlatadi — bitta ogohlantirish ham tekshiruvni yiqitadi.

## Ataylab o'ralmagan endpointlar

Quyidagilar `src/services/api/` da yo'q, chunki interfeys ayni imkoniyatni
boshqa yo'l bilan qoplaydi:

| Endpoint | Sabab |
| --- | --- |
| `GET /users/:id`, `/roles/:id`, `/uploads/:id` | Tahrirlash oynasi ro'yxatdagi yozuvni ishlatadi — qayta so'rovga hojat yo'q |
| `GET /uploads`, `DELETE /uploads` | Fayl menejeri hozircha yo'q — faqat rasm yuklash (`uploadFile`) ishlatiladi |
| `GET /uploads/exists` | Interfeysda foydalanuvchi ssenariysi yo'q |
| `GET /health` | Foydalanuvchiga server holatini ko'rsatish talab qilinmagan |
| `GET /public/lead-forms/:key`, `POST /public/lead-forms/:key/leads` | Markaz saytidan chaqiriladi — interfeys faqat ularning manzilini ko'rsatadi (`leadFormSubmitUrl` va h.k.) |

Agar kerak bo'lsa, ularni servis fayliga qo'shish oson — tip `types/api.ts` da tayyor.

## Yangi endpoint qo'shilganda

1. `src/types/api.ts` ga entity va DTO tiplarini qo'shing.
2. `src/services/api/<modul>.ts` da funksiya yozing.
3. Sahifani `(dashboard)` ichida yarating va menyuga qo'shing.
4. Ruxsatni `AccessGuard` va `data.tsx` da backenddagi `@RequirePermissions` ga
   mos belgilang.

## Man etiladi

- Backendda mavjud bo'lmagan sahifa, maydon yoki filtr qo'shish.
- Paket o'rnatish — avval foydalanuvchidan so'ralsin.
- `src/components/tailgrids/core/` primitivlarini so'rovsiz o'zgartirish.
- Yangi CSS utility klasslari yaratish.
- Inglizcha interfeys matni yozish.

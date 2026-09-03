# EDU MS Frontend — AI agent qoidalari

> Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query

Bu frontend NestJS backend API'siga to‘liq mos qilib yozilgan. Backend
production'da ishlaydi — uni lokal ko‘tarish shart emas:

- API: `https://api.edums.uz/api`
- Swagger: `https://api.edums.uz/api-docs` (endpointlarni shu yerdan tekshiring)
- Manba kodi: `../edums-backend`

**Asosiy qoida: backendda yo‘q narsani frontendda yaratmang.** Har bir sahifa,
maydon va filtr backenddagi aniq endpoint yoki DTO'ga tayanadi.

## Loyiha tuzilishi

```
src/
  app/
    layout.tsx            # root layout, uz lokali, ThemeProvider + Providers
    providers.tsx         # QueryClientProvider + SessionProvider
    login/                # /login — xodim va super admin logini
    (dashboard)/          # himoyalangan qism (sessiya talab qilinadi)
      layout.tsx          # sidebar + header shell, sessiya tekshiruvi
      page.tsx            # / — tizim statistikasi (faqat super admin)
      students/           # /students
      education-centers/  # /education-centers va /[id]
      tariffs/            # /tariffs
      users/              # /users
      uploads/            # /uploads
      profile/            # /profile
    not-found.tsx
  components/
    tailgrids/core/       # dizayn tizimi primitivlari (faqat ishlatilganlari)
    common/               # sidebar, header
    ui/                   # ilova darajasidagi komponentlar (forma, modal, jadval holati)
  services/api/           # har bir backend moduli uchun bitta fayl
  hooks/                  # use-session, use-list-query, use-api-error
  types/api.ts            # backend entity/DTO'larining nusxasi
  utils/                  # cn, format, labels, icon
```

## Backend bilan shartnoma

- Bazaviy manzil: `NEXT_PUBLIC_API_URL` — `.env` da `https://api.edums.uz/api`.
- Fayllar: `NEXT_PUBLIC_FILES_URL` — `https://api.edums.uz` (static `/uploads`).
- Ikkalasining zaxira qiymati `src/services/api/client.ts` da ham production'ga
  qaraydi, shuning uchun `.env` bo‘lmasa ham ilova ishlaydi.
- Barcha so'rovlar `src/services/api/client.ts` orqali ketadi — token, xato
  konverti va 401'da chiqarish shu yerda.
- Javob konvertlari: `{ success, data }`, `{ success, data, count, limit, offset }`,
  `{ success, message }`, xato uchun `{ success: false, statusCode, message }`.
- Ro'yxatlar **limit/offset** bilan sahifalanadi (sahifa raqami emas).
- Telefon formati hamma joyda `+998XXXXXXXXX`.

## Rollar

| Rol | Kirish endpointi | Ko'radigan bo'limlar |
| --- | --- | --- |
| `super_admin` | `POST /super_admin/login` | Barchasi |
| `center_admin` | `POST /auth/login` | O'quvchilar, Fayllar, Profil |
| `manager` | `POST /auth/login` | O'quvchilar, Fayllar, Profil |
| `teacher` | `POST /auth/login` | O'quvchilar (faqat ko'rish), Fayllar, Profil |

Login formasi bitta: `signInWithPhone()` avval `/auth/login` ga, 401 kelsa
`/super_admin/login` ga murojaat qiladi. Foydalanuvchidan hisob turi
so'ralmaydi.

Menyu `src/components/common/sidebar/data.tsx` da rolga qarab filtrlanadi,
sahifalar esa `RoleGuard` bilan yopiladi. Bu faqat interfeys to'sig'i —
haqiqiy tekshiruv backend guard'larida.

## O'rnatilgan dizayn skillari

`.claude/skills/` da ikkita skill turadi — UI ustida ishlashdan oldin
tegishlisini yuklang:

| Skill | Nima uchun |
| --- | --- |
| `frontend-design` | Vizual yo'nalish, tipografika, shablonga o'xshamaydigan qarorlar |
| `ui-ux-pro-max` | 119 ta UX qoidasi, palitralar, accessibility tekshiruvlari. Qidiruv: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<so'rov>" --domain ux` |

`.agents/skills/react-aria` — shablondan qolgan, `react-aria-components`
primitivlariga tegishli, hali ham foydali.

**Brend rangi ko'k (`--primary-500: #3758f9`) — o'zgartirilmaydi.**

## Diagrammalar

`src/components/charts/` — donut, gorizontal bar va meter. Kutubxona yo'q:
barcha shakllar oddiy va dizayn tokenlariga to'g'ridan-to'g'ri bog'lanadi.

**Backend tarixiy ma'lumot bermaydi** (faqat joriy kesim), shuning uchun
trend chizig'i yo'q — bo'lmagan ma'lumotni chizmang.

Ranglar `--chart-*` tokenlaridan olinadi; ular `dataviz` skillining
validatoridan o'tgan (CVD ajralishi, yorqinlik oralig'i, yuzaga nisbatan
kontrast) — ikkala mavzu uchun alohida tanlangan, avtomatik "teskari" emas.
Yangi rang qo'shsangiz avval validatordan o'tkazing:

```bash
node <dataviz>/scripts/validate_palette.js "#hex,#hex,#hex" --mode dark --surface "#272934"
```

Qoidalar:

- Kategorik ranglar qat'iy tartibda, aylanmaydi. 3 tadan ortiq seriya kerak
  bo'lsa — "Boshqa" ga yig'ing yoki jadvalga o'ting.
- Holat ranglari (`--status-*`) faqat holat uchun; ular hech qachon seriya
  rangi bo'lmaydi va doim yorliq bilan birga keladi.
- 2 va undan ortiq seriyada legenda majburiy — ma'noni faqat rang tashimasin.
  Qiymat legendada turadi, shuning uchun tooltip yagona o'qish yo'li emas.
- Katta yakka raqamda (hero, stat karta) `font-display` ham, `tabular-nums`
  ham ishlatilmaydi — ikkalasi ham anti-pattern.

## Formatlanadigan maydonlar

`src/components/ui/formatted-input.tsx` — pul, son va telefon uchun.
Umumiy qoida: **foydalanuvchi formatlangan ko'rinishni ko'radi, backend xom
qiymatni oladi.**

| Komponent | Ko'rinish | Yuboriladi |
| --- | --- | --- |
| `MoneyInput` | `1 250 000 so'm` | `1250000` |
| `NumberInput` | `12 000` | `12000` |
| `PhoneInput` | `+998` (o'zgarmas) + `90 123 45 67` | `+998901234567` |

Telefonda `+998` maydonning tahrirlanmaydigan qismi — aks holda kursor
prefiksdan oldin qolib, raqamlar noto'g'ri joyga tushardi.

Raqamli maydonga oddiy `type='number'` qo'ymang: minglik ajratgichini
ko'rsatmaydi va tilga bog'lanmaydi.

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
  `useT()` orqali keladi: `const t = useT(); t('tariffs.title')`.
  Yangi matn kerak bo'lsa avval `src/i18n/dictionaries/uz.ts` ga kalit qo'shing,
  keyin `uz-cyrl.ts`, `ru.ts`, `en.ts` ga tarjimasini yozing — `Dictionary`
  tipi to'liqlikni majburlaydi.
- O'rinbosarlar: `t('pagination.summary', { count, from, to })` — lug'atda `{count}`.
- Sana/son formatlari `useFormat()` hookidan olinadi (til bilan bog'langan).
  `formatPrice` va `formatLimit` ga valyuta/`cheksiz` matni argument sifatida
  uzatiladi, chunki ular ham tarjima qilinadi.
- Enum yorliqlari kalit shablonlari orqali: `t(\`role.\${user.role}\`)`,
  `t(\`centerStatus.\${status}\`)`, `t(\`studentStatus.\${status}\`)`.
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
- Server holati — TanStack Query; mahalliy holat — `useState`/context.
  Yangi state kutubxonasi qo'shilmaydi.
- Xatolar `toastApiError()` orqali sonner toast'iga chiqadi.
- Formatlash — Prettier (`.prettierrc`: 4 probel, single quote, 80 belgi).
  ESLint formatlashga aralashmaydi (`eslint-config-prettier` o'chirib qo'ygan).
  Yozib bo'lgach: `npm run lint && npm run format && npm run typecheck`.

## Ataylab o'ralmagan endpointlar

Quyidagilar `src/services/api/` da yo'q, chunki interfeys ayni imkoniyatni
boshqa yo'l bilan qoplaydi:

| Endpoint | Sabab |
| --- | --- |
| `GET /tariffs/:id`, `/students/:id`, `/users/:id`, `/uploads/:id` | Tahrirlash oynasi ro'yxatdagi yozuvni ishlatadi — qayta so'rovga hojat yo'q |
| `DELETE /uploads` (path bo'yicha) | `DELETE /uploads/:id` bilan bir xil natija beradi |
| `GET /uploads/exists` | Interfeysda foydalanuvchi ssenariysi yo'q |
| `GET /health` | Foydalanuvchiga server holatini ko'rsatish talab qilinmagan |

Agar kerak bo'lsa, ularni servis fayliga qo'shish oson — tip `types/api.ts` da tayyor.

## Yangi endpoint qo'shilganda

1. `src/types/api.ts` ga entity va DTO tiplarini qo'shing.
2. `src/services/api/<modul>.ts` da funksiya yozing.
3. Sahifani `(dashboard)` ichida yarating va menyuga qo'shing.
4. Rolni `RoleGuard` va `data.tsx` da backend guard'iga mos belgilang.

## Man etiladi

- Backendda mavjud bo'lmagan sahifa, maydon yoki filtr qo'shish.
- Paket o'rnatish — avval foydalanuvchidan so'ralsin.
- `src/components/tailgrids/core/` primitivlarini so'rovsiz o'zgartirish.
- Yangi CSS utility klasslari yaratish.
- Inglizcha interfeys matni yozish.

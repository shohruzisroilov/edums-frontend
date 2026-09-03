# EDU MS — Frontend

Ta'lim boshqaruv tizimi (Education Management System) admin paneli.

## Ishga tushirish

1. Loyiha ildizida `.env` fayl yarating va backend manzilini yozing:

```env
NEXT_PUBLIC_API_URL=https://api.edums.uz/api
NEXT_PUBLIC_FILES_URL=https://api.edums.uz
```

Namuna `.env.example` faylida turibdi.

2. Paketlarni o‘rnating va serverni ishga tushiring:

```bash
npm install
npm run dev
```

Ilova `http://localhost:3000` da ochiladi.

> `NEXT_PUBLIC_*` qiymatlari build paytida kodga yoziladi — `.env` ni
> o‘zgartirgandan keyin dev serverni qayta ishga tushiring yoki qaytadan
> build qiling.

## Skriptlar

| Buyruq | Vazifasi |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production serverni ishga tushirish |
| `npm run lint` | ESLint tekshiruvi |
| `npm run lint:fix` | ESLint xatolarini avtomatik tuzatish |
| `npm run format` | Prettier bilan formatlash |
| `npm run format:check` | Formatlashni tekshirish (o‘zgartirmaydi) |
| `npm run typecheck` | TypeScript tekshiruvi |

## Texnologiyalar

| Qatlam | Kutubxona |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Shriftlar | Golos Text (sarlavha) + Inter (matn) — kirill bilan |
| Styling | Tailwind CSS 4 |
| Server holati | TanStack Query |
| UI primitivlari | React Aria Components, Base UI (Avatar) |
| Ikonkalar | `@tailgrids/icons` |
| Bildirishnoma | `sonner` |
| Theme | `next-themes` (kunduzgi/tungi) |
| Kod sifati | ESLint + Prettier |

## Sahifalar va rollar

| Sahifa | Manzil | Kim ko‘radi |
| --- | --- | --- |
| Kirish | `/login` | Hamma |
| Boshqaruv paneli | `/` | Super admin |
| O‘quv markazlari | `/education-centers` va `/[id]` | Super admin |
| Tariflar | `/tariffs` | Super admin |
| Xodimlar | `/users` | Super admin |
| O‘quvchilar | `/students` | Barcha rollar |
| Fayllar | `/uploads` | Barcha rollar |
| Profil | `/profile` | Barcha rollar |

Rollar: `super_admin`, `center_admin`, `manager`, `teacher`.
Hisoblarni faqat super admin yaratadi — ro‘yxatdan o‘tish yo‘q.
O‘quvchilar tizimga kirmaydi.

Ruxsatlar:

- O‘quvchi qo‘shish/tahrirlash — super admin, markaz admini, menejer.
- O‘quvchini o‘chirish — super admin va markaz admini.
- O‘qituvchi faqat ro‘yxatni ko‘radi.
- Markaz xodimlari faqat o‘z markazining o‘quvchilarini ko‘radi.

## Loyiha tuzilishi

```
src/
  app/            # sahifalar (App Router), login va (dashboard) guruhlari
  components/
    tailgrids/core/  # dizayn tizimi primitivlari
    common/          # sidebar, header
    ui/              # forma, modal, jadval holati komponentlari
  services/api/   # API funksiyalari
  hooks/          # sessiya, ro'yxat holati, xato hooklari
  types/api.ts    # API tiplari
  utils/          # cn, format, labels, icon
```

## Tillar

Interfeys to‘rt tilda ishlaydi. Til tanlovi header'dagi (va login sahifasidagi)
tanlagich orqali almashadi va brauzerda saqlanadi.

| Kod | Til |
| --- | --- |
| `uz` | O‘zbekcha (lotin) — standart |
| `uz-cyrl` | Ўзбекча (кирилл) |
| `ru` | Русский |
| `en` | English |

Tarjimalar `src/i18n/dictionaries/` da, har bir til uchun bitta fayl.
Lotin lug‘ati (`uz.ts`) kalitlar manbai — boshqa tillarda kalit unutilsa
TypeScript xato beradi. Sana va son formatlari tanlangan tilga qarab tuziladi
(`src/utils/format.ts` + `useFormat()` hooki).

## Mavzu

Kunduzgi va tungi mavzu `next-themes` orqali, `<html data-theme="...">`
belgisi bilan boshqariladi. Tanlov brauzerda saqlanadi; birinchi kirishda
tizim sozlamasi hisobga olinadi. Tugma header va login sahifasida.

Tungi mavzu sof qora emas — iliq (malla) tusli qatlamli palitra:
sahifa `#1c1a17`, panel `#242119`, karta `#2b2721`. Ranglar
`src/app/css/dark.css` da, kunduzgisi `src/app/css/default.css` da.

## Kod uslubi

Ishtirokchilar va AI agentlar uchun qoidalar [AGENTS.md](AGENTS.md) faylida
(`CLAUDE.md` shu faylga ishora qiladi).

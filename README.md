# EduMS — Frontend

O'quv markazlari uchun CRM interfeysi. Backend: `../edums-backend`
(API va to'liq texnik topshiriq o'sha yerdagi `README.md` da).

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query

## Ishga tushirish

Avval backend ishga tushgan bo'lsin (`http://localhost:4000`).

```bash
cp .env.example .env    # API manzili: http://localhost:4000/api
npm install
npm run dev             # http://localhost:3000
```

| Buyruq | Nima qiladi |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build va ishga tushirish |
| `npm run lint` · `format` · `typecheck` | Kod sifati |

## Sahifalar

| Sahifa | Manzil | Kim ko'radi |
| --- | --- | --- |
| Landing page | `/` | Hamma |
| Ro'yxatdan o'tish | `/register` | Hamma (SMS kod bilan, 7 kun bepul) |
| Kirish | `/login` | Hamma |
| Parolni tiklash | `/forgot-password` | Hamma (SMS kod bilan) |
| O'quv markazlar | `/educations`, `/educations/[id]` | Super admin |
| Tariflar | `/tariffs` | Super admin |
| To'lovlar | `/payments` | Super admin |
| Platforma sozlamalari | `/platform-settings` | Super admin |
| Foydalanuvchilar | `/users` | `users.view` ruxsati borlar |
| Rollar | `/roles` | `roles.view` ruxsati borlar |
| Filiallar va xonalar | `/branches` | `branches.view` ruxsati borlar |
| Kurslar | `/courses` | `courses.view` ruxsati borlar |
| Guruhlar | `/groups` | `groups.view` ruxsati borlar |
| Dars jadvali | `/schedule` | `groups.view` ruxsati borlar |
| Tarif va to'lov | `/billing` | `billing.manage` ruxsati borlar |
| Profil | `/profile` | Kirgan har bir kishi |

Obuna tugagan markaz foydalanuvchisi faqat `/billing` va `/profile` da qoladi
(backend boshqa hamma joyda `402` qaytaradi).

Rollar dinamik: har bir markaz o'z rollarini yaratadi, ularga ruxsat beradi va
foydalanuvchiga bir nechta rol biriktiradi. Owner roli barcha ruxsatlarga ega.
Menyu va tugmalar sessiyadagi `permissions` ga qarab ko'rsatiladi
(`src/utils/access.ts`).

## Papka tuzilishi

```
src/
  app/
    page.tsx              # / — landing page (ochiq)
    register/             # /register — ro'yxatdan o'tish (SMS kod)
    login/                # /login
    forgot-password/      # /forgot-password — parolni SMS kod bilan tiklash
    (dashboard)/          # sessiya talab qilinadigan qism
      layout.tsx          # sidebar + header, sessiyani yangilash, obuna tugasa /billing ga
      educations/         # super admin: markazlar, ownerlar, obunalar tarixi
      tariffs/            # super admin: tariflar
      payments/           # super admin: to'lov so'rovlari
      billing/            # markaz: tarif tanlash va to'lov
      users/              # foydalanuvchilar
      roles/              # rollar va ruxsatlar
      branches/           # filiallar va ularning xonalari
      courses/            # kurslar
      groups/             # guruhlar
      schedule/           # haftalik dars jadvali
      profile/            # o'z profili va paroli
    css/, globals.css     # dizayn tokenlari (kunduzgi/tungi mavzu)
  components/
    common/               # sidebar, header, logotip, til tanlash
    tailgrids/core/       # dizayn tizimi primitivlari (tugma, jadval, badge...)
    ui/                   # forma maydonlari, modal, jadval holatlari, AccessGuard
  services/api/           # backend bilan ishlash — har bir modul uchun bitta fayl
  hooks/                  # use-session, use-list-query, use-api-error, use-format
  i18n/                   # 4 til: uz, uz-cyrl, ru, en
  types/api.ts            # backend javoblarining tiplari
  utils/                  # access (ruxsatlar), cn, format
```

Har bir sahifa papkasida sahifaning o'zi (`page.tsx`) va faqat shu sahifaga
tegishli komponentlar (`_components/`) turadi.

Kod yozish qoidalari: `AGENTS.md`.

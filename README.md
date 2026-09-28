# EDUMS Frontend

Next.js 16 (App Router), React 19 va Tailwind CSS 4 asosida qurilgan foydalanuvchi interfeysi.

---

## 🚀 Ishga tushirish (Setup)

### 1. Talablar
- Node.js >= 18
- Ishlayotgan backend servisi (`http://localhost:4000`)

### 2. `.env.local` faylini sozlash
`.env.example` dan nusxa oling:
```bash
cp .env.example .env.local
```

### 3. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 4. Loyihani ishga tushirish
```bash
npm run dev
```

- **Frontend manzili:** `http://localhost:3000`

---

## 📜 Asosiy buyruqlar

| Buyruq | Tavsifi |
| :--- | :--- |
| `npm run dev` | Development serverini ishga tushirish (`localhost:3000`) |
| `npm run build` | Production uchun yig'ish (`.next/`) |
| `npm start` | Yig'ilgan production serverini ishga tushirish |
| `npm run typecheck` | TypeScript turlarini tekshirish |
| `npm run lint` | ESLint tekshiruvi |
| `npm run format` | Prettier orqali kodni formatlash |

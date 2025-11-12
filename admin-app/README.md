# Web App — Next.js + PostgreSQL (Prisma)

Esto prepara la app para usar PostgreSQL con Prisma y NextAuth (adapter Prisma).

Pasos rápidos:

1. Copiar `.env.example` a `.env` y rellenar `DATABASE_URL` y `NEXTAUTH_SECRET`.
2. Instalar dependencias:

   npm install

3. Generar cliente Prisma:

   npm run prisma:generate

4. Ejecutar migración y crear tablas (requiere `DATABASE_URL` apuntando a Postgres):

   # Levantar Postgres en Docker (recomendado en desarrollo)
   docker compose up -d

   # Ejecutar migración (creará las tablas según prisma/schema.prisma)
   npm run prisma:migrate

5. Sembrar usuario de prueba (admin@example.com / password123):

   npm run prisma:seed

6. Ejecutar la app:

   npm run dev

Short checklist (recommended):

- Copy `.env.example` -> `.env` and update values
- Start DB: `docker compose up -d`
- Run: `npm run prisma:generate` then `npm run prisma:migrate` then `npm run prisma:seed`
- Start dev server: `npm run dev`

Notas:
- La ruta de autenticación con NextAuth está en `app/api/auth/[...nextauth]/route.ts`.
- El helper de prisma está en `lib/prisma.ts`.
- En producción, establece `NODE_ENV=production` y usa un `NEXTAUTH_SECRET` seguro.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Undangan Lamaran Digital

Website undangan lamaran berbasis Next.js dengan:

- Halaman undangan publik personal per tamu
- Admin dashboard untuk kelola tamu, tema, konten, media, dan toggle section
- RSVP dan guestbook
- Generator link WhatsApp per tamu
- Upload media lokal
- Animasi pembuka amplop

## Stack

- Next.js App Router
- Tailwind CSS
- Prisma + SQLite
- Framer Motion

## Setup

Project ini sudah memakai `.env` untuk konfigurasi dan dependency Node akan terpasang lokal di folder project, jadi tidak mencampur package global Anda.

Jika Anda ingin isolasi penuh seperti `uv` di Python, gunakan Docker Compose.

### Opsi 1: Docker Compose

1. Buat file environment

```bash
cp .env.example .env
```

2. Jalankan aplikasi

```bash
docker compose up --build
```

Compose sekarang menjalankan image production yang dibuild dari `Dockerfile`, lalu saat container start hanya akan:

- memastikan schema Prisma sinkron
- memakai database project `./dev.db`
- memakai upload lokal di `./public/uploads`
- menjalankan Next.js production server di `http://localhost:3000`

### Opsi 2: Local Project-Only

Dependency tetap aman karena hanya masuk ke `./node_modules`, bukan package global sistem.

1. Install dependency

```bash
npm install
```

2. Siapkan environment

```bash
cp .env.example .env
```

3. Buat database dan generate schema

```bash
npm run db:push
npm run db:seed
```

4. Jalankan project development

```bash
npm run dev
```

Jika Anda hanya ingin menjalankan website secara stabil tanpa mode development, gunakan:

```bash
npm run build
npm run start
```

## Reset Database

SQLite dipakai dari file `./dev.db` di root project.

Reset lokal:

```bash
npm run db:reset
```

Jika Anda menjalankan via Docker:

```bash
docker compose exec web npm run db:reset
```

Jika Anda hanya ingin membersihkan data operasional seperti guest, RSVP, dan guestbook tanpa menghapus setting undangan:

```bash
docker compose exec web npm run db:clear-content
```

## Login Admin Default

- Username: `admin`
- Password: `lamaran123`

## Route Utama

- Publik: `/invitation/public`
- Admin: `/admin/login`

## Catatan

- Upload media akan disimpan ke `public/uploads`
- Base URL untuk generator link WhatsApp memakai `NEXT_PUBLIC_BASE_URL` saat diperlukan
- Jika nanti ingin pindah ke PostgreSQL, cukup ganti datasource Prisma dan migrasi data
- Versi Node yang direkomendasikan ada di `.nvmrc`

## Dockerfile

`Dockerfile` di repo ini sudah cocok untuk image production:

- multi-stage build
- `npm ci`
- `prisma generate`
- build database sementara untuk prerender saat image build
- runtime `next start --hostname 0.0.0.0`

Untuk local production-like run, `docker compose up --build -d` aman dipakai karena tidak lagi melakukan `npm install`, `seed`, dan `build` ulang di setiap restart container.

## Kubernetes

Manifest lengkap ada di folder `k8s/`:

- `namespace.yaml`
- `configmap.yaml`
- `secret.example.yaml`
- `pvc-db.yaml`
- `pvc-uploads.yaml`
- `deployment.yaml`
- `service.yaml`
- `ingress.yaml`
- `kustomization.yaml`

Alur deploy yang direkomendasikan:

1. Build dan push image Anda sendiri dari `Dockerfile`
2. Salin `k8s/secret.example.yaml` menjadi secret riil dan ganti semua value sensitif
3. Sesuaikan host di `k8s/configmap.yaml` dan `k8s/ingress.yaml`
4. Apply manifest:

```bash
kubectl apply -k k8s
```

Catatan penting: manifest Kubernetes saat ini disiapkan untuk `SQLite`, jadi `replicas` dipertahankan `1`. Jika nanti ingin scaling horizontal, pindah ke PostgreSQL lebih tepat.

## 🎯 Objective

Membangun aplikasi web undangan lamaran (proposal engagement invitation) yang:

* Bisa dikirim sebagai **link personal ke tiap tamu**
* Memiliki **halaman admin untuk mengelola undangan**
* Mendukung **RSVP (daftar hadir)**
* Bisa **kirim undangan via WhatsApp**
* Fully customizable (warna, tema, konten, foto, section visibility)
* Memiliki **animasi pembuka amplop (envelope opening animation)**

---

## 🧠 Core Concept

Aplikasi terdiri dari 2 bagian utama:

### 1. Public Invitation Page

Halaman yang diakses oleh tamu undangan.

### 2. Admin Dashboard

Halaman untuk mengatur semua konten undangan.

---

## 🏗️ Tech Stack (Recommended)

Gunakan stack modern dan scalable:

* **Frontend**: Next.js (App Router)
* **Backend**: Next.js API routes / Node.js (Express optional)
* **Database**: PostgreSQL (atau Supabase)
* **ORM**: Prisma
* **Styling**: TailwindCSS + Framer Motion (untuk animasi)
* **Auth Admin**: JWT / NextAuth
* **Deployment**: Docker
* **WhatsApp Integration**: wa.me link generator (no official API needed initially)

---

## 📦 Core Features

### 🔓 Public Invitation Page

#### 1. Unique Guest Access

* URL format:

  ```
  /invitation/[slug]?to=GuestName
  ```
* Nama tamu tampil personal:

  > "Kepada Yth. Bapak/Ibu [GuestName]"

---

#### 2. Envelope Opening Animation (MANDATORY)

Halaman pertama:

* Tampilan amplop tertutup
* Tombol: **"Buka Undangan"**
* Saat diklik:

  * Animasi buka amplop (Framer Motion / CSS animation)
  * Transition ke konten utama

---

#### 3. Sections (Modular & Toggle-able)

Setiap section bisa ON/OFF dari admin:

* Hero (nama pasangan)
* Tanggal & waktu acara
* Lokasi (Google Maps embed)
* Galeri foto
* Story / kisah
* Countdown timer
* RSVP form
* Ucapan / guestbook

---

#### 4. RSVP (Daftar Hadir)

Form:

* Nama
* Kehadiran (Hadir / Tidak)
* Jumlah tamu
* Pesan (optional)

Data disimpan ke database.

---

#### 5. Theme & Styling

Harus dynamic dari admin:

* Primary color
* Secondary color
* Font
* Background
* Layout style (simple toggle)

---

---

## 🔐 Admin Dashboard

### 1. Authentication

* Login page sederhana
* Role: admin only

---

### 2. Guest Management

CRUD tamu:

* Nama
* Nomor WhatsApp
* Slug unik (auto-generate)

Fitur:

* Generate link undangan:

  ```
  https://domain.com/invitation/abc123?to=Fikri
  ```

---

### 3. Send WhatsApp Invitation

Generate link:

```
https://wa.me/{phone}?text={encoded_message}
```

Contoh message:

```
Halo {nama}, kami mengundang Anda ke acara lamaran kami.

Silakan buka undangan berikut:
{link}

Terima kasih 🙏
```

Admin bisa klik tombol:
👉 "Send via WhatsApp"

---

### 4. Content Management

Editable:

* Nama pasangan
* Tanggal acara
* Lokasi
* Google Maps link
* Story text
* Quotes

---

### 5. Media Upload

* Upload foto galeri
* Upload cover
* Upload background

Gunakan:

* Local storage / S3 / Supabase storage

---

### 6. Theme Customizer

Admin bisa:

* Ganti warna utama
* Ganti warna background
* Pilih font
* Preview langsung

---

### 7. Section Visibility Control

Toggle:

* Show/hide section tertentu
* Contoh:

  * Hide gallery
  * Show RSVP only

---

### 8. RSVP Dashboard

Lihat data:

* Total hadir
* Total tidak hadir
* List tamu
* Export CSV

---

---

## 🧩 Data Model (Simplified)

### Guest

```ts
{
  id: string
  name: string
  phone: string
  slug: string
}
```

### RSVP

```ts
{
  id: string
  guestName: string
  attendance: "yes" | "no"
  pax: number
  message: string
}
```

### Settings

```ts
{
  id: string
  coupleName: string
  date: string
  location: string
  mapsUrl: string
  theme: {
    primaryColor: string
    secondaryColor: string
    font: string
  }
  sections: {
    gallery: boolean
    story: boolean
    rsvp: boolean
  }
}
```

---

## 🎨 UI / UX Requirements

Referensi gaya:

* Clean & elegant
* Romantic theme
* Smooth animation
* Mobile-first (WA sharing friendly)

---

## 🎬 Animation Requirements

WAJIB:

* Envelope opening animation
* Smooth scroll antar section
* Fade-in content

Gunakan:

* Framer Motion

---

## 📱 Responsiveness

* Mobile-first (priority)
* Tablet & desktop support

---

## 🚀 Future Enhancements (Optional)

* QR Code per tamu
* Check-in system di lokasi
* Music autoplay
* Multi-theme template system
* Admin multi-event

---

## 📌 Constraints

* Jangan gunakan WhatsApp API berbayar dulu
* Fokus MVP cepat jadi
* Code harus clean & modular
* Gunakan reusable components

---

## ✅ Deliverables

* Fullstack app
* Admin dashboard
* Public invitation page
* Database schema
* Deployment-ready

---

## 🧠 Notes for AI Agent

* Prioritaskan **UX dan feel undangan**
* Animation sangat penting (first impression)
* Gunakan reusable component
* Jangan hardcode data
* Semua configurable dari admin

---

## 🔥 Extra Guidance (Very Important)

Jika harus memilih prioritas:

1. Envelope animation ✅
2. Guest link personalization ✅
3. RSVP ✅
4. WhatsApp share ✅
5. Theme customization ✅

---
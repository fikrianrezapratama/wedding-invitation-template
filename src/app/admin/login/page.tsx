import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdminLoggedIn } from "@/lib/session";

export default async function AdminLoginPage() {
  if (await isAdminLoggedIn()) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] bg-stone-900 p-8 text-stone-100 md:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-stone-400">Lamaran Dashboard</p>
          <h1 className="mt-4 max-w-xl font-cormorant text-5xl font-semibold leading-none md:text-7xl">
            Semua pengaturan undangan dalam satu panel.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-300">
            Dari halaman ini Anda bisa mengatur warna, konten, tamu, foto, toggle section, sampai
            membagikan undangan langsung ke WhatsApp.
          </p>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}


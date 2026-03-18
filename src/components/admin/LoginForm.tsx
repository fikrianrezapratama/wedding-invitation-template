"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      username: String(formData.get("username") || ""),
      password: String(formData.get("password") || "")
    };

    startTransition(async () => {
      setError("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setError("Username atau password tidak sesuai.");
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card mx-auto w-full max-w-md p-8">
      <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Admin Access</p>
      <h1 className="mt-3 text-4xl font-semibold text-stone-900 font-cormorant">
        Kelola Undangan
      </h1>
      <p className="mt-3 text-sm leading-7 text-stone-600">
        Login untuk mengatur tamu, warna, foto, section, dan memantau RSVP.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label htmlFor="username" className="field-label">
            Username
          </label>
          <input id="username" name="username" className="field-input" defaultValue="admin" />
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="field-input"
            defaultValue="lamaran123"
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <button type="submit" className="btn-primary mt-8 w-full" disabled={isPending}>
        {isPending ? "Memproses..." : "Masuk ke Dashboard"}
      </button>
    </form>
  );
}


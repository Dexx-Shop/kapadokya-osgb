"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// KAYIT OL
export async function signUpAction(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!fullName || !email || !password) {
    return { error: "Lütfen tüm zorunlu alanları eksiksiz doldurun." };
  }

  if (password.length < 6) {
    return { error: "Şifreniz en az 6 karakter olmalıdır." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

// GİRİŞ YAP
export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-posta ve şifrenizi giriniz." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "E-posta veya şifre hatalı." };
  }

  redirect("/");
}

// ÇIKIŞ YAP
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
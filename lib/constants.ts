// lib/constants.ts

// Test için geçici eşleştirme (Babanın ekranı -> eymenulugercek, Annenin ekranı -> dexxmarkett)
export const FATHER_EMAIL = "eymenulugercek@gmail.com";
export const MOTHER_EMAIL = "dexxmarkett@gmail.com";

// Şirket Kurucuları & Dokunulmaz Süper Admin E-Postaları
export const SUPER_ADMIN_EMAILS = [
  "eymenulugercek@gmail.com",
  "dexxmarkett@gmail.com",
  "drsalim74@gmail.com",
  "sldlka84@gmail.com",
];

// Bir e-postanın süper admin olup olmadığını kontrol eden yardımcı fonksiyon
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase().trim() === email.toLowerCase().trim()
  );
}
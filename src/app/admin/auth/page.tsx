// src/app/admin/auth/page.tsx
import { AuthForm } from "@/components/auth/auth-form";

export default function AdminAuthPage() {
  return (
    <div className="bg-aurora flex min-h-[calc(100dvh-12rem)] items-center justify-center px-6 py-12">
      <AuthForm 
        type="admin" 
        title="Administrator Access" 
        subtitle="Secure login for platform management."
        redirectTo="/admin/dashboard"
      />
    </div>
  );
}
// src/app/earn/auth/page.tsx
import { AuthForm } from "@/components/auth/auth-form";

export default function EarnAuthPage() {
  return (
    <div className="bg-aurora flex min-h-[calc(100dvh-12rem)] items-center justify-center px-6 py-12">
      <AuthForm 
        type="earner" 
        title="Join as an Earner" 
        subtitle="Sign in to complete tasks and track your growth."
        redirectTo="/earn/dashboard"
      />
    </div>
  );
}
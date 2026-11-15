// src/app/creator/auth/page.tsx
import { AuthForm } from "@/components/auth/auth-form";

export default function CreatorAuthPage() {
  return (
    <div className="bg-aurora flex min-h-[calc(100dvh-12rem)] items-center justify-center px-6 py-12">
      <AuthForm 
        type="creator" 
        title="Creator Studio" 
        subtitle="Sign in to manage your videos and campaigns."
        redirectTo="/creator/dashboard"
      />
    </div>
  );
}
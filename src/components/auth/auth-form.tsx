// src/components/auth/auth-form.tsx
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { login, signup } from "@/lib/auth/actions";

interface AuthFormProps {
  type: "earner" | "creator" | "admin";
  title: string;
  subtitle: string;
  redirectTo: string;
}

// 1. Inner component that uses the hook
function AuthFormContent({ type, title, subtitle, redirectTo }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  async function handleLogin(formData: FormData) {
    setIsLoading(true);
    const result = await login(formData, redirectTo);
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    }
  }

  async function handleSignup(formData: FormData) {
    setIsLoading(true);
    const result = await signup(formData, redirectTo, type === "admin" ? "earner" : type);
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg"
    >
      <div className="glass rounded-3xl p-10 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {type === "admin" ? (
          <form action={handleLogin} className="space-y-6 w-full">
            <AuthFields 
              isLoading={isLoading} 
              isSignup={false} 
              showPassword={showPassword} 
              setShowPassword={setShowPassword} 
            />
            <Button type="submit" className="w-full h-12 text-base shadow-glow" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Sign In to Admin
            </Button>
          </form>
        ) : (
          <Tabs defaultValue="login" className="w-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="login" className="text-base">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="text-base">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="w-full">
              <form action={handleLogin} className="space-y-6 w-full">
                <AuthFields 
                  isLoading={isLoading} 
                  isSignup={false} 
                  showPassword={showPassword} 
                  setShowPassword={setShowPassword} 
                />
                <Button type="submit" className="w-full h-12 text-base shadow-glow" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="w-full">
              <form action={handleSignup} className="space-y-6 w-full">
                <input type="hidden" name="ref" value={refCode} />
                <AuthFields 
                  isLoading={isLoading} 
                  isSignup={true} 
                  showPassword={showPassword} 
                  setShowPassword={setShowPassword} 
                />
                <Button type="submit" className="w-full h-12 text-base shadow-glow" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </motion.div>
  );
}

// 2. Main exported component with Suspense
export function AuthForm(props: AuthFormProps) {
  return (
    <Suspense fallback={
      <div className="w-full max-w-lg">
        <div className="glass rounded-3xl p-10 shadow-2xl flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <AuthFormContent {...props} />
    </Suspense>
  );
}

function AuthFields({ 
  isLoading, 
  isSignup, 
  showPassword, 
  setShowPassword 
}: { 
  isLoading: boolean; 
  isSignup: boolean;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
}) {
  return (
    <>
      {isSignup && (
        <div className="space-y-2 w-full">
          <Label htmlFor="display_name" className="text-sm font-medium">Display Name</Label>
          <Input
            id="display_name"
            name="display_name"
            placeholder="Your name or username"
            required
            disabled={isLoading}
            className="h-12 px-4 w-full"
          />
        </div>
      )}
      <div className="space-y-2 w-full">
        <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          disabled={isLoading}
          className="h-12 px-4 w-full"
        />
      </div>
      <div className="space-y-2 w-full">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <div className="relative w-full">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="h-12 px-4 pr-12 w-full"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </>
  );
}
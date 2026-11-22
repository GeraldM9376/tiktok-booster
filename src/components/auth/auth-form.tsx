
"use client";

import { useState, useEffect } from "react";
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

const KENYA_MESSAGE =
  "Network & IP Detected: Our systems have identified your network IP address as originating from Kenya. All earnings and transactions will be processed in Ksh (KES) for seamless local compatibility.";

function AnimatedKenyaMessage() {
  const [displayedText, setDisplayedText] = useState("");
  const [waveKey, setWaveKey] = useState(0);

  useEffect(() => {
    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeNext() {
      if (index <= KENYA_MESSAGE.length) {
        setDisplayedText(KENYA_MESSAGE.slice(0, index));
        index++;
        timeoutId = setTimeout(typeNext, 20);
      } else {
        timeoutId = setTimeout(() => {
          setDisplayedText("");
          setWaveKey((prev) => prev + 1);
        }, 3000);
      }
    }

    typeNext();

    return () => clearTimeout(timeoutId);
  }, [waveKey]);

  return (
    <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-start gap-3 text-sm text-primary">
      <div className="shrink-0 mt-0.5 flex items-end gap-0.5 h-5">
        {[0, 1, 2, 3].map((bar) => (
          <motion.div
            key={`${waveKey}-${bar}`}
            className="w-1 bg-primary rounded-sm"
            initial={{ height: 4, opacity: 0.3 }}
            animate={{
              height: [4, 8 + bar * 3, 4],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: bar * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <p className="min-h-[4rem]">
        {displayedText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
        />
      </p>
    </div>
  );
}

export function AuthForm({
  type,
  title,
  subtitle,
  redirectTo,
}: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"login" | "signup" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const refFromUrl = searchParams.get("ref") || "";

  const [refCode, setRefCode] = useState(refFromUrl);

  useEffect(() => {
    if (refFromUrl) {
      setRefCode(refFromUrl.trim().toUpperCase());
    }
  }, [refFromUrl]);

  async function handleLogin(formData: FormData) {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingAction("login");

    try {
      const result = await login(formData, redirectTo);

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        setLoadingAction(null);
      }
    } catch (error) {
      setIsLoading(false);
      setLoadingAction(null);
      throw error;
    }
  }

  async function handleSignup(formData: FormData) {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingAction("signup");

    formData.set("ref", refCode.trim().toUpperCase());

    try {
      const result = await signup(
        formData,
        redirectTo,
        type === "admin" ? "earner" : type
      );

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
        setLoadingAction(null);
      }
    } catch (error) {
      setIsLoading(false);
      setLoadingAction(null);
      throw error;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg"
    >
      <div className="glass rounded-3xl p-10 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
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
              type={type}
            />

            <Button
              type="submit"
              className="w-full h-12 text-base shadow-glow"
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              {isLoading ? "Signing in..." : "Sign In to Admin"}
            </Button>
          </form>
        ) : (
          <Tabs defaultValue="login" className="w-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="login" className="text-base" disabled={isLoading}>
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="text-base" disabled={isLoading}>
                Create Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="w-full">
              <form action={handleLogin} className="space-y-6 w-full">
                <AuthFields
                  isLoading={isLoading}
                  isSignup={false}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  type={type}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-base shadow-glow"
                  disabled={isLoading}
                >
                  {isLoading && loadingAction === "login" && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {isLoading && loadingAction === "login"
                    ? "Signing in..."
                    : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="w-full">
              <form action={handleSignup} className="space-y-6 w-full">
                <AuthFields
                  isLoading={isLoading}
                  isSignup={true}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  type={type}
                />

                <div className="space-y-2 w-full">
                  <Label htmlFor="ref" className="text-sm font-medium">
                    Referral Code (optional)
                  </Label>

                  <Input
                    id="ref"
                    name="ref"
                    placeholder="e.g. ABC123"
                    value={refCode}
                    onChange={(e) =>
                      setRefCode(e.target.value.toUpperCase())
                    }
                    disabled={isLoading}
                    className="h-12 px-4"
                  />
                </div>

                <AnimatedKenyaMessage />

                <Button
                  type="submit"
                  className="w-full h-12 text-base shadow-glow"
                  disabled={isLoading}
                >
                  {isLoading && loadingAction === "signup" && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {isLoading && loadingAction === "signup"
                    ? "Creating account..."
                    : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </motion.div>
  );
}

function AuthFields({
  isLoading,
  isSignup,
  showPassword,
  setShowPassword,
  type,
}: any) {
  return (
    <>
      {isSignup && (
        <div className="space-y-2 w-full">
          <Label htmlFor="display_name" className="text-sm font-medium">
            Display Name
          </Label>
          <Input
            id="display_name"
            name="display_name"
            placeholder="Your name or username"
            required
            disabled={isLoading}
            className="h-12 px-4"
          />
        </div>
      )}

      {isSignup && type === "earner" && (
        <div className="space-y-2 w-full">
          <Label htmlFor="phone_number" className="text-sm font-medium">
            Phone Number
          </Label>
          <Input
            id="phone_number"
            name="phone_number"
            placeholder="e.g. 0712345678"
            required
            disabled={isLoading}
            className="h-12 px-4"
          />
        </div>
      )}

      <div className="space-y-2 w-full">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          disabled={isLoading}
          className="h-12 px-4"
        />
      </div>

      <div className="space-y-2 w-full">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>

        <div className="relative w-full">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="h-12 px-4 pr-12"
          />

          <button
            type="button"
            disabled={isLoading}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

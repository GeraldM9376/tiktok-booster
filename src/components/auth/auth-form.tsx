
"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
    <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
      <div className="mt-0.5 flex h-5 shrink-0 items-end gap-0.5">
        {[0, 1, 2, 3].map((bar) => (
          <motion.div
            key={`${waveKey}-${bar}`}
            className="w-1 rounded-sm bg-primary"
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
          className="ml-0.5 inline-block h-4 w-0.5 bg-primary align-middle"
        />
      </p>
    </div>
  );
}

function SubmitButton({
  loadingText,
  children,
}: {
  loadingText: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="h-12 w-full text-base shadow-glow transition-all duration-200 active:scale-[0.97] disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

function AuthFields({
  isLoading,
  isSignup,
  showPassword,
  setShowPassword,
  type,
}: {
  isLoading: boolean;
  isSignup: boolean;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  type: "earner" | "creator" | "admin";
}) {
  return (
    <>
      {isSignup && (
        <div className="w-full space-y-2">
          <Label htmlFor="display_name">
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
        <div className="w-full space-y-2">
          <Label htmlFor="phone_number">
            Phone Number
          </Label>

          <Input
            id="phone_number"
            name="phone_number"
            type="tel"
            placeholder="e.g. 0712345678"
            required
            disabled={isLoading}
            className="h-12 px-4"
          />
        </div>
      )}

      <div className="w-full space-y-2">
        <Label htmlFor="email">
          Email address
        </Label>

        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          disabled={isLoading}
          autoComplete="email"
          className="h-12 px-4"
        />
      </div>

      <div className="w-full space-y-2">
        <Label htmlFor="password">
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
            autoComplete={
              isSignup ? "new-password" : "current-password"
            }
            className="h-12 px-4 pr-12"
          />

          <button
            type="button"
            disabled={isLoading}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
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

export function AuthForm({
  type,
  title,
  subtitle,
  redirectTo,
}: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
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

    try {
      const result = await login(formData, redirectTo);

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      }
    } catch (error) {
      // Next.js redirect errors must be allowed to propagate.
      setIsLoading(false);
      throw error;
    }
  }

  async function handleSignup(formData: FormData) {
    if (isLoading) return;

    setIsLoading(true);

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
      }
    } catch (error) {
      // Next.js redirect errors must be allowed to propagate.
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold tracking-tight">
            {title}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {type === "admin" ? (
          <form
            action={handleLogin}
            className="w-full space-y-6"
          >
            <AuthFields
              isLoading={isLoading}
              isSignup={false}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              type={type}
            />

            <SubmitButton loadingText="Signing in...">
              Sign In to Admin
            </SubmitButton>
          </form>
        ) : (
          <Tabs
            defaultValue="login"
            className="flex w-full flex-col"
          >
            <TabsList className="mb-8 grid h-12 w-full grid-cols-2">
              <TabsTrigger
                value="login"
                className="text-base"
                disabled={isLoading}
              >
                Sign In
              </TabsTrigger>

              <TabsTrigger
                value="register"
                className="text-base"
                disabled={isLoading}
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="w-full">
              <form
                action={handleLogin}
                className="w-full space-y-6"
              >
                <AuthFields
                  isLoading={isLoading}
                  isSignup={false}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  type={type}
                />

                <SubmitButton loadingText="Signing in...">
                  Sign In
                </SubmitButton>
              </form>
            </TabsContent>

            <TabsContent value="register" className="w-full">
              <form
                action={handleSignup}
                className="w-full space-y-6"
              >
                <AuthFields
                  isLoading={isLoading}
                  isSignup={true}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  type={type}
                />

                <div className="w-full space-y-2">
                  <Label htmlFor="ref">
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

                <SubmitButton loadingText="Creating account...">
                  Create Account
                </SubmitButton>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </motion.div>
  );
}

"use client";

import { Button } from "@emach/ui/components/button";
import { Checkbox } from "@emach/ui/components/checkbox";
import { Separator } from "@emach/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@emach/ui/components/tabs";
import { cn } from "@emach/ui/lib/utils";
import { maskPhone, onlyDigits } from "@emach/validators";
import { useForm } from "@tanstack/react-form";
import { motion, useReducedMotion } from "framer-motion";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "./password-input";

const TRIGGER_CLASS =
  "h-auto flex-1 whitespace-nowrap border-none px-0 py-3.5 font-semibold text-[14px] text-gray-50 hover:text-near-black data-active:text-near-black focus-visible:ring-0 focus-visible:border-transparent";

/**
 * Sanitiza o destino pós-login lido de `?redirect=`. Guarda anti-open-redirect:
 * só aceita caminho interno. Rejeita externo/protocol-relative → fallback `/dashboard`.
 */
function sanitizeRedirect(raw: string | null): string {
  if (!raw?.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/dashboard";
  }
  return raw;
}

export function LoginForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [isGooglePending, setIsGooglePending] = useState(false);
  const router = useRouter();
  const reduceMotion = useReducedMotion() ?? false;
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirect(searchParams.get("redirect"));
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      router.replace(redirectTo as Route);
    }
  }, [session, router, redirectTo]);

  const handleGoogleSignIn = async () => {
    setIsGooglePending(true);
    try {
      const result = await authClient.signIn.social({
        callbackURL: redirectTo,
        provider: "google",
      });

      if (result.error) {
        toast.error(result.error.message || result.error.statusText);
        setIsGooglePending(false);
      }
    } catch {
      toast.error("Não foi possível iniciar o login com Google.");
      setIsGooglePending(false);
    }
  };

  const signInForm = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        { email: value.email, password: value.password },
        {
          onSuccess: () => {
            router.push(redirectTo as Route);
            toast.success("Login realizado com sucesso");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("E-mail inválido"),
        password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
      }),
    },
  });

  const signUpForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
    onSubmit: async ({ value }) => {
      const payload: {
        email: string;
        password: string;
        name: string;
        phone?: string;
      } = {
        email: value.email,
        password: value.password,
        name: value.name,
      };
      const phoneDigits = onlyDigits(value.phone);
      if (phoneDigits) {
        payload.phone = phoneDigits;
      }
      await authClient.signUp.email(payload, {
        onSuccess: () => {
          toast.success("Conta criada com sucesso");
          router.push(redirectTo as Route);
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      });
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
        email: z.email("E-mail inválido"),
        password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
        phone: z
          .string()
          .refine((v) => !v || onlyDigits(v).length >= 10, "Telefone inválido"),
      }),
    },
  });

  if (isPending || session?.user) {
    return (
      <main className="flex h-svh items-center justify-center bg-near-black">
        <Loader />
      </main>
    );
  }

  const floatTransition = (duration: number, delay: number) =>
    reduceMotion
      ? undefined
      : ({
          duration,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        } as const);
  const heroFloat = reduceMotion ? undefined : { y: [0, -16, 0] };
  const satelliteFloat = reduceMotion ? undefined : { y: [0, -11, 0] };
  const glowAnimate = reduceMotion
    ? undefined
    : { scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] };
  const glowTransition = reduceMotion
    ? undefined
    : ({
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      } as const);

  return (
    <main className="grid min-h-svh grid-cols-1 lg:grid-cols-[6fr_4fr]">
      <div className="relative isolate hidden flex-col justify-between overflow-hidden bg-near-black px-20 py-20 text-white lg:flex">
        <Image
          alt=""
          aria-hidden="true"
          className="z-0 object-cover"
          fill
          priority
          sizes="60vw"
          src="/emach-login-bg.png"
        />
        <div
          aria-hidden="true"
          className="emach-bg-login-vignette pointer-events-none absolute inset-0 z-1"
        />

        <motion.div
          animate={glowAnimate}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 z-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "clamp(320px, 38vw, 620px)",
            height: "clamp(320px, 38vw, 620px)",
            background:
              "radial-gradient(circle, rgba(230,0,18,0.28) 0%, rgba(230,0,18,0.08) 42%, transparent 70%)",
            filter: "blur(48px)",
          }}
          transition={glowTransition}
        />

        <motion.div
          animate={satelliteFloat}
          aria-hidden="true"
          className="pointer-events-none absolute top-[12%] left-[4%] z-5 h-[26%] w-[36%] -rotate-12 opacity-55 blur-[2px] brightness-75 drop-shadow-[0_30px_25px_rgba(0,0,0,0.6)]"
          transition={floatTransition(7, 0.6)}
        >
          <Image
            alt=""
            className="object-contain"
            fill
            sizes="22vw"
            src="/images/hero-imagens/emach_hero_02_product.png"
            unoptimized
          />
        </motion.div>

        <motion.div
          animate={satelliteFloat}
          aria-hidden="true"
          className="pointer-events-none absolute top-[16%] right-[2%] z-5 h-[24%] w-[34%] rotate-14 opacity-50 blur-[2px] brightness-75 drop-shadow-[0_30px_25px_rgba(0,0,0,0.6)]"
          transition={floatTransition(5.5, 1.1)}
        >
          <Image
            alt=""
            className="object-contain"
            fill
            sizes="22vw"
            src="/images/hero-imagens/emach_hero_03_product.png"
            unoptimized
          />
        </motion.div>

        <motion.div
          animate={heroFloat}
          aria-hidden="true"
          className="pointer-events-none absolute top-[32%] left-1/2 z-10 h-[44%] w-[66%] -translate-x-1/2 -rotate-3 drop-shadow-[0_60px_40px_rgba(0,0,0,0.6)]"
          transition={floatTransition(6, 0)}
        >
          <Image
            alt=""
            className="object-contain"
            fill
            priority
            sizes="40vw"
            src="/images/hero-imagens/emach_hero_01_product.png"
            unoptimized
          />
        </motion.div>

        <Image
          alt="EMACH"
          className="relative z-20"
          height={37}
          priority
          src="/emach-logo.svg"
          width={200}
        />

        <div className="relative z-20">
          <h2 className="font-display font-semibold text-[clamp(34px,3.6vw,52px)] uppercase leading-[0.92] tracking-[-0.01em]">
            Ferramenta certa.
            <br />
            Trabalho <span className="text-emach-red">certo</span>.
          </h2>
          <span className="mt-4 block font-display font-semibold text-[11px] text-white/45 uppercase tracking-[0.2em]">
            EMACH Profissional
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center bg-gray-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-15 lg:py-20">
        <div className="w-full max-w-100">
          <Tabs
            className="mb-8 gap-0"
            onValueChange={(v) => setMode(v as "sign-in" | "sign-up")}
            value={mode}
          >
            <TabsList className="w-full" variant="line">
              <TabsTrigger className={TRIGGER_CLASS} value="sign-in">
                Entrar
              </TabsTrigger>
              <TabsTrigger className={TRIGGER_CLASS} value="sign-up">
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sign-in">
              <form
                className="flex flex-col gap-3.5 pt-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  signInForm.handleSubmit();
                }}
              >
                <signInForm.Field name="email">
                  {(field) => (
                    <label className="emach-field" htmlFor={field.name}>
                      <span className="emach-field__label">E-mail</span>
                      <input
                        className="emach-input"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="seu@email.com"
                        type="email"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.map((error) => (
                        <span
                          className="emach-field__error"
                          key={error?.message}
                        >
                          {error?.message}
                        </span>
                      ))}
                    </label>
                  )}
                </signInForm.Field>

                <signInForm.Field name="password">
                  {(field) => (
                    <label className="emach-field" htmlFor={field.name}>
                      <span className="emach-field__label">Senha</span>
                      <PasswordInput
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        placeholder="••••••••"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.map((error) => (
                        <span
                          className="emach-field__error"
                          key={error?.message}
                        >
                          {error?.message}
                        </span>
                      ))}
                    </label>
                  )}
                </signInForm.Field>

                <div className="flex items-center justify-between">
                  <label
                    className="flex cursor-pointer items-center gap-2 text-sm"
                    htmlFor="remember-me"
                  >
                    <Checkbox id="remember-me" />
                    Lembrar de mim
                  </label>
                  <Link
                    className="emach-ghost-btn font-semibold text-emach-red text-sm"
                    href={{ pathname: "/esqueci-senha" }}
                  >
                    Esqueci a senha
                  </Link>
                </div>

                <signInForm.Subscribe
                  selector={(state) => ({
                    canSubmit: state.canSubmit,
                    isSubmitting: state.isSubmitting,
                  })}
                >
                  {({ canSubmit, isSubmitting }) => (
                    <button
                      className={cn(
                        "mt-2 w-full cursor-pointer rounded-[2px] border-0 bg-emach-red py-3 font-semibold text-[14px] text-white transition-all duration-180",
                        canSubmit ? "opacity-100" : "opacity-65",
                      )}
                      disabled={!canSubmit || isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? "Entrando…" : "Entrar"}
                    </button>
                  )}
                </signInForm.Subscribe>
              </form>
            </TabsContent>

            <TabsContent value="sign-up">
              <form
                className="flex flex-col gap-3.5 pt-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  signUpForm.handleSubmit();
                }}
              >
                <signUpForm.Field name="name">
                  {(field) => (
                    <label className="emach-field" htmlFor={field.name}>
                      <span className="emach-field__label">Nome completo</span>
                      <input
                        className="emach-input"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="João da Silva"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.map((error) => (
                        <span
                          className="emach-field__error"
                          key={error?.message}
                        >
                          {error?.message}
                        </span>
                      ))}
                    </label>
                  )}
                </signUpForm.Field>

                <signUpForm.Field name="email">
                  {(field) => (
                    <label className="emach-field" htmlFor={field.name}>
                      <span className="emach-field__label">E-mail</span>
                      <input
                        className="emach-input"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="seu@email.com"
                        type="email"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.map((error) => (
                        <span
                          className="emach-field__error"
                          key={error?.message}
                        >
                          {error?.message}
                        </span>
                      ))}
                    </label>
                  )}
                </signUpForm.Field>

                <signUpForm.Field name="phone">
                  {(field) => (
                    <label className="emach-field" htmlFor={field.name}>
                      <span className="emach-field__label">
                        Telefone (opcional)
                      </span>
                      <input
                        className="emach-input"
                        id={field.name}
                        inputMode="numeric"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(maskPhone(e.target.value))
                        }
                        placeholder="(11) 99999-9999"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.map((error) => (
                        <span
                          className="emach-field__error"
                          key={error?.message}
                        >
                          {error?.message}
                        </span>
                      ))}
                    </label>
                  )}
                </signUpForm.Field>

                <signUpForm.Field name="password">
                  {(field) => (
                    <label className="emach-field" htmlFor={field.name}>
                      <span className="emach-field__label">Senha</span>
                      <PasswordInput
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        placeholder="••••••••"
                        value={field.state.value}
                      />
                      {field.state.meta.errors.map((error) => (
                        <span
                          className="emach-field__error"
                          key={error?.message}
                        >
                          {error?.message}
                        </span>
                      ))}
                    </label>
                  )}
                </signUpForm.Field>

                <signUpForm.Subscribe
                  selector={(state) => ({
                    canSubmit: state.canSubmit,
                    isSubmitting: state.isSubmitting,
                  })}
                >
                  {({ canSubmit, isSubmitting }) => (
                    <button
                      className={cn(
                        "mt-2 w-full cursor-pointer rounded-[2px] border-0 bg-emach-red py-3 font-semibold text-[14px] text-white transition-all duration-180",
                        canSubmit ? "opacity-100" : "opacity-65",
                      )}
                      disabled={!canSubmit || isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? "Criando conta…" : "Criar conta"}
                    </button>
                  )}
                </signUpForm.Subscribe>
              </form>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3 text-[12px] text-gray-50">
            <Separator className="flex-1" />
            ou
            <Separator className="flex-1" />
          </div>

          {/* Social login */}
          <div className="flex flex-col gap-2">
            <Button
              className="h-12 w-full"
              disabled={isGooglePending}
              onClick={handleGoogleSignIn}
              type="button"
              variant="outline"
            >
              <Image
                alt=""
                height={18}
                src="/images/logos/google.png"
                width={18}
              />
              {isGooglePending ? "Redirecionando..." : "Continuar com Google"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

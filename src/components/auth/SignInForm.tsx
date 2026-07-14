"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

import { AuthField } from "@/components/auth/AuthField";
import { AuthOtpField } from "@/components/auth/AuthOtpField";
import { Button } from "@/components/ui/button";
import { createNavigateAfterAuth } from "@/lib/auth/navigate-after-auth";
import { useTranslation } from "@/lib/i18n/LanguageContext";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function SignInForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signIn, errors, fetchStatus } = useSignIn();
  const navigate = createNavigateAfterAuth("/dashboard", router);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const loading = fetchStatus === "fetching";
  const showOtp =
    otpSent &&
    (signIn.status === "needs_client_trust" ||
      signIn.status === "needs_second_factor");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let ok = true;
    if (!email.trim()) {
      setEmailError(t("auth.emailRequired"));
      ok = false;
    } else if (!isValidEmail(email)) {
      setEmailError(t("auth.emailInvalid"));
      ok = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError(t("auth.passwordRequired"));
      ok = false;
    } else {
      setPasswordError(null);
    }

    if (!ok) return;

    try {
      const { error } = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (error) {
        setEmailError(null);
        setPasswordError(null);
        setFormError(t("auth.invalidCredentials"));
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({ navigate });
        return;
      }

      if (
        signIn.status === "needs_client_trust" ||
        signIn.status === "needs_second_factor"
      ) {
        const emailFactor = signIn.supportedSecondFactors?.find(
          (factor) => factor.strategy === "email_code",
        );
        if (emailFactor) {
          const { error: mfaError } = await signIn.mfa.sendEmailCode();
          if (mfaError) {
            setFormError(mfaError.message || t("auth.resendFailed"));
            return;
          }
          setCode("");
          setCodeError(null);
          setResent(false);
          setOtpSent(true);
          return;
        }
        setFormError(t("auth.secondFactorRequired"));
        return;
      }

      setFormError(t("auth.signInIncomplete"));
    } catch {
      setFormError(t("auth.invalidCredentials"));
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (code.trim().length < 6) {
      setCodeError(t("auth.codeRequired"));
      return;
    }
    setCodeError(null);

    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
      if (error) {
        setCodeError(
          errors.fields.code?.message ||
            error.message ||
            t("auth.verifyFailed"),
        );
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({ navigate });
        return;
      }

      setFormError(t("auth.verifyIncomplete"));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("auth.verifyFailed"),
      );
    }
  };

  const onResend = async () => {
    setResent(false);
    setFormError(null);
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) {
      setFormError(error.message || t("auth.resendFailed"));
      return;
    }
    setResent(true);
  };

  const onReset = () => {
    signIn.reset();
    setCode("");
    setCodeError(null);
    setFormError(null);
    setResent(false);
    setOtpSent(false);
  };

  if (showOtp) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-body-sm text-on-surface-variant">
          {t("auth.codeSentTo")}{" "}
          <span className="text-on-surface">{email.trim()}</span>
        </p>
        <form onSubmit={onVerify} className="flex flex-col gap-4">
          <AuthOtpField
            id="sign-in-code"
            label={t("auth.verificationCode")}
            value={code}
            onChange={(v) => {
              setCode(v);
              if (codeError) setCodeError(null);
            }}
            disabled={loading}
            error={codeError}
          />
          {formError ? (
            <p className="text-center text-body-sm text-error" role="alert">
              {formError}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={loading || code.trim().length < 6}
            className="h-10 w-full rounded-lg text-body-md font-semibold"
          >
            {loading ? t("auth.verifying") : t("auth.verify")}
          </Button>
        </form>
        <Button
          type="button"
          variant="ghost"
          disabled={loading || resent}
          onClick={onResend}
          className="h-9 w-full rounded-lg text-body-sm"
        >
          {resent ? t("auth.codeSent") : t("auth.resendCode")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={onReset}
          className="h-9 w-full rounded-lg text-body-sm"
        >
          {t("auth.startOver")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField
          id="sign-in-email"
          label={t("auth.email")}
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            if (emailError) setEmailError(null);
          }}
          placeholder={t("auth.emailPlaceholder")}
          autoComplete="email"
          disabled={loading}
          error={emailError}
        />
        <AuthField
          id="sign-in-password"
          label={t("auth.password")}
          type="password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (passwordError) setPasswordError(null);
          }}
          placeholder={t("auth.passwordPlaceholder")}
          autoComplete="current-password"
          disabled={loading}
          error={passwordError}
        />
        {formError ? (
          <p className="text-center text-body-sm text-error" role="alert">
            {formError}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={loading}
          className="h-10 w-full rounded-lg text-body-md font-semibold"
        >
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
      </form>
      <p className="text-center text-body-sm">
        <Link
          href="/forgot-password"
          className="font-semibold text-primary hover:underline"
        >
          {t("auth.forgotPassword")}
        </Link>
      </p>
    </div>
  );
}

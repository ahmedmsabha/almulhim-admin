"use client";

import { useEffect, useState } from "react";
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

export function ForgotPasswordForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [resent, setResent] = useState(false);

  const loading = fetchStatus === "fetching";
  const needsNewPassword = signIn.status === "needs_new_password";
  const needsMfa =
    signIn.status === "needs_second_factor" ||
    signIn.status === "needs_client_trust";
  const navigate = createNavigateAfterAuth("/dashboard", router);

  const clearLocalState = () => {
    setEmail("");
    setCode("");
    setPassword("");
    setConfirm("");
    setEmailError(null);
    setCodeError(null);
    setPasswordError(null);
    setConfirmError(null);
    setFormError(null);
    setCodeSent(false);
    setResent(false);
  };

  useEffect(() => {
    signIn.reset();
    clearLocalState();
    // Fresh attempt whenever this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const backToSignIn = () => {
    signIn.reset();
    clearLocalState();
    router.push("/login");
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setEmailError(t("auth.emailRequired"));
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError(t("auth.emailInvalid"));
      return;
    }
    setEmailError(null);

    try {
      const { error: createError } = await signIn.create({
        identifier: email.trim(),
      });
      if (createError) {
        setFormError(
          errors.fields.identifier?.message ||
            createError.message ||
            t("auth.resetSendFailed"),
        );
        return;
      }

      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setFormError(sendError.message || t("auth.resetSendFailed"));
        return;
      }

      setCodeSent(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("auth.resetSendFailed"),
      );
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (code.trim().length < 6) {
      setCodeError(t("auth.codeRequired"));
      return;
    }
    setCodeError(null);

    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });
      if (error) {
        setCodeError(
          errors.fields.code?.message ||
            error.message ||
            t("auth.verifyFailed"),
        );
        return;
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("auth.verifyFailed"),
      );
    }
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let ok = true;
    if (!password) {
      setPasswordError(t("auth.passwordRequired"));
      ok = false;
    } else if (password.length < 8) {
      setPasswordError(t("auth.passwordTooShort"));
      ok = false;
    } else {
      setPasswordError(null);
    }

    if (!confirm) {
      setConfirmError(t("auth.confirmRequired"));
      ok = false;
    } else if (confirm !== password) {
      setConfirmError(t("auth.passwordsMismatch"));
      ok = false;
    } else {
      setConfirmError(null);
    }

    if (!ok) return;

    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      });
      if (error) {
        setPasswordError(errors.fields.password?.message ?? null);
        setFormError(
          errors.fields.password?.message ||
            error.message ||
            t("auth.resetFailed"),
        );
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({ navigate });
        return;
      }

      if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_client_trust"
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
          return;
        }
        setFormError(t("auth.secondFactorRequired"));
        return;
      }

      setFormError(t("auth.resetIncomplete"));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("auth.resetFailed"),
      );
    }
  };

  const verifyMfa = async (e: React.FormEvent) => {
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

  const resendMfa = async () => {
    setResent(false);
    setFormError(null);
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) {
      setFormError(error.message || t("auth.resendFailed"));
      return;
    }
    setResent(true);
  };

  const backLink = (
    <p className="text-center text-body-sm text-on-surface-variant">
      <button
        type="button"
        onClick={backToSignIn}
        className="font-semibold text-primary hover:underline"
      >
        {t("auth.backToSignIn")}
      </button>
    </p>
  );

  if (needsNewPassword) {
    return (
      <div className="flex flex-col gap-4">
        <form onSubmit={submitNewPassword} className="flex flex-col gap-4">
          <AuthField
            id="forgot-new-password"
            label={t("auth.newPassword")}
            type="password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (passwordError) setPasswordError(null);
            }}
            placeholder={t("auth.newPasswordPlaceholder")}
            autoComplete="new-password"
            disabled={loading}
            error={passwordError}
          />
          <AuthField
            id="forgot-confirm-password"
            label={t("auth.confirmPassword")}
            type="password"
            value={confirm}
            onChange={(v) => {
              setConfirm(v);
              if (confirmError) setConfirmError(null);
            }}
            placeholder={t("auth.confirmPasswordPlaceholder")}
            autoComplete="new-password"
            disabled={loading}
            error={confirmError}
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
            {loading ? t("auth.resettingPassword") : t("auth.resetPassword")}
          </Button>
        </form>
        {backLink}
      </div>
    );
  }

  if (needsMfa) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-body-sm text-on-surface-variant">
          {t("auth.codeSentTo")}{" "}
          <span className="text-on-surface">{email.trim()}</span>
        </p>
        <form onSubmit={verifyMfa} className="flex flex-col gap-4">
          <AuthOtpField
            id="forgot-mfa-code"
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
          onClick={resendMfa}
          className="h-9 w-full rounded-lg text-body-sm"
        >
          {resent ? t("auth.codeSent") : t("auth.resendCode")}
        </Button>
        {backLink}
      </div>
    );
  }

  if (codeSent) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-body-sm text-on-surface-variant">
          {t("auth.resetCodeSentTo")}{" "}
          <span className="text-on-surface">{email.trim()}</span>
        </p>
        <form onSubmit={verifyCode} className="flex flex-col gap-4">
          <AuthOtpField
            id="forgot-code"
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
        {backLink}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={sendCode} className="flex flex-col gap-4">
        <AuthField
          id="forgot-email"
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
          {loading ? t("auth.sendingResetCode") : t("auth.sendResetCode")}
        </Button>
      </form>
      {backLink}
    </div>
  );
}

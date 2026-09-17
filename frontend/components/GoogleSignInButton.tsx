"use client";

import { useEffect, useState } from "react";
import { googleAuth } from "../lib/api";
import type { AuthResponse } from "../lib/types";

interface GoogleSignInButtonProps {
  onSuccess: (data: AuthResponse) => void;
  onError: (msg: string) => void;
  buttonText?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  buttonText = "Sign in with Google",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Suppress Google Identity Services (GSI) FedCM internal abort error overlay in Next.js dev mode
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const msg = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
      if (
        msg.includes("[GSI_LOGGER]") ||
        msg.includes("FedCM") ||
        msg.includes("credentials.get") ||
        msg.includes("NotAllowedError")
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reasonMsg = String(event.reason?.message || event.reason || "");
      if (
        reasonMsg.includes("signal is aborted") ||
        reasonMsg.includes("FedCM") ||
        reasonMsg.includes("credentials.get") ||
        reasonMsg.includes("NotAllowedError") ||
        event.reason?.name === "AbortError" ||
        event.reason?.name === "NotAllowedError"
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    if (clientId) {
      const scriptId = "google-gsi-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement;

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogleSignIn();
        document.body.appendChild(script);
      } else if (window.google) {
        initGoogleSignIn();
      }
    }

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [clientId]);

  const initGoogleSignIn = () => {
    if (!window.google || !clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        use_fedcm_for_prompt: false,
        auto_select: false,
      });
    } catch {
      // Ignore Google GSI initialization logger warnings on local dev environments
    }
  };

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      onError("Google Authentication failed. Missing credential token.");
      return;
    }

    setLoading(true);
    try {
      const authData = await googleAuth({ token: response.credential });
      onSuccess(authData);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (clientId && window.google) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification && typeof notification.isNotDisplayed === "function" && notification.isNotDisplayed()) {
            onError("Google Sign-In popup was blocked or closed. Please try again or use Email Sign In.");
          }
        });
      } catch {
        onError("Google Sign-In requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be configured. Please use Email Sign In below.");
      }
    } else {
      // Demo / Fallback notice if Google Client ID is not configured
      onError("Google Sign-In requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be configured in your environment variables. Please use Email Sign In below.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{loading ? "Signing in..." : buttonText}</span>
    </button>
  );
}

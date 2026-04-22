import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { consumeGoogleAuthCallback } from "../services/googleAuth";

export default function LoginSuccess() {
  const [status, setStatus] = useState("Logging you in...");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const result = consumeGoogleAuthCallback();
    const token = result.token || localStorage.getItem("rumi_token");

    if (!result.handled) {
      navigate("/", { replace: true });
      return;
    }

    if (result.error && !token) {
      setError("Google login failed");
      setStatus("We could not finish signing you in.");
      return;
    }

    setStatus("Google account linked. Redirecting to your dashboard...");

    const timer = window.setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-950">Logging you in...</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{status}</p>
        {error && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={16} />
          Secure Google sign-in
        </div>
      </div>
    </div>
  );
}

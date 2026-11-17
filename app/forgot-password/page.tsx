"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Hash, Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicApi } from "@/lib/api";

type Step = "verify" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("verify");
  const [phone, setPhone] = useState("");
  const [secret, setSecret] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleVerify = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await publicApi.post("/verify_secret", {
        phone: phone.trim(),
        secret_number: secret.trim(),
      });
      setStep("reset");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Phone number or secret number is incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await publicApi.post("/reset_password", {
        phone: phone.trim(),
        password: newPassword,
      });
      setStep("done");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/">
              <span className="text-3xl font-extrabold text-[#6C78DF]">Aarambd</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-3">Reset Password</h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === "verify"
                ? "Enter your phone and secret number to continue"
                : step === "reset"
                ? "Create your new password"
                : "Password reset complete"}
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-8">
            {(["verify", "reset", "done"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition ${
                    step === s
                      ? "bg-[#6C78DF] text-white"
                      : (step === "reset" && s === "verify") ||
                        step === "done"
                      ? "bg-green-100 text-[#6C78DF]"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {(step === "reset" && s === "verify") || step === "done" ? (
                    <CheckCircle size={14} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs ${
                    step === s ? "text-[#30337A] font-medium" : "text-gray-400"
                  }`}
                >
                  {s === "verify" ? "Verify" : s === "reset" ? "New Password" : "Done"}
                </span>
                {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Step 1 — Verify */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="secret">Secret Number</Label>
                <div className="relative">
                  <Hash
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="secret"
                    type="number"
                    placeholder="Your secret number set during registration"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#6C78DF] hover:bg-[#5A64D4] text-white font-semibold rounded-xl"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify Identity"}
              </Button>
            </form>
          )}

          {/* Step 2 — New password */}
          {step === "reset" && (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="new_password"
                    type={showPw ? "text" : "password"}
                    placeholder="Min 8 chars, upper+lower+number+symbol"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    id="confirm_password"
                    type={showPw ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Use at least 8 characters with uppercase, lowercase, number, and special character.
              </p>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#6C78DF] hover:bg-[#5A64D4] text-white font-semibold rounded-xl"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          {/* Step 3 — Done */}
          {step === "done" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#6C78DF]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Password Reset Successfully!
              </h2>
              <p className="text-sm text-gray-500">Redirecting you to login…</p>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-[#6C78DF] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

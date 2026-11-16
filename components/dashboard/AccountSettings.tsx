"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

interface Props {
  userId: string;
  initialEmail: string;
  phone: string;
  initialCallStatus: number;
}

export default function AccountSettings({ userId, initialEmail, phone, initialCallStatus }: Props) {
  // Call visibility
  const [callStatus, setCallStatus] = useState(initialCallStatus === 1);
  const [togglingCall, setTogglingCall] = useState(false);

  const handleCallToggle = async () => {
    setTogglingCall(true);
    const newStatus = callStatus ? "0" : "1";
    try {
      await api.post("/call_status_update", { user_id: userId, status: newStatus });
      setCallStatus(!callStatus);
    } catch {
      /* silent */
    } finally {
      setTogglingCall(false);
    }
  };

  // Email
  const [email, setEmail] = useState(initialEmail);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Change password
  const [pwMode, setPwMode] = useState<"password" | "secret">("password");
  const [pwForm, setPwForm] = useState({
    current_password: "",
    secret_number: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  const setPw = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPwForm((f) => ({ ...f, [k]: e.target.value }));

  // Change secret
  const [secretForm, setSecretForm] = useState({ password: "", new_secret: "" });
  const [savingSecret, setSavingSecret] = useState(false);
  const [secretSuccess, setSecretSuccess] = useState(false);
  const [secretError, setSecretError] = useState("");

  const setSecret = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSecretForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSaveEmail = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSavingEmail(true);
    setEmailError("");
    setEmailSuccess(false);
    try {
      await api.put("/account_settings", { user_id: userId, email });
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err: unknown) {
      setEmailError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          "Failed to update email."
      );
    } finally {
      setSavingEmail(false);
    }
  };

  const handleChangePassword = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError("New passwords do not match.");
      return;
    }

    setSavingPw(true);
    try {
      const payload: Record<string, string> = {
        user_id: userId,
        new_password: pwForm.new_password,
        confirm_password: pwForm.confirm_password,
      };
      if (pwMode === "password") {
        payload.current_password = pwForm.current_password;
      } else {
        payload.secret_number = pwForm.secret_number;
      }
      await api.post("/change_password", payload);
      setPwSuccess(true);
      setPwForm({ current_password: "", secret_number: "", new_password: "", confirm_password: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: unknown) {
      setPwError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          "Failed to change password."
      );
    } finally {
      setSavingPw(false);
    }
  };

  const handleChangeSecret = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSecretError("");
    setSecretSuccess(false);

    if (!secretForm.new_secret.trim()) {
      setSecretError("New secret number is required.");
      return;
    }

    setSavingSecret(true);
    try {
      await api.post("/change_secret", {
        user_id: userId,
        password: secretForm.password,
        new_secret: secretForm.new_secret,
      });
      setSecretSuccess(true);
      setSecretForm({ password: "", new_secret: "" });
      setTimeout(() => setSecretSuccess(false), 3000);
    } catch (err: unknown) {
      setSecretError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          "Failed to change secret number."
      );
    } finally {
      setSavingSecret(false);
    }
  };

  return (
    <div className="max-w-lg space-y-10">
      {/* Phone (read-only) */}
      <div className="space-y-1.5">
        <Label>Phone Number</Label>
        <Input value={phone} readOnly className="bg-gray-50 text-gray-500 cursor-not-allowed" />
        <p className="text-xs text-gray-400">Phone number cannot be changed.</p>
      </div>

      <Separator />

      {/* Call visibility */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Show Phone Number</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {callStatus ? "Your phone number is visible on your profile." : "Your phone number is hidden from visitors."}
          </p>
        </div>
        <button
          onClick={handleCallToggle}
          disabled={togglingCall}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
            callStatus ? "bg-green-500" : "bg-gray-300"
          } ${togglingCall ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              callStatus ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <Separator />

      {/* Email */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Email Address</h3>

        {emailError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {emailError}
          </div>
        )}
        {emailSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-[#30337A] text-sm rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle size={16} /> Email updated
          </div>
        )}

        <form onSubmit={handleSaveEmail} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <Button type="submit" disabled={savingEmail} className="bg-[#6C78DF] hover:bg-[#5A64D4] text-white gap-2">
            {savingEmail ? <Loader2 size={14} className="animate-spin" /> : null}
            Update Email
          </Button>
        </form>
      </div>

      <Separator />

      {/* Change Password */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>

        {/* Verification mode toggle */}
        <div className="flex rounded-xl border border-gray-200 p-1 mb-5 bg-gray-50">
          <button
            type="button"
            onClick={() => { setPwMode("password"); setPwError(""); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pwMode === "password" ? "bg-white shadow text-[#30337A]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Verify with Password
          </button>
          <button
            type="button"
            onClick={() => { setPwMode("secret"); setPwError(""); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              pwMode === "secret" ? "bg-white shadow text-[#30337A]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Verify with Secret Code
          </button>
        </div>

        {pwError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {pwError}
          </div>
        )}
        {pwSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-[#30337A] text-sm rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle size={16} /> Password changed successfully
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwMode === "password" ? (
            <div className="space-y-1.5">
              <Label htmlFor="current_password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showPw ? "text" : "password"}
                  value={pwForm.current_password}
                  onChange={setPw("current_password")}
                  placeholder="••••••••"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="secret_number">Secret Code</Label>
              <Input
                id="secret_number"
                type="number"
                value={pwForm.secret_number}
                onChange={setPw("secret_number")}
                placeholder="Your secret number"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPw ? "text" : "password"}
                value={pwForm.new_password}
                onChange={setPw("new_password")}
                placeholder="••••••••"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type={showPw ? "text" : "password"}
              value={pwForm.confirm_password}
              onChange={setPw("confirm_password")}
              placeholder="••••••••"
              required
            />
          </div>

          <p className="text-xs text-gray-400">At least 6 characters.</p>
          <Button type="submit" disabled={savingPw} className="bg-[#6C78DF] hover:bg-[#5A64D4] text-white gap-2">
            {savingPw ? <Loader2 size={14} className="animate-spin" /> : null}
            Change Password
          </Button>
        </form>
      </div>

      <Separator />

      {/* Change Secret Number */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Change Secret Code</h3>
        <p className="text-xs text-gray-400 mb-4">Verify with your current password to update your secret code.</p>

        {secretError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {secretError}
          </div>
        )}
        {secretSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-[#30337A] text-sm rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle size={16} /> Secret code changed successfully
          </div>
        )}

        <form onSubmit={handleChangeSecret} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="secret_password">Current Password</Label>
            <Input
              id="secret_password"
              type="password"
              value={secretForm.password}
              onChange={setSecret("password")}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_secret">New Secret Code</Label>
            <Input
              id="new_secret"
              type="number"
              value={secretForm.new_secret}
              onChange={setSecret("new_secret")}
              placeholder="A number you'll remember"
              required
            />
          </div>
          <Button type="submit" disabled={savingSecret} className="bg-[#6C78DF] hover:bg-[#5A64D4] text-white gap-2">
            {savingSecret ? <Loader2 size={14} className="animate-spin" /> : null}
            Change Secret Code
          </Button>
        </form>
      </div>
    </div>
  );
}

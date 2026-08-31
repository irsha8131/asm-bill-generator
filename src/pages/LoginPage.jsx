import { useState } from "react";
import asmLogo from "../assets/asm-logo.jpeg";
import { supabase } from "../utils/supabase";

export default function LoginPage({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
        });

        if (error) throw error;

        if (data?.session) {
          if (onLoginSuccess) onLoginSuccess(data.user);
        } else {
          setSuccessMsg("Account created! Please check your email to confirm, or sign in.");
          setIsSignUp(false);
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) throw error;

        if (onLoginSuccess) onLoginSuccess(data.user);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setErrorMsg(error?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F5F2EA] px-4 py-12 sm:px-6 lg:px-8 text-[#1E2A38]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* BRAND LOGO & TITLE */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[4px] border border-[#3A4A5E] bg-black shadow-md">
            <img
              src={asmLogo}
              alt="ASM Interiors"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <h2 className="mt-4 text-center font-serif text-[26px] sm:text-[30px] font-bold tracking-tight text-[#1E2A38]">
          ASM Interiors
        </h2>

        <p className="mt-1 text-center text-[12px] font-semibold tracking-[0.14em] text-[#9C6B30] uppercase">
          Quotation &amp; Billing System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-[4px] border border-[#D9D3C3] bg-white p-6 sm:p-9 shadow-sm">
          {/* TOGGLE TAB */}
          <div className="mb-6 flex rounded-[3px] border border-[#D9D3C3] bg-[#FAF8F2] p-1">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-[12.5px] font-semibold transition-colors rounded-[2px] ${
                !isSignUp
                  ? "bg-[#1E2A38] text-white shadow-xs"
                  : "text-[#6B6558] hover:text-[#1E2A38]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-[12.5px] font-semibold transition-colors rounded-[2px] ${
                isSignUp
                  ? "bg-[#1E2A38] text-white shadow-xs"
                  : "text-[#6B6558] hover:text-[#1E2A38]"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ALERTS */}
          {errorMsg && (
            <div className="mb-5 rounded-[3px] border border-[#EAC1BA] bg-[#FDF2F0] p-3 text-[12.5px] font-medium text-[#B24A3C]">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 rounded-[3px] border border-[#CFE0D2] bg-[#F2F7F3] p-3 text-[12.5px] font-medium text-[#3F6B4A]">
              {successMsg}
            </div>
          )}

          {/* AUTH FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-[12.5px] font-semibold text-[#5B5647]"
              >
                Email Address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@asminteriors.com"
                  className="h-[46px] sm:h-[48px] w-full rounded-[3px] border border-[#D9D3C3] bg-white px-3.5 text-[14.5px] text-[#1E2A38] placeholder:text-[#B3AC98] outline-none transition-colors duration-150 focus:border-[#9C6B30] focus:ring-1 focus:ring-[#9C6B30]/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[12.5px] font-semibold text-[#5B5647]"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-[46px] sm:h-[48px] w-full rounded-[3px] border border-[#D9D3C3] bg-white pl-3.5 pr-11 text-[14.5px] text-[#1E2A38] placeholder:text-[#B3AC98] outline-none transition-colors duration-150 focus:border-[#9C6B30] focus:ring-1 focus:ring-[#9C6B30]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8371] hover:text-[#1E2A38]"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  h-[48px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-[3px]
                  bg-[#1E2A38]
                  px-4
                  text-[14px]
                  font-semibold
                  text-white
                  transition-colors
                  duration-150
                  hover:bg-[#0F1926]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>{isSignUp ? "Create Account" : "Sign In"}</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-[#EDE8DA] pt-4 text-center">
            <p className="text-[11px] text-[#8A8371]">
              Protected with encrypted Supabase authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
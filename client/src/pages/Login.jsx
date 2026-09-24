
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      const role = response.data.user.role;

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "engineer") {
        navigate("/engineer");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error?.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-8 text-gray-900">
      {/* =====================================================
          ANIMATED BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Indigo glow */}

        <div className="absolute -left-32 -top-32 h-80 w-80 animate-pulse rounded-full bg-indigo-200/40 blur-3xl" />

        {/* Violet glow */}

        <div
          className="absolute -right-32 top-10 h-96 w-96 animate-pulse rounded-full bg-violet-200/35 blur-3xl"
          style={{ animationDelay: "1s" }}
        />

        {/* Cyan glow */}

        <div
          className="absolute bottom-[-150px] left-1/3 h-80 w-80 animate-pulse rounded-full bg-cyan-200/30 blur-3xl"
          style={{ animationDelay: "2s" }}
        />

        {/* Small floating dots */}

        <div className="absolute left-[15%] top-[25%] h-2 w-2 animate-bounce rounded-full bg-indigo-400/50" />

        <div
          className="absolute right-[20%] top-[35%] h-2 w-2 animate-bounce rounded-full bg-violet-400/50"
          style={{ animationDelay: "0.7s" }}
        />

        <div
          className="absolute bottom-[25%] left-[20%] h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400/50"
          style={{ animationDelay: "1.2s" }}
        />
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md">
          {/* =================================================
              BRAND
          ================================================= */}

          <div className="mb-8 text-center">
            <div className="group mx-auto mb-5 flex h-16 w-16 cursor-default items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 text-2xl text-white shadow-xl shadow-indigo-200 transition-all duration-500 hover:rotate-6 hover:scale-110 hover:shadow-2xl hover:shadow-indigo-300">
              ✦
            </div>

            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              AI Support
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
                {" "}
                Platform
              </span>
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Intelligent support. Faster resolutions.
            </p>
          </div>

          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white/85 p-6 shadow-2xl shadow-gray-200/70 backdrop-blur-xl transition-all duration-500 hover:shadow-indigo-100/80 sm:p-8">
            {/* Top gradient line */}

            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />

            {/* Hover glow */}

            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-100/50 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative">
              {/* Heading */}

              <div className="mb-7">
                <h2 className="text-2xl font-black text-gray-900">
                  Welcome back
                </h2>

                <p className="mt-1.5 text-sm text-gray-500">
                  Sign in to continue to your support workspace.
                </p>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                  <span className="mt-0.5">⚠️</span>

                  <p>{error}</p>
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600"
                  >
                    Email Address
                  </label>

                  <div className="group/input relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within/input:text-indigo-600">
                      ✉
                    </span>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold uppercase tracking-wider text-gray-600"
                    >
                      Password
                    </label>
                  </div>

                  <div className="group/input relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within/input:text-indigo-600">
                      🔒
                    </span>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* =================================================
                    LOGIN BUTTON
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group/button relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_100%] py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-500 hover:-translate-y-0.5 hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-indigo-300 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {/* Shine */}

                  {!loading && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/button:translate-x-full" />
                  )}

                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>

                      <span className="transition-transform duration-300 group-hover/button:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* =================================================
                  REGISTER
              ================================================= */}

              <div className="mt-7 border-t border-gray-100 pt-6 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?
                </p>

                <Link
                  to="/register"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-indigo-600 transition-all duration-200 hover:text-violet-600"
                >
                  Create an account
                  <span className="transition-transform duration-200 hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-[11px] text-gray-400 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Secure support workspace
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;


import {
  type FormEvent,
  useState,
} from "react";

import axios from "axios";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  Eye,
  EyeOff,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import apiClient from "../../api/client";

import type {
  RegisterPayload,
  User,
} from "../../types/auth";


function Register() {
  const navigate =
    useNavigate();

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  async function handleSubmit(
    event:
      FormEvent<
        HTMLFormElement
      >,
  ) {
    event.preventDefault();

    setError("");

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );

      return;
    }

    if (
      password.length < 6
    ) {
      setError(
        "Password must contain at least 6 characters.",
      );

      return;
    }

    setLoading(true);

    try {
      const payload:
        RegisterPayload = {
        name:
          name.trim(),

        email:
          email.trim(),

        password,
      };

      await apiClient.post<User>(
        "/auth/register",
        payload,
      );

      navigate(
        "/",
        {
          state: {
            registrationSuccess:
              true,

            registeredEmail:
              email.trim(),
          },
        },
      );
    } catch (
      requestError
    ) {
      if (
        axios.isAxiosError(
          requestError,
        )
      ) {
        setError(
          requestError.response
            ?.data?.message ||
            requestError.response
              ?.data?.detail ||
            "Unable to create account.",
        );
      } else {
        setError(
          "An unexpected error occurred.",
        );
      }
    } finally {
      setLoading(false);
    }
  }


  const features = [
    {
      title:
        "Automated profiling",
      description:
        "Understand your data structure and patterns.",
      icon: Sparkles,
      iconClass:
        "bg-blue-500/15 text-blue-300",
    },

    {
      title:
        "Data quality analysis",
      description:
        "Detect issues and improve dataset reliability.",
      icon: ShieldCheck,
      iconClass:
        "bg-amber-500/15 text-amber-300",
    },

    {
      title:
        "AI reports & chat",
      description:
        "Get AI-powered insights and answers instantly.",
      icon: MessageSquareText,
      iconClass:
        "bg-violet-500/15 text-violet-300",
    },

    {
      title:
        "Dashboard generation",
      description:
        "Create interactive BI-style dashboards in minutes.",
      icon: LayoutDashboard,
      iconClass:
        "bg-emerald-500/15 text-emerald-300",
    },
  ];


  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">

        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden border-r border-slate-800/80 bg-[#0f1a31] lg:flex lg:flex-col">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

            <div className="absolute right-10 top-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-[120px]" />

            <div
              className="absolute bottom-0 left-0 h-[300px] w-full opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #60a5fa 1px, transparent 1px)",

                backgroundSize:
                  "22px 22px",
              }}
            />
          </div>


          {/* Brand */}
          <div className="relative z-10 px-10 pt-10 xl:px-12">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-950/40">
                <BarChart3
                  size={23}
                />
              </div>

              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  DataPilot AI
                </h1>

                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                  AI Data Analyst
                </p>
              </div>
            </div>
          </div>


          {/* Marketing */}
          <div className="relative z-10 flex flex-1 flex-col justify-center px-10 pb-8 pt-8 xl:px-12">
            <div className="grid items-center gap-8 xl:grid-cols-[0.95fr_1.05fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5">
                  <Sparkles
                    size={13}
                    className="text-blue-300"
                  />

                  <span className="text-xs font-medium text-blue-300">
                    Autonomous data intelligence
                  </span>
                </div>


                <h2 className="mt-7 text-[42px] font-semibold leading-[1.15] tracking-tight text-white xl:text-[46px]">
                  Build smarter
                  <br />

                  with{" "}
                  <span className="text-blue-500">
                    your data.
                  </span>
                </h2>


                <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                  Create your workspace and transform
                  raw datasets into quality analysis,
                  AI insights and interactive dashboards.
                </p>
              </div>


              {/* Illustration */}
              <div className="relative hidden min-h-[330px] xl:block">
                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[70px]" />

                <div className="absolute left-1/2 top-1/2 w-[285px] -translate-x-1/2 -translate-y-1/2 rotate-[4deg] rounded-[26px] border border-blue-400/25 bg-[#13213c]/90 p-5 shadow-2xl shadow-blue-950/50">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-500" />

                    <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />

                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  </div>


                  <div className="mt-6 grid grid-cols-[1.3fr_0.7fr] gap-4">
                    <div className="rounded-xl border border-slate-700/60 bg-slate-950/30 p-4">
                      <div className="flex h-28 items-end gap-2">
                        {[
                          36,
                          55,
                          75,
                          48,
                          88,
                        ].map(
                          (
                            value,
                            index,
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="flex-1 rounded-t-md bg-blue-500"
                              style={{
                                height:
                                  `${value}%`,
                              }}
                            />
                          ),
                        )}
                      </div>
                    </div>


                    <div className="flex items-center justify-center rounded-xl border border-slate-700/60 bg-slate-950/30">
                      <div className="h-20 w-20 rounded-full border-[15px] border-blue-500 border-r-violet-500" />
                    </div>
                  </div>


                  <div className="mt-4 grid grid-cols-[0.8fr_1.2fr] gap-4">
                    <div className="flex items-center justify-center rounded-xl border border-slate-700/60 bg-slate-950/30 p-4">
                      <div className="h-16 w-16 rounded-full border-[13px] border-slate-700 border-t-blue-500" />
                    </div>

                    <div className="space-y-3 rounded-xl border border-slate-700/60 bg-slate-950/30 p-4">
                      <div className="h-2 w-3/4 rounded-full bg-blue-500/70" />

                      <div className="h-2 w-full rounded-full bg-slate-700" />

                      <div className="h-2 w-2/3 rounded-full bg-slate-700" />
                    </div>
                  </div>
                </div>


                <div className="absolute bottom-8 right-0 flex h-28 w-28 items-center justify-center rounded-[24px] border border-blue-400/30 bg-[#14233f]/95 shadow-2xl shadow-blue-900/40">
                  <Bot
                    size={52}
                    className="text-cyan-300"
                  />
                </div>
              </div>
            </div>


            {/* Features */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {features.map(
                ({
                  title,
                  description,
                  icon: Icon,
                  iconClass,
                }) => (
                  <article
                    key={
                      title
                    }
                    className="flex items-start gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/15 p-4"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                    >
                      <Icon
                        size={18}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {
                          description
                        }
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>


        {/* REGISTER SIDE */}
        <section className="relative flex min-h-screen items-center justify-center bg-[#020617] px-6 py-10 sm:px-10 lg:px-14">
          <div className="relative z-10 w-full max-w-[480px]">
            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-white"
            >
              <ArrowLeft
                size={15}
              />

              Back to sign in
            </button>


            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              Get started
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[34px]">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Create your DataPilot AI workspace and
              start analysing your datasets.
            </p>


            <form
              onSubmit={
                handleSubmit
              }
              className="mt-8 space-y-4"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-medium text-slate-400"
                >
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="name"
                    type="text"
                    value={
                      name
                    }
                    onChange={(
                      event,
                    ) =>
                      setName(
                        event.target
                          .value,
                      )
                    }
                    required
                    autoComplete="name"
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-700/80 bg-[#101b31] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>


              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium text-slate-400"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="email"
                    type="email"
                    value={
                      email
                    }
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target
                          .value,
                      )
                    }
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-700/80 bg-[#101b31] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>


              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-medium text-slate-400"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target
                          .value,
                      )
                    }
                    required
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-slate-700/80 bg-[#101b31] py-3.5 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={17}
                      />
                    ) : (
                      <Eye
                        size={17}
                      />
                    )}
                  </button>
                </div>
              </div>


              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-xs font-medium text-slate-400"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setConfirmPassword(
                        event.target
                          .value,
                      )
                    }
                    required
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-slate-700/80 bg-[#101b31] py-3.5 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        size={17}
                      />
                    ) : (
                      <Eye
                        size={17}
                      />
                    )}
                  </button>
                </div>
              </div>


              {error && (
                <div className="rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}


              <button
                type="submit"
                disabled={
                  loading
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account

                    <ArrowRight
                      size={17}
                    />
                  </>
                )}
              </button>
            </form>


            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
                className="font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Sign in
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}


export default Register;
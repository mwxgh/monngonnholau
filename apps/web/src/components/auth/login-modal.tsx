"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AcInput } from "@/components/ui/ac-input";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const loginSchema = z.object({
  identifier: z.string().min(1, "Vui lòng nhập email hoặc số điện thoại"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.email("Email không hợp lệ"),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^(0[3-9])\d{8}$/, "Số điện thoại không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-primary/60 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

export function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [serverError, setServerError] = useState("");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  function switchTab(t: "login" | "register") {
    setTab(t);
    setServerError("");
  }

  async function handleLogin(values: LoginValues) {
    setServerError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.message ?? "Đăng nhập thất bại"); return; }
      if (data.accessToken) localStorage.setItem("access_token", data.accessToken);
      onSuccess();
      onClose();
    } catch {
      setServerError("Không thể kết nối đến máy chủ");
    }
  }

  async function handleRegister(values: RegisterValues) {
    setServerError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.message ?? "Đăng ký thất bại"); return; }
      if (data.accessToken) localStorage.setItem("access_token", data.accessToken);
      onSuccess();
      onClose();
    } catch {
      setServerError("Không thể kết nối đến máy chủ");
    }
  }

  const oauthBase = `${process.env.NEXT_PUBLIC_API_URL}/api/auth`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton className="p-0 overflow-hidden max-w-md">
        <div className="w-full bg-white p-6 md:p-8">
          {/* Header */}
          <h2 className="text-xl font-bold text-neutral-800">
            {tab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản"}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {tab === "login"
              ? "Đăng nhập để tiếp tục mua sắm."
              : "Điền thông tin để bắt đầu."}
          </p>

          {/* Tab switcher */}
          <div className="mt-5 flex rounded-lg bg-gray-100 p-1">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tab === t
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {t === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === "login" && (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="mt-6 flex flex-col gap-4">
                <FormField
                  control={loginForm.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Email hoặc số điện thoại
                      </FormLabel>
                      <FormControl>
                        <AcInput placeholder="email@example.com hoặc 0912 345 678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">
                        Mật khẩu
                      </FormLabel>
                      <FormControl>
                        <AcInput type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
                <button
                  type="submit"
                  disabled={loginForm.formState.isSubmitting}
                  className="group/btn relative mt-2 h-10 w-full rounded-md bg-linear-to-br from-neutral-800 to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] transition-opacity disabled:opacity-60"
                >
                  {loginForm.formState.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập →"}
                  <BottomGradient />
                </button>

                <div className="my-2 h-px w-full bg-linear-to-r from-transparent via-neutral-300 to-transparent" />

                <div className="flex flex-col gap-3">
                  <a
                    href={`${oauthBase}/google`}
                    className="group/btn relative flex h-10 w-full items-center justify-start gap-3 rounded-md bg-gray-50 px-4 text-sm font-medium text-black shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(25,28,33,0.08)] transition-colors hover:bg-gray-100"
                  >
                    <GoogleIcon />
                    Tiếp tục với Google
                    <BottomGradient />
                  </a>
                  <a
                    href={`${oauthBase}/facebook`}
                    className="group/btn relative flex h-10 w-full items-center justify-start gap-3 rounded-md bg-gray-50 px-4 text-sm font-medium text-black shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(25,28,33,0.08)] transition-colors hover:bg-gray-100"
                  >
                    <FacebookIcon />
                    Tiếp tục với Facebook
                    <BottomGradient />
                  </a>
                </div>
              </form>
            </Form>
          )}

          {/* Register form */}
          {tab === "register" && (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="mt-6 flex flex-col gap-4">
                <div className="flex gap-3">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-sm font-medium text-neutral-700">Họ tên</FormLabel>
                        <FormControl>
                          <AcInput placeholder="Nguyễn Văn A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-sm font-medium text-neutral-700">Số điện thoại</FormLabel>
                        <FormControl>
                          <AcInput type="tel" placeholder="0912 345 678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">Email</FormLabel>
                      <FormControl>
                        <AcInput type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-neutral-700">Mật khẩu</FormLabel>
                      <FormControl>
                        <AcInput type="password" placeholder="Ít nhất 6 ký tự" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
                <button
                  type="submit"
                  disabled={registerForm.formState.isSubmitting}
                  className="group/btn relative mt-2 h-10 w-full rounded-md bg-linear-to-br from-neutral-800 to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] transition-opacity disabled:opacity-60"
                >
                  {registerForm.formState.isSubmitting ? "Đang đăng ký..." : "Đăng ký →"}
                  <BottomGradient />
                </button>

                <div className="my-2 h-px w-full bg-linear-to-r from-transparent via-neutral-300 to-transparent" />

                <div className="flex flex-col gap-3">
                  <a
                    href={`${oauthBase}/google`}
                    className="group/btn relative flex h-10 w-full items-center justify-start gap-3 rounded-md bg-gray-50 px-4 text-sm font-medium text-black shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(25,28,33,0.08)] transition-colors hover:bg-gray-100"
                  >
                    <GoogleIcon />
                    Tiếp tục với Google
                    <BottomGradient />
                  </a>
                  <a
                    href={`${oauthBase}/facebook`}
                    className="group/btn relative flex h-10 w-full items-center justify-start gap-3 rounded-md bg-gray-50 px-4 text-sm font-medium text-black shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_0px_0px_1px_rgba(25,28,33,0.08)] transition-colors hover:bg-gray-100"
                  >
                    <FacebookIcon />
                    Tiếp tục với Facebook
                    <BottomGradient />
                  </a>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

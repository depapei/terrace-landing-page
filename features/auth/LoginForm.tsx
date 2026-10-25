"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AntForm, FormError, TextInput } from "@/components/admin/form-fields";
import { loginSchema } from "@/lib/auth/schema";
import { useLogin } from "./hooks";

/** Only same-site admin paths are allowed as post-login destinations. */
function safeNext(value: string | null) {
  return value && /^\/admin(\/[a-z0-9-]*)*$/.test(value) && value !== "/admin/login" ? value : "/admin";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    login.mutate(values, {
      onSuccess: () => {
        router.replace(safeNext(searchParams.get("next")));
        router.refresh();
      },
      onError: (error) => setFormError(error.message),
    });
  });

  return (
    <div className="rounded-[10px] border border-line bg-white/60 p-6">
      <AntForm onSubmit={onSubmit}>
        <FormError message={formError} />
        <TextInput
          control={control}
          name="username"
          label="Username"
          required
          size="large"
          prefix={<UserOutlined className="text-muted" />}
          autoComplete="username"
          placeholder="admin"
          autoCapitalize="none"
          spellCheck={false}
        />
        <TextInput
          control={control}
          name="password"
          label="Password"
          required
          password
          size="large"
          prefix={<LockOutlined className="text-muted" />}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <Button type="primary" htmlType="submit" size="large" block loading={login.isPending}>
          {login.isPending ? "Memeriksa…" : "Masuk"}
        </Button>
      </AntForm>
    </div>
  );
}

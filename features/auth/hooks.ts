"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { LoginInput } from "@/lib/auth/schema";
import { queryKeys } from "@/lib/query-keys";

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      await api.post("/admin/auth/login", input);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/admin/auth/logout");
    },
    // Drop every cached admin response so nothing lingers after logout.
    onSettled: () => queryClient.clear(),
  });
}

export type AdminStats = {
  hero: number;
  solutions: number;
  portfolio: number;
  partners: number;
  achievements: number;
};

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => (await api.get<AdminStats>("/admin/stats")).data,
  });
}

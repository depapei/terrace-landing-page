"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import type { LeadDetail, LeadListInput, LeadListResult, LeadProgressInput, PotentialLeadInput, PotentialLeadUpdate } from "./schema";

export function useLeads(filters: LeadListInput) {
  return useQuery({
    queryKey: [...queryKeys.leads, filters],
    queryFn: async () => (await api.get<LeadListResult>("/admin/leads", { params: filters })).data,
  });
}
export function useLead(id: string | null) {
  return useQuery({
    queryKey: [...queryKeys.leads, "detail", id],
    queryFn: async () => (await api.get<LeadDetail>(`/admin/leads/${id}`)).data,
    enabled: !!id,
    staleTime: 0,
  });
}
export function useLeadMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (action:
      | { method: "create"; input: PotentialLeadInput }
      | { method: "update"; id: string; input: PotentialLeadUpdate }
      | { method: "progress"; id: string; input: LeadProgressInput }
      | { method: "delete"; id: string }) => {
      switch (action.method) {
        case "create": return api.post("/admin/leads", action.input);
        case "update": return api.put(`/admin/leads/${action.id}`, action.input);
        case "progress": return api.patch(`/admin/leads/${action.id}`, action.input);
        case "delete": return api.delete(`/admin/leads/${action.id}`);
      }
    },
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.leads }),
  });
}

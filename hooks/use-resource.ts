"use client";

import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";

type Entity = { id: string; isActive: boolean };

/**
 * Query + mutation hooks for one admin CMS resource (`/api/admin/<resource>`).
 * Every mutation refreshes the resource list and the dashboard counts.
 */
export function createResourceHooks<T extends Entity, Payload>(resource: string, key: QueryKey) {
  const base = `/admin/${resource}`;

  function useInvalidate() {
    const queryClient = useQueryClient();
    return () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: key }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
      ]);
  }

  function useList() {
    return useQuery({
      queryKey: key,
      queryFn: async () => (await api.get<T[]>(base)).data,
    });
  }

  function useCreate() {
    const invalidate = useInvalidate();
    return useMutation({
      mutationFn: async (payload: Payload) => (await api.post<T>(base, payload)).data,
      onSuccess: invalidate,
    });
  }

  function useUpdate() {
    const invalidate = useInvalidate();
    return useMutation({
      mutationFn: async ({ id, payload }: { id: string; payload: Payload }) =>
        (await api.put<T>(`${base}/${id}`, payload)).data,
      onSuccess: invalidate,
    });
  }

  function useSetActive() {
    const queryClient = useQueryClient();
    const invalidate = useInvalidate();
    return useMutation({
      mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
        (await api.patch<T>(`${base}/${id}`, { isActive })).data,
      onMutate: async ({ id, isActive }) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData<T[]>(key);
        queryClient.setQueryData<T[]>(key, (items) =>
          items?.map((item) => (item.id === id ? { ...item, isActive } : item)),
        );
        return { previous };
      },
      onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
      onSettled: invalidate,
    });
  }

  function useDelete() {
    const invalidate = useInvalidate();
    return useMutation({
      mutationFn: async (id: string) => {
        await api.delete(`${base}/${id}`);
      },
      onSuccess: invalidate,
    });
  }

  function useReorder() {
    const queryClient = useQueryClient();
    const invalidate = useInvalidate();
    return useMutation({
      mutationFn: async (ids: string[]) => {
        await api.put(`${base}/reorder`, { ids });
      },
      onMutate: async (ids) => {
        await queryClient.cancelQueries({ queryKey: key });
        const previous = queryClient.getQueryData<T[]>(key);
        if (previous) {
          const byId = new Map(previous.map((item) => [item.id, item]));
          queryClient.setQueryData<T[]>(
            key,
            ids.flatMap((id, sortOrder) => {
              const item = byId.get(id);
              return item ? [{ ...item, sortOrder }] : [];
            }),
          );
        }
        return { previous };
      },
      onError: (_error, _ids, context) => queryClient.setQueryData(key, context?.previous),
      onSettled: invalidate,
    });
  }

  return { useList, useCreate, useUpdate, useSetActive, useDelete, useReorder };
}

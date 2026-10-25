"use client";

import { createResourceHooks } from "@/hooks/use-resource";
import { queryKeys } from "@/lib/query-keys";
import type { PortfolioDto } from "./schema";

const hooks = createResourceHooks<PortfolioDto, FormData>("portfolio", queryKeys.portfolio);

export const usePortfolio = hooks.useList;
export const useCreatePortfolio = hooks.useCreate;
export const useUpdatePortfolio = hooks.useUpdate;
export const useSetPortfolioActive = hooks.useSetActive;
export const useDeletePortfolio = hooks.useDelete;
export const useReorderPortfolio = hooks.useReorder;

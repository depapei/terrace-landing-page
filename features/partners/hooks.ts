"use client";

import { createResourceHooks } from "@/hooks/use-resource";
import { queryKeys } from "@/lib/query-keys";
import type { PartnerDto } from "./schema";

const hooks = createResourceHooks<PartnerDto, FormData>("partners", queryKeys.partners);

export const usePartners = hooks.useList;
export const useCreatePartner = hooks.useCreate;
export const useUpdatePartner = hooks.useUpdate;
export const useSetPartnerActive = hooks.useSetActive;
export const useDeletePartner = hooks.useDelete;
export const useReorderPartners = hooks.useReorder;

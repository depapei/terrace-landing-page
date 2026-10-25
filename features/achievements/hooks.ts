"use client";

import { createResourceHooks } from "@/hooks/use-resource";
import { queryKeys } from "@/lib/query-keys";
import type { AchievementDto } from "./schema";

const hooks = createResourceHooks<AchievementDto, FormData>("achievements", queryKeys.achievements);

export const useAchievements = hooks.useList;
export const useCreateAchievement = hooks.useCreate;
export const useUpdateAchievement = hooks.useUpdate;
export const useSetAchievementActive = hooks.useSetActive;
export const useDeleteAchievement = hooks.useDelete;
export const useReorderAchievements = hooks.useReorder;

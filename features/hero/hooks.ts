"use client";

import { createResourceHooks } from "@/hooks/use-resource";
import { queryKeys } from "@/lib/query-keys";
import type { HeroSlideDto } from "./schema";

const hooks = createResourceHooks<HeroSlideDto, FormData>("hero", queryKeys.hero);

export const useHeroSlides = hooks.useList;
export const useCreateHeroSlide = hooks.useCreate;
export const useUpdateHeroSlide = hooks.useUpdate;
export const useSetHeroSlideActive = hooks.useSetActive;
export const useDeleteHeroSlide = hooks.useDelete;
export const useReorderHeroSlides = hooks.useReorder;

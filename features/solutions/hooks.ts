"use client";

import { createResourceHooks } from "@/hooks/use-resource";
import { queryKeys } from "@/lib/query-keys";
import type { SolutionDto, SolutionInput } from "./schema";

const hooks = createResourceHooks<SolutionDto, SolutionInput>("solutions", queryKeys.solutions);

export const useSolutions = hooks.useList;
export const useCreateSolution = hooks.useCreate;
export const useUpdateSolution = hooks.useUpdate;
export const useSetSolutionActive = hooks.useSetActive;
export const useDeleteSolution = hooks.useDelete;
export const useReorderSolutions = hooks.useReorder;

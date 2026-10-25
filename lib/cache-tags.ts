export const cacheTags = {
  hero: "landing:hero",
  solutions: "landing:solutions",
  partners: "landing:partners",
  achievements: "landing:achievements",
} as const;

export type CacheTag = (typeof cacheTags)[keyof typeof cacheTags];

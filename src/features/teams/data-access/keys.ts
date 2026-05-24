export const squadQueryKey = (teamApiId: number) =>
  ["teams", teamApiId, "squad"] as const;

/**
 * React Query keys for the matches feature.
 *
 * Kept in a separate, non-"use client" module so server components
 * (layouts, pages) can safely import them for prefetch + invalidation
 * without crossing the client boundary.
 */

export const MATCHES_QUERY_KEY = ["matches"] as const;

export const matchQueryKey = (id: string) => ["matches", id] as const;

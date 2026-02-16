const base = import.meta.env.VITE_API_URL ?? "";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, options);
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Resource {
  id: string;
  name: string;
  description: string;
  provider: string;
  provider_url: string | null;
  status: "live" | "coming_soon";
}

export interface Human {
  id: string;
  name: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  skills: string[];
  location: {
    city: string;
    state: string;
    country: string;
    isRemoteAvailable: boolean;
  };
  hourlyRate: number;
  currency: string;
  acceptsCrypto: boolean;
  isAvailable: boolean;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  totalBookings: number;
}

export interface SoftwareSolution {
  solution_id: string;
  solution_name: string;
  vendor_name: string;
  solution_description: string;
  solution_url: string;
  vendor_url?: string;
  reviews_summary?: {
    reviews_count: number;
    average_rating: number;
  };
}

export interface Job {
  need_id: string;
  category: string;
  description: string;
  status: string;
  provider_id: string | null;
  provider_job_id: string | null;
  plan_summary: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

export const api = {
  health: () => fetchApi<{ status: string; service?: string }>("/api/health"),

  resources: () => fetchApi<{ resources: Resource[] }>("/api/resources"),

  humans: (params?: { skill?: string; maxRate?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.skill) sp.set("skill", params.skill);
    if (params?.maxRate) sp.set("maxRate", String(params.maxRate));
    if (params?.limit) sp.set("limit", String(params.limit));
    const q = sp.toString();
    return fetchApi<{ success: boolean; humans: Human[]; count: number }>(
      `/api/humans${q ? `?${q}` : ""}`
    );
  },

  humanDetail: (id: string) =>
    fetchApi<{ success: boolean; human: Human }>(
      `/api/humans/${encodeURIComponent(id)}`
    ),

  software: (params?: { q?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return fetchApi<{
      success: boolean;
      solutions: SoftwareSolution[];
      count: number;
    }>(`/api/software${qs ? `?${qs}` : ""}`);
  },

  createJob: (body: {
    category: string;
    description: string;
    constraints?: Record<string, unknown>;
  }) =>
    fetchApi<{ need_id: string; plan: { provider: string; summary: string } }>(
      "/api/jobs",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    ),

  jobs: (params?: { status?: string; category?: string }) => {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.category) sp.set("category", params.category);
    const q = sp.toString();
    return fetchApi<{ jobs: Job[] }>(`/api/jobs${q ? `?${q}` : ""}`);
  },

  jobDetail: (needId: string) =>
    fetchApi<Job>(`/api/jobs/${encodeURIComponent(needId)}`),

  createWallet: () =>
    fetchApi<{
      address: string;
      private_key: string;
      chain: string;
      chain_id: number;
      rpc_url: string;
      instructions: string[];
    }>("/api/wallet/create", { method: "POST" }),
};

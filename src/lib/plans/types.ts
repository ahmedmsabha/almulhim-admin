export type AdminPlan = {
  id: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  durationDays: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminPlanListResponse = {
  plans: AdminPlan[];
};

export type CreatePlanInput = {
  name: string;
  description?: string;
  priceAmount: number;
  currency: string;
  durationDays: number;
  sortOrder: number;
};

export type UpdatePlanInput = {
  name?: string;
  description?: string | null;
  priceAmount?: number;
  currency?: string;
  durationDays?: number;
  sortOrder?: number;
  isActive?: boolean;
};

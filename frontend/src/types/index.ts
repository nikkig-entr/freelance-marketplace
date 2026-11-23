export type UserRole = 'freelancer' | 'client' | 'admin';
export type UserPlan = 'starter' | 'pro' | 'agency';
export type ProjectStatus = 'draft' | 'open' | 'in_progress' | 'in_review' | 'completed' | 'cancelled' | 'disputed';
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'shortlisted';
export type MessageType = 'text' | 'file' | 'image' | 'system' | 'offer' | 'delivery' | 'revision_request';
export type TransactionType = 'deposit' | 'withdrawal' | 'project_payment' | 'project_refund' | 'platform_fee' | 'subscription_payment' | 'bid_bonus' | 'referral_bonus';
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired';

export interface User {
  id: number;
  uuid: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  skills: string[];
  hourly_rate: number | null;
  availability: string;
  role: UserRole;
  plan: UserPlan;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  reviews_count: number;
  completed_projects: number;
  balance_cents: number;
  pending_balance_cents: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface Project {
  id: number;
  uuid: string;
  client_id: number;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  tags: string[];
  budget_min: number | null;
  budget_max: number | null;
  is_fixed_price: boolean;
  deadline: string | null;
  estimated_duration_days: number | null;
  status: ProjectStatus;
  is_featured: boolean;
  is_urgent: boolean;
  required_skills: string[];
  experience_level: string;
  english_level: string;
  attachments: Attachment[];
  views_count: number;
  bids_count: number;
  selected_freelancer_id: number | null;
  client?: User;
  selected_freelancer?: User;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface Bid {
  id: number;
  uuid: string;
  project_id: number;
  freelancer_id: number;
  amount_cents: number;
  cover_letter: string;
  proposed_timeline_days: number;
  attachments: Attachment[];
  status: BidStatus;
  client_notes: string | null;
  viewed_at: string | null;
  project?: Project;
  freelancer?: User;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  uuid: string;
  project_id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  message_type: MessageType;
  attachments: Attachment[];
  is_read: boolean;
  read_at: string | null;
  reply_to_id: number | null;
  sender?: User;
  recipient?: User;
  project?: Project;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  name: string;
  url: string;
  size: number;
  mime_type: string;
}

export interface Transaction {
  id: number;
  uuid: string;
  user_id: number;
  project_id: number | null;
  type: TransactionType;
  amount_cents: number;
  balance_after_cents: number;
  currency: string;
  description: string | null;
  metadata: Record<string, unknown>;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Withdrawal {
  id: number;
  uuid: string;
  user_id: number;
  amount_cents: number;
  currency: string;
  method: string;
  destination: Record<string, unknown>;
  platform_fee_cents: number;
  processing_fee_cents: number;
  net_amount_cents: number;
  status: WithdrawalStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Review {
  id: number;
  uuid: string;
  project_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  title: string | null;
  content: string;
  communication_rating: number | null;
  quality_rating: number | null;
  deadline_rating: number | null;
  professionalism_rating: number | null;
  is_public: boolean;
  is_anonymous: boolean;
  response: string | null;
  responded_at: string | null;
  reviewer?: User;
  reviewee?: User;
  project?: Project;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  uuid: string;
  user_id: number;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan: UserPlan;
  status: SubscriptionStatus;
  billing_interval: 'month' | 'year';
  amount_cents: number;
  currency: string;
  current_period_start: string;
  current_period_end: string;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  type?: string;
  status_code?: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  full_name: string;
  role: UserRole;
}

export interface ProjectFilters {
  category?: string;
  subcategory?: string;
  skills?: string[];
  budget_min?: number;
  budget_max?: number;
  experience_level?: string;
  is_urgent?: boolean;
  is_featured?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: 'created_at' | 'budget' | 'deadline' | 'bids_count';
  sort_order?: 'asc' | 'desc';
}
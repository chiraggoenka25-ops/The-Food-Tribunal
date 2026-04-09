export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'INSPECTOR';
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  ingredients: string;
  nutrition: Record<string, string>;
  verdict_certified: boolean;
  certificate_id?: string;
  created_at: string;
}

export type VerdictStatus = 'CLEAN' | 'CAUTION' | 'RISK';

export interface Analysis {
  id: string;
  product_id: string;
  score: number;
  verdict: VerdictStatus;
  risks: string[];
  additives: string[];
  ingredient_analysis: Record<string, unknown>;
  processing_level: string;
  health_summary: string;
  analysis_source?: 'openai' | 'fallback_rule_engine';
  created_at: string;
  products?: { name: string, brand: string, barcode: string };
}

export interface Certification {
  id: string;
  product_id: string;
  brand_name: string;
  status: 'PENDING' | 'ASSIGNED' | 'INSPECTED' | 'APPROVED' | 'REJECTED';
  applied_at: string;
  reviewed_at: string;
  inspector_id: string;
  admin_id: string;
  inspector_notes: string;
  certificate_id?: string;
  products?: { name: string, barcode: string };
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  moderation_status: 'VISIBLE' | 'HIDDEN' | 'FLAGGED';
  users?: { name: string };
}

export interface TribunalReport {
  id: string;
  product_id: string;
  user_id: string;
  report_type: string;
  description: string;
  status: string;
  created_at: string;
  is_flagged: boolean;
  products?: { name: string, brand: string };
  users?: { name: string, email: string };
}

export interface TransparencyReport {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  published_at: string;
  created_by: string;
  users?: { name: string };
}

export interface Discussion {
  id: string;
  product_id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  moderation_status: 'VISIBLE' | 'HIDDEN' | 'FLAGGED';
  users?: { name: string };
  replies?: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  created_at: string;
  moderation_status: 'VISIBLE' | 'HIDDEN' | 'FLAGGED';
  users?: { name: string };
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_role: string;
  action_type: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ScanResult {
  message: string;
  product: Product;
  analysis: Analysis;
}

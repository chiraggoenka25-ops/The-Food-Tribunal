import { Product, Analysis, ScanResult, User, Certification, TribunalReport, Discussion, TransparencyReport, AuditLog } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || response.statusText, response.status);
  }

  return data;
}

export const API = {
  // Products
  getProducts: () => fetchAPI('/products').then((d) => d.products as Product[]),
  getProductByBarcode: (barcode: string) => fetchAPI(`/products/${barcode}`).then((d) => d.product as Product),
  
  // Analysis
  getAnalysis: (productId: string) => fetchAPI(`/analyze/${productId}`).then((d) => d.analysis as Analysis),
  
  // Scan
  scanProduct: (barcode: string) => fetchAPI('/scan', {
    method: 'POST',
    body: JSON.stringify({ barcode }),
  }).then((d) => d as ScanResult),
  
  // Auth
  login: async (email: string, password: string) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  signup: async (name: string, email: string, password: string) => {
    const data = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data.session?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) as User : null;
  },

  // Certification API
  applyForCertification: (product_id: string, brand_name: string) => fetchAPI('/certification/apply', {
    method: 'POST',
    body: JSON.stringify({ product_id, brand_name }),
  }),
  getCertifications: (status?: string) => {
    const url = status ? `/certification?status=${status}` : `/certification`;
    return fetchAPI(url).then(d => d.certs as Certification[]);
  },
  getAssignedCertifications: () => fetchAPI('/certification/assigned').then(d => d.certs as Certification[]),
  getInspectors: () => fetchAPI('/certification/inspectors').then(d => d.inspectors as User[]),
  assignInspector: (certId: string, inspector_id: string) => fetchAPI(`/certification/${certId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ inspector_id }),
  }),
  submitReview: (certId: string, inspector_notes: string) => fetchAPI(`/certification/${certId}/review`, {
    method: 'PUT',
    body: JSON.stringify({ inspector_notes }),
  }),
  submitDecision: (certId: string, action: 'APPROVE' | 'REJECT') => fetchAPI(`/certification/${certId}/decision`, {
    method: 'PUT',
    body: JSON.stringify({ action }),
  }),

  // Exposure API - Public
  getReviews: (productId: string) => fetchAPI(`/public/reviews/${productId}`),
  getReportCount: (productId: string) => fetchAPI(`/public/reports/count/${productId}`).then(d => d.count as number),
  getDiscussions: (productId: string) => fetchAPI(`/public/discussions/${productId}`).then(d => d.discussions as Discussion[]),
  getTrending: () => fetchAPI('/public/trending'),
  getTransparencyReports: () => fetchAPI('/public/transparency').then(d => d.reports as TransparencyReport[]),
  getTransparencyReportBySlug: (slug: string) => fetchAPI(`/public/transparency/${slug}`).then(d => d.report as TransparencyReport),

  // Exposure API - Auth required
  postReview: (product_id: string, rating: number, title: string, comment: string) => fetchAPI('/public/reviews', {
    method: 'POST',
    body: JSON.stringify({ product_id, rating, title, comment })
  }),
  postReport: (product_id: string, report_type: string, description: string) => fetchAPI('/public/reports', {
    method: 'POST',
    body: JSON.stringify({ product_id, report_type, description })
  }),
  postDiscussion: (product_id: string, title: string, content: string) => fetchAPI('/public/discussions', {
    method: 'POST',
    body: JSON.stringify({ product_id, title, content })
  }),
  postDiscussionReply: (discussionId: string, content: string) => fetchAPI(`/public/discussions/${discussionId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ content })
  }),

  // Exposure API - Admin
  getAdminReports: () => fetchAPI('/public/admin/reports').then(d => d.reports as TribunalReport[]),
  updateReportStatus: (reportId: string, status: string, is_flagged: boolean) => fetchAPI(`/public/admin/reports/${reportId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, is_flagged })
  }),
  updateModerationStatus: (type: string, id: string, moderation_status: string) => fetchAPI(`/public/admin/moderate/${type}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ moderation_status })
  }),
  publishTransparencyReport: (payload: Record<string, unknown>) => fetchAPI('/public/transparency', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Audit Logs
  getAuditLogs: () => fetchAPI('/admin/audit').then(d => d.logs as AuditLog[])
};

/**
 * VinJobs API Client
 * ==================
 * Tất cả HTTP calls đều đi qua đây.
 * Để đổi URL backend: chỉ sửa VITE_API_URL trong file .env
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ─── Standard JSDoc Interfaces ─────────────────────────────────────
/**
 * @typedef {Object} BaseResponse
 * @property {'success'|'fail'|'error'} status - Trạng thái của API
 * @property {string} [message] - Thông báo lỗi nếu có
 */

/**
 * @template T
 * @typedef {BaseResponse & { data: T }} SuccessResponse
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} [avatar]
 * @property {string} [phone]
 * @property {string} status
 */

/**
 * @typedef {Object} Job
 * @property {string} _id
 * @property {string} title
 * @property {string} level
 * @property {number} salaryMin
 * @property {number} salaryMax
 * @property {string} status
 */

/**
 * @typedef {Object} Company
 * @property {string} _id
 * @property {string} name
 * @property {string} logo
 * @property {string} status
 */

/**
 * @typedef {BaseResponse & { token: string, data: { user: User } }} AuthResponse
 */

/**
 * @typedef {SuccessResponse<{ user: User }>} GetMeResponse
 */

// ─── Token helpers ─────────────────────────────────────────────────
const TOKEN_KEY = 'vj_token';
const USER_KEY = 'vj_user';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

export const userStorage = {
  get: () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  remove: () => localStorage.removeItem(USER_KEY),
};

export const clearSession = () => {
  tokenStorage.remove();
  userStorage.remove();
};

/**
 * Hàm kiểm tra nhanh xem JWT Token còn hạn hay không (để khỏi mất công gọi API)
 * @param {string} token 
 * @returns {boolean}
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    // Trừ hao 5 giây (5000ms) để an toàn mạng chậm
    return (payload.exp * 1000) > (Date.now() + 5000);
  } catch (e) {
    return false;
  }
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  return `${backendUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

// ─── Core fetch wrapper ─────────────────────────────────────────────
async function request(endpoint, options = {}) {
  let currentToken = tokenStorage.get();

  const headers = {
    ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
    ...options.headers,
  };

  // Chỉ set mặc định application/json nếu body không phải là FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register') || endpoint.includes('/auth/refresh-token');

  const doRefreshToken = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      tokenStorage.set(data.token);
      return data.token;
    } catch (err) {
      return null;
    }
  };

  const handleSessionExpired = () => {
    clearSession();
    const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
    if (!isAuthPage) {
      const redirectUrl = window.location.pathname.startsWith('/admin') ? '/admin/login?expired=true' : '/login?expired=true';
      window.location.href = redirectUrl;
    }
    throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
  };

  // 1. Kiểm tra Hạn Token ngay tại Client
  if (currentToken && !isAuthEndpoint && !isTokenValid(currentToken)) {
    const newToken = await doRefreshToken();
    if (!newToken) {
      return handleSessionExpired();
    }
    currentToken = newToken;
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 2. Nếu Backend vẫn trả về 401 (lớp bảo vệ 2)
  if (response.status === 401 && !isAuthEndpoint) {
    const newToken = await doRefreshToken();
    if (!newToken) {
      return handleSessionExpired();
    }
    
    // Gửi lại request với token mới
    currentToken = newToken;
    config.headers['Authorization'] = `Bearer ${currentToken}`;
    response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      return handleSessionExpired();
    }
  }

  // Parse JSON
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  // Throw on error
  if (!response.ok) {
    const errorMessage = data.message || `Lỗi ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

// ─── HTTP methods ───────────────────────────────────────────────────
export const api = {
  /**
   * @template T
   * @param {string} endpoint 
   * @param {RequestInit} [options] 
   * @returns {Promise<T>}
   */
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),

  /**
   * @template T
   * @param {string} endpoint 
   * @param {any} body 
   * @param {RequestInit} [options] 
   * @returns {Promise<T>}
   */
  post: (endpoint, body, options) =>
    request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  patch: (endpoint, body, options) =>
    request(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  put: (endpoint, body, options) =>
    request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  delete: (endpoint, options) =>
    request(endpoint, { method: 'DELETE', ...options }),
};

// ─── Auth API ───────────────────────────────────────────────────────
export const authApi = {
  checkEmail: (email) => api.post('/auth/check-email', { email }),
  /**
   * @param {string} email 
   * @param {string} password 
   * @param {string} captchaToken 
   * @returns {Promise<AuthResponse>}
   */
  login: (email, password, captchaToken) =>
    api.post('/auth/login', { email, password, captchaToken }),

  getMe: () => api.get('/users/me'),
  updatePassword: (data) => api.patch('/users/me/password', data),

  /**
   * @returns {Promise<SuccessResponse<{ notifications: Notification[], unreadCount: number }>>}
   */
  getNotifications: () => api.get('/users/me/notifications'),

  /**
   * @returns {Promise<SuccessResponse<any>>}
   */
  readAllNotifications: () => api.patch('/users/me/notifications/read-all'),

  getCandidateStats: () => api.get('/users/me/candidate-stats'),

  /**
   * @param {Object} data 
   * @returns {Promise<AuthResponse>}
   */
  register: (data) =>
    api.post('/auth/register', data),

  verifyEmail: (email, otp, companyData) =>
    api.post('/auth/verify-email', { email, otp, companyData }),

  resendOTP: (email) =>
    api.post('/auth/resend-otp', { email }),

  /**
   * @returns {Promise<AuthResponse>}
   */
  googleLogin: (idToken, role) =>
    api.post('/auth/google', { idToken, role }),

  /**
   * @returns {Promise<AuthResponse>}
   */
  googleRegister: (idToken, password, role) =>
    api.post('/auth/google/register', { idToken, password, role }),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  /**
   * @returns {Promise<AuthResponse>}
   */
  resetPassword: (token, password) =>
    api.patch(`/auth/reset-password/${token}`, { password }),

  logout: () =>
    api.post('/auth/logout'),

  /**
   * @returns {Promise<GetMeResponse>}
   */
  getMe: () =>
    api.get('/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    api.patch('/users/me/password', { currentPassword, newPassword }),

  updateProfile: (data) =>
    api.patch('/users/me', data),
};

export const publicApi = {
  // Config / Settings
  getSettings: () => api.get('/settings'),

  // Jobs
  jobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/jobs${qs ? `?${qs}` : ''}`);
  },
  
  // Job Categories
  getCategories: () => api.get('/jobs/categories').then(res => res.data),

  // Top Companies
  getTopCompanies: (limit = 10) => api.get(`/companies/top?limit=${limit}`).then(res => res.data),
};

export const blogApi = {
  /**
   * @param {Object} [params]
   * @returns {Promise<{ posts: any[], totalCount: number }>}
   */
  getPosts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/blog/posts${qs ? `?${qs}` : ''}`).then(res => res.data);
  },

  /**
   * @param {string} slug
   * @returns {Promise<{ post: any }>}
   */
  getPost: (slug) => api.get(`/blog/posts/${slug}`).then(res => res.data),

  /**
   * Alias for getPost
   * @param {string} slug
   * @returns {Promise<{ post: any }>}
   */
  getPostBySlug: (slug) => api.get(`/blog/posts/${slug}`).then(res => res.data),

  /**
   * @returns {Promise<{ categories: any[] }>}
   */
  getCategories: () => api.get('/blog/categories').then(res => res.data),
};

export const uploadApi = {
  /**
   * @param {FormData} formData
   * @returns {Promise<SuccessResponse<{ url: string }>>}
   */
  uploadImage: (formData) => api.post('/upload/image', formData),

  /**
   * @param {FormData} formData
   * @returns {Promise<SuccessResponse<{ url: string }>>}
   */
  uploadDocument: (formData) => api.post('/upload/document', formData),
};

// ─── Jobs API ───────────────────────────────────────────────────────
export const jobsApi = {
  /**
   * @param {Object} [params]
   * @returns {Promise<SuccessResponse<{ jobs: Job[], totalCount: number }>>}
   */
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/jobs${qs ? `?${qs}` : ''}`);
  },

  /**
   * @param {string} id
   * @returns {Promise<SuccessResponse<{ job: Job }>>}
   */
  get: (id) => api.get(`/jobs/${id}`),

  /**
   * @param {Object} data
   * @returns {Promise<SuccessResponse<{ job: Job }>>}
   */
  create: (data) => api.post('/jobs', data),

  /**
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<SuccessResponse<{ job: Job }>>}
   */
  update: (id, data) => api.patch(`/jobs/${id}`, data),

  /**
   * @param {string} id
   * @returns {Promise<SuccessResponse<null>>}
   */
  delete: (id) => api.delete(`/jobs/${id}`),

  /**
   * @returns {Promise<SuccessResponse<{ jobs: Job[] }>>}
   */
  mine: () => api.get('/jobs/employer/mine'),
};

// ─── Companies API ──────────────────────────────────────────────────
export const companiesApi = {
  /**
   * @param {Object} [params]
   * @returns {Promise<SuccessResponse<{ companies: Company[], totalCount: number }>>}
   */
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/companies${qs ? `?${qs}` : ''}`);
  },

  /**
   * @param {string} id
   * @returns {Promise<SuccessResponse<{ company: Company }>>}
   */
  get: (id) => api.get(`/companies/${id}`),

  /**
   * @returns {Promise<SuccessResponse<{ companies: Company[] }>>}
   */
  mine: () => api.get('/companies/employer/mine'),

  /**
   * @param {Object} data
   * @returns {Promise<SuccessResponse<{ company: Company }>>}
   */
  create: (data) => api.post('/companies', data),

  /**
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<SuccessResponse<{ company: Company }>>}
   */
  update: (id, data) => api.patch(`/companies/${id}`, data),

  /**
   * @param {Object} data
   * @returns {Promise<SuccessResponse<{ company: Company }>>}
   */
  verify: (data) => api.put('/companies/verify', data),

  // Follow company
  toggleFollow: (id) => api.post(`/companies/${id}/follow`),
  checkFollow: (id) => api.get(`/companies/${id}/check-follow`),
};

// ─── Applications API ───────────────────────────────────────────────
export const applicationsApi = {
  /**
   * @param {string} jobId
   * @param {string} cv_id
   * @param {string} coverLetter
   * @returns {Promise<SuccessResponse<any>>}
   */
  apply: (jobId, cv_id, coverLetter) =>
    api.post('/applications', { jobId, cv_id, cover_letter: coverLetter }),

  /**
   * @param {string} jobId
   * @returns {Promise<SuccessResponse<{ applied: boolean }>>}
   */
  checkApplied: (jobId) => api.get(`/applications/check/${jobId}`),

  /**
   * @param {Object} [params]
   * @returns {Promise<SuccessResponse<{ applications: any[], totalCount: number }>>}
   */
  mine: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/applications/me${qs ? `?${qs}` : ''}`);
  },

  /**
   * @param {string} jobId
   * @returns {Promise<SuccessResponse<{ applications: any[], totalCount: number }>>}
   */
  forJob: (jobId) => api.get(`/applications/employer/all?job_id=${jobId}`),

  /**
   * @param {Object} [params]
   * @returns {Promise<SuccessResponse<{ applications: any[], totalCount: number }>>}
   */
  allForEmployer: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/applications/employer/all${qs ? `?${qs}` : ''}`);
  },

  /**
   * @param {string} id
   * @param {string} status
   * @returns {Promise<SuccessResponse<any>>}
   */
  updateStatus: (id, status) =>
    api.patch(`/applications/${id}/status`, { status }),
};

// ─── Admin API ──────────────────────────────────────────────────────
export const adminApi = {
  /**
   * @returns {Promise<SuccessResponse<any>>}
   */
  stats: () => api.get('/admin/stats'),

  /**
   * @returns {Promise<SuccessResponse<any>>}
   */
  getNotifications: () => api.get('/admin/notifications'),

  /**
   * @returns {Promise<SuccessResponse<any>>}
   */
  readAllNotifications: () => api.patch('/admin/notifications/read-all'),

  /**
   * @param {Object} [params]
   * @returns {Promise<SuccessResponse<{ users: User[], totalCount: number }>>}
   */
  users: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  /**
   * @param {string} id
   * @param {string} status
   * @returns {Promise<SuccessResponse<any>>}
   */
  updateUserStatus: (id, status) =>
    api.patch(`/admin/users/${id}/status`, { status }),

  /**
   * @param {Object} data
   * @returns {Promise<SuccessResponse<any>>}
   */
  createUser: (data) => api.post('/admin/users', data),

  /**
   * @param {string} id
   * @returns {Promise<SuccessResponse<any>>}
   */
  getUser: (id) => api.get(`/admin/users/${id}`),

  /**
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<SuccessResponse<any>>}
   */
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),

  /**
   * @param {string} id
   * @returns {Promise<SuccessResponse<any>>}
   */
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  /**
   * @param {Object} [params]
   * @returns {Promise<SuccessResponse<{ companies: Company[], totalCount: number }>>}
   */
  companies: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/companies${qs ? `?${qs}` : ''}`);
  },

  /**
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<SuccessResponse<any>>}
   */
  updateCompanyStatus: (id, data) =>
    api.patch(`/admin/companies/${id}/status`, data),

  /**
   * @param {Object} data
   * @returns {Promise<SuccessResponse<any>>}
   */
  createCompany: (data) => api.post('/admin/companies', data),

  /**
   * @param {string} id
   * @returns {Promise<SuccessResponse<any>>}
   */
  getCompany: (id) => api.get(`/admin/companies/${id}`),

  /**
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<SuccessResponse<any>>}
   */
  updateCompany: (id, data) => api.patch(`/admin/companies/${id}`, data),

  /**
   * @param {string} id
   * @returns {Promise<SuccessResponse<any>>}
   */
  deleteCompany: (id) => api.delete(`/admin/companies/${id}`),

  // --- Categories ---
  /**
   * @returns {Promise<SuccessResponse<{ categories: any[] }>>}
   */
  categories: () => api.get('/admin/categories'),

  /**
   * @param {Object} data 
   * @returns {Promise<SuccessResponse<any>>}
   */
  createCategory: (data) => api.post('/admin/categories', data),

  /**
   * @param {string} id 
   * @param {Object} data 
   * @returns {Promise<SuccessResponse<any>>}
   */
  updateCategory: (id, data) => api.patch(`/admin/categories/${id}`, data),

  /**
   * @param {string} id 
   * @returns {Promise<SuccessResponse<any>>}
   */
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Settings
  updateSettings: (data) => api.patch('/admin/settings', data),

  /**
   * @param {Object} [params]
   * @returns {Promise<SuccessResponse<{ jobs: Job[], totalCount: number }>>}
   */
  jobs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/jobs${qs ? `?${qs}` : ''}`);
  },

  /**
   * @param {string} id
   * @param {string} status
   * @returns {Promise<SuccessResponse<any>>}
   */
  updateJobStatus: (id, status) =>
    api.patch(`/admin/jobs/${id}/status`, { status }),
};

export const savedJobsApi = {
  toggle: (jobId) => api.post('/saved-jobs', { jobId }),
  getMySavedJobs: (params) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/saved-jobs/me${qs ? `?${qs}` : ''}`);
  },
  checkSaved: (jobId) => api.get(`/saved-jobs/check/${jobId}`),
};

export const cvApi = {
  uploadCV: (data) => api.post('/cvs', data),
  getMyCVs: () => api.get('/cvs'),
  deleteCV: (id) => api.delete(`/cvs/${id}`),
  setDefault: (id) => api.patch(`/cvs/${id}/default`),
};

export const publicJobsApi = {
  search: (params) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/jobs${qs ? `?${qs}` : ''}`);
  }
};


export default api;

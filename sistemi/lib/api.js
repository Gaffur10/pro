const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method untuk request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle network errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle authentication errors
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
          throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
        }
        
        // Handle server errors
        if (response.status >= 500) {
          throw new Error('Terjadi kesalahan server. Silakan coba lagi nanti.');
        }
        
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle network connectivity issues
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Siswa Management
  async getSiswa(params = {}) {
    // If no params provided, get all students
    if (Object.keys(params).length === 0) {
      params = { all: 'true' };
    }
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/siswa?${queryString}`);
  }

  async getSiswaById(id) {
    return this.request(`/siswa/${id}`);
  }

  async createSiswa(siswaData) {
    return this.request('/siswa', {
      method: 'POST',
      body: JSON.stringify(siswaData),
    });
  }

  async updateSiswa(id, siswaData) {
    return this.request(`/siswa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(siswaData),
    });
  }

  async deleteSiswa(id) {
    return this.request(`/siswa/${id}`, {
      method: 'DELETE',
    });
  }

  async getSiswaStats() {
    return this.request('/siswa/stats');
  }

  // Nilai Management
  async getNilai(params = {}) {
    // If no params provided, get all nilai
    if (Object.keys(params).length === 0) {
      params = { all: 'true' };
    } else if (!params.paginated) {
      // If params provided but paginated not explicitly set, get all nilai
      params.all = 'true';
    }
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/nilai?${queryString}`);
  }

  async getNilaiById(id) {
    return this.request(`/nilai/${id}`);
  }

  async createNilai(nilaiData) {
    return this.request('/nilai', {
      method: 'POST',
      body: JSON.stringify(nilaiData),
    });
  }

  async updateNilai(id, nilaiData) {
    return this.request(`/nilai/${id}`, {
      method: 'PUT',
      body: JSON.stringify(nilaiData),
    });
  }

  async deleteNilai(id) {
    return this.request(`/nilai/${id}`, {
      method: 'DELETE',
    });
  }

  async getNilaiStats() {
    return this.request('/nilai/stats');
  }

  // Clustering
  async runClustering(clusteringData) {
    return this.request('/clustering/run', {
      method: 'POST',
      body: JSON.stringify(clusteringData),
    });
  }

  async getClusteringResults(params = {}) {
    // If no params provided, get all clustering results
    if (Object.keys(params).length === 0) {
      params = { all: 'true' };
    } else if (!params.paginated) {
      // If params provided but paginated not explicitly set, get all results
      params.all = 'true';
    }
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/clustering/results?${queryString}`);
  }

  async getClusteringStats() {
    return this.request('/clustering/stats');
  }

  async clearClusteringResults() {
    return this.request('/clustering/clear', {
      method: 'DELETE',
    });
  }

  // User Management (Admin Only)
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users?${queryString}`);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async changeUserPassword(id, newPassword) {
    return this.request(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getChartData() {
    return this.request('/dashboard/charts');
  }

  async getQuickStats() {
    return this.request('/dashboard/quick-stats');
  }

  // Utility methods
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    return token && isLoggedIn === 'true';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService; 
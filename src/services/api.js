import axios from 'axios';
import { serialize } from 'object-to-formdata';
import { useUserStore } from '@/stores/user';

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://api-bill.hwnix.com/api/' : 'http://127.0.0.1:8000/api/',
  // baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
    'If-None-Match': '',
  },
});

// Set Authorization dynamically
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Set content-type for JSON
apiClient.defaults.headers.post['Content-Type'] = 'application/json';

export const getAll = (apiEndpoint, params = null, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .get(apiEndpoint, { params: params })
      .then(response => {
        log ? console.log(` ${log}:  => `, response.data) : '';
        resolve(response.data);
        loading ? (userStore.loadingApi = false) : '';
      })
      .catch(error => {
        loading ? (userStore.loadingApi = false) : '';
        log ? console.log(` ${log}:  => `, error) : '';
        reject(error.response);
      });
  });
};

export const getOne = (apiEndpoint, id, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .get(`${apiEndpoint}/${id}`)
      .then(response => {
        loading ? (userStore.loadingApi = false) : '';
        log ? console.log(` ${log}:  => `, response.data) : '';
        resolve(response.data.data);
      })
      .catch(error => {
        loading ? (userStore.loadingApi = false) : '';
        log ? console.log(` ${log}:  => `, error) : '';
        reject(error.response);
      });
  });
};

export const saveItem = (apiEndpoint, data, id = false, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    let formData = serialize(data);
    if (id) {
      formData.append('_method', 'put');
      const apiEndpointIfId = `${apiEndpoint}/${id}`;
      apiClient
        .put(apiEndpointIfId, data)
        .then(response => {
          loading ? (userStore.loadingApi = false) : '';
          log ? console.log(` ${log}:  => `, response.data) : '';
          resolve(response.data);
        })
        .catch(error => {
          loading ? (userStore.loadingApi = false) : '';
          log ? console.log(` ${log}:  => `, error) : '';
          reject(error);
        });
    } else {
      apiClient
        .post(apiEndpoint, formData)
        .then(response => {
          loading ? (userStore.loadingApi = false) : '';
          log ? console.log(` ${log}:  => `, response.data) : '';
          resolve(response.data);
        })
        .catch(error => {
          log ? console.log(` ${log}:  => `, error) : '';
          loading ? (userStore.loadingApi = false) : '';
          reject(error);
        });
    }
  });
};

export const deleteOne = (apiEndpoint, id, loading = false, log = false) => {
  return new Promise((resolve, reject) => {
    apiClient
      .delete(`${apiEndpoint}/${id}`)
      .then(response => {
        log ? console.log(` ${log}:  => `, response.data) : '';
        resolve(response.data.data);
      })
      .catch(error => {
        log ? console.log(` ${log}:  => `, error) : '';
        reject(error);
      });
  });
};

export const deleteAll = (apiEndpoint, ids, loading = false, log = false) => {
  return new Promise((resolve, reject) => {
    apiClient
      .post(apiEndpoint, { user_ids: ids })
      .then(response => {
        resolve(response.data.data);
      })
      .catch(error => {
        log ? console.log(` ${log}:  => `, error) : '';
        reject(error);
      });
  });
};

export const register = (apiEndpoint, id, loading = false, log = false) => {
  return new Promise((resolve, reject) => {
    apiClient
      .delete(`${apiEndpoint}/${id}`)
      .then(response => {
        log ? console.log(` ${log}:  => `, error) : '';
        resolve(response.data);
      })
      .catch(error => {
        log ? console.log(` ${log}:  => `, error) : '';
        reject(error);
      });
  });
};
export const login = (apiEndpoint, data, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .post(apiEndpoint, data)
      .then(response => {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        loading ? (userStore.loadingApi = false) : '';
        log ? console.log(` ${log}:  => `, response.data) : '';
        location.reload();
        resolve(response.data);
      })
      .catch(error => {
        loading ? (userStore.loadingApi = false) : '';
        log ? console.log(` ${log}:  => `, error) : '';
        reject(error.response.data);
      });
  });
};

export const logOut = (apiEndpoint, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .post(apiEndpoint)
      .then(response => {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        loading ? (userStore.loadingApi = false) : '';
        log ? console.log(` ${log}:  => `, response.data) : '';
        resolve(response.data);
        location.reload();
      })
      .catch(error => {
        loading ? (userStore.loadingApi = false) : '';
        log ? console.log(` ${log}:  => `, error) : '';
        reject(error);
      });
  });
};

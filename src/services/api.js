import axios from 'axios';
import { serialize } from 'object-to-formdata';
import { useUserStore } from '@/stores/user';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import translateErrors from '@/utils/translateErrors';
// http://10.0.0.64:8008/   bill-api.hwnix.com  http://127.0.0.1:8000/
const apiClient = axios.create({
  // baseURL: process.env.NODE_ENV === 'production' ? 'https://bill-api.hwnix.com/api/' : 'http://10.0.0.64:8008/api/',
  baseURL: process.env.NODE_ENV === 'production' ? 'https://bill-api.hwnix.com/api/' : 'http://127.0.0.1:8000/api/',
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
    'If-None-Match': '',
  },
});

const options = {
  // nullsAsUndefineds: true,
  allowEmptyArrays: true,
  indices: true,
};

// Set Authorization dynamically
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If the request contains FormData, don't set Content-Type as application/json
  if (config.data instanceof FormData) {
    // Remove the default 'Content-Type' to let axios set it correctly
    delete config.headers['Content-Type'];
  } else {
    // Set content-type for JSON requests
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});
apiClient.interceptors.response.use(
  response => response,
  error => {
    // إذا كان الخطأ 401 أو رسالة Unauthenticated
    if (error?.response?.status === 401 || error?.response?.data?.message === 'Unauthenticated.') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const getAll = (apiEndpoint, params = null, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .get(apiEndpoint, { params: params })
      .then(response => {
        log ? console.log(`getAll:  => `, response.data) : '';
        resolve(response.data);
        loading ? (userStore.loadingApi = false) : '';
      })
      .catch(error => {
        log ? console.log(`getAll:  => `, error) : '';
        loading ? (userStore.loadingApi = false) : '';
        const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء جلب البيانات';
        reject(msg);
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
        log ? console.log(`getOne:  => `, response.data) : '';
        loading ? (userStore.loadingApi = false) : '';
        resolve(response.data.data);
      })
      .catch(error => {
        log ? console.log(`getOne:  => `, error) : '';
        loading ? (userStore.loadingApi = false) : '';
        const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء جلب البيانات';
        reject(msg);
      });
  });
};

export const saveItem = (apiEndpoint, data, id = false, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    const formData = serialize(data, options);
    if (id) {
      formData.append('_method', 'put');
      const apiEndpointIfId = `${apiEndpoint}/${id}`;
      apiClient
        .post(apiEndpointIfId, formData)
        .then(response => {
          log ? console.log(`saveItem:  => `, response.data) : '';
          loading ? (userStore.loadingApi = false) : '';
          resolve(response.data);
        })
        .catch(error => {
          log ? console.log(`saveItem:  => `, error) : '';
          loading ? (userStore.loadingApi = false) : '';
          let msg = '';
          if (error && error.response && error.response.data && error.response.data.errors) {
            msg = translateErrors(error.response.data.errors);
          } else if (error && error.response && error.response.data && error.response.data.message) {
            msg = error.response.data.message;
          } else {
            msg = 'حدث خطأ أثناء الحفظ';
          }
          toast.error(msg, { autoClose: 7000 });
          reject(error);
        });
    } else {
      apiClient
        .post(apiEndpoint, formData)
        .then(response => {
          log ? console.log(`saveItem:  => `, response.data) : '';
          loading ? (userStore.loadingApi = false) : '';
          resolve(response.data);
        })
        .catch(error => {
          log ? console.log(`saveItem:  => `, error) : '';
          loading ? (userStore.loadingApi = false) : '';
          let msg = '';
          if (error && error.response && error.response.data && error.response.data.errors) {
            msg = translateErrors(error.response.data.errors);
          } else if (error && error.response && error.response.data && error.response.data.message) {
            msg = error.response.data.message;
          } else {
            msg = 'حدث خطأ أثناء الحفظ';
          }
          toast.error(msg, { autoClose: 7000 });
          reject(error);
        });
    }
  });
};

export const deleteOne = (apiEndpoint, id, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .delete(`${apiEndpoint}/${id}`)
      .then(response => {
        log ? console.log(`deleteOne:  => `, response.data) : '';
        loading ? (userStore.loadingApi = false) : '';
        resolve(response.data.data);
      })
      .catch(error => {
        log ? console.log(`deleteOne:  => `, error) : '';
        loading ? (userStore.loadingApi = false) : '';
        const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء الحذف  ';
        reject(msg);
      });
  });
};

export const updateItem = (apiEndpoint, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .put(`${apiEndpoint}`)
      .then(response => {
        log ? console.log(`updateItem:  => `, response.data) : '';
        loading ? (userStore.loadingApi = false) : '';
        resolve(response.data.data);
      })
      .catch(error => {
        log ? console.log(`updateItem:  => `, error) : '';
        loading ? (userStore.loadingApi = false) : '';
        const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء التحديث  ';
        reject(msg);
      });
  });
};

export const deleteAll = (apiEndpoint, ids, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .post(apiEndpoint, { item_ids: ids })
      .then(response => {
        log ? console.log(`deleteAll:  => `, response.data) : '';
        loading ? (userStore.loadingApi = false) : '';
        resolve(response.data.data);
      })
      .catch(error => {
        log ? console.log(`deleteAll:  => `, error) : '';
        loading ? (userStore.loadingApi = false) : '';
        const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء الحذف  ';
        reject(msg);
      });
  });
};

export const register = (apiEndpoint, id, loading = false, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .delete(`${apiEndpoint}/${id}`)
      .then(response => {
        log ? console.log(`register:  => `, response.data) : '';
        loading ? (userStore.loadingApi = false) : '';
        resolve(response.data.data);
      })
      .catch(error => {
        log ? console.log(`register:  => `, error) : '';
        loading ? (userStore.loadingApi = false) : '';
        const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء الخروج  ';
        reject(msg);
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
        log ? console.log(`login:  => `, response.data) : '';
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        loading ? (userStore.loadingApi = false) : '';
        location.reload();
        resolve(response.data);
      })
      .catch(error => {
        log ? console.log(`login:  => `, error) : '';
        loading ? (userStore.loadingApi = false) : '';
        const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء تسجيل الدخول';
        reject(msg);
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
        log ? console.log(`logOut:  => `, response.data) : '';
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('products');
        loading ? (userStore.loadingApi = false) : '';
        resolve(response.data);
        location.reload();
      })
      .catch(error => {
        log ? console.log(`logOut:  => `, error) : '';
        loading ? (userStore.loadingApi = false) : '';
        const msg = error?.response?.data?.message || error?.message || 'حدث خطأ أثناء تسجيل الخروج';
        reject(msg);
      });
  });
};

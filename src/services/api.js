import axios from 'axios';
import { serialize } from 'object-to-formdata';
import { useUserStore } from '@/stores/user';

// const userStore = useUserStore();

// axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? 'https://api-bill.hwnix.com/api/' : 'http://127.0.0.1:8000/api/';

const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://api-bill.hwnix.com/api/' : 'http://127.0.0.1:8000/api/',
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

export const getAll = (apiEndpoint, params = null, log = false) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  return new Promise((resolve, reject) => {
    apiClient
      .get(apiEndpoint, { params: params })
      .then(response => {
        log ? console.log(` ${log}:  => `, response.data) : '';
        resolve(response.data);
        userStore.loadingApi = false;
      })
      .catch(error => {
        userStore.loadingApi = false;
        log ? console.log(` ${log}:  => `, error) : '';
        reject(error.response);
      });
  });
};

export const getOne = (apiEndpoint, id, log = false) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  return new Promise((resolve, reject) => {
    apiClient
      .get(`${apiEndpoint}/${id}`)
      .then(response => {
        userStore.loadingApi = false;
        log ? console.log(` ${log}:  => `, response.data) : '';
        resolve(response.data.data); // تمرير البيانات باستخدام resolve
      })
      .catch(error => {
        userStore.loadingApi = false;
        log ? console.log(` ${log}:  => `, error) : '';
        reject(error.response); // تمرير الخطأ باستخدام reject
      });
  });
};

export const saveItem = (apiEndpoint, data, id = false, log = false) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  return new Promise((resolve, reject) => {
    let formData = serialize(data);
    if (id) {
      formData.append('_method', 'put');
      const apiEndpointIfId = `${apiEndpoint}/${id}`;
      apiClient
        .put(apiEndpointIfId, data)
        .then(response => {
          userStore.loadingApi = false;
          log ? console.log(` ${log}:  => `, response.data) : '';
          resolve(response.data);
        })
        .catch(error => {
          userStore.loadingApi = false;
          log ? console.log(` ${log}:  => `, error) : '';
          reject(error);
        });
    } else {
      apiClient
        .post(apiEndpoint, formData)
        .then(response => {
          userStore.loadingApi = false;
          log ? console.log(` ${log}:  => `, response.data) : '';
          resolve(response.data);
        })
        .catch(error => {
          log ? console.log(` ${log}:  => `, error) : '';
          userStore.loadingApi = false;
          reject(error);
        });
    }
  });
};

export const deleteOne = (apiEndpoint, id, log = false) => {
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

export const deleteAll = (apiEndpoint, ids, log = false) => {
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

export const register = (apiEndpoint, id, log = false) => {
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
export const login = async (apiEndpoint, data, log = false) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  try {
    const response = await apiClient.post(apiEndpoint, data);

    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    userStore.loadingApi = false;
    log ? console.log(` ${log}:  => `, response.data) : '';
  } catch (error) {
    console.error(`Error logging in at ${apiEndpoint}:`, error);
    userStore.loadingApi = false;
    log ? console.log(` ${log}:  => `, error) : '';
  }
};

export const logOut = (apiEndpoint, log = false) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  return new Promise((resolve, reject) => {
    apiClient
      .post(apiEndpoint)
      .then(response => {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        userStore.loadingApi = false;
        log ? console.log(` ${log}:  => `, response.data) : '';
        resolve(response.data);
        location.reload();
      })
      .catch(error => {
        userStore.loadingApi = false;
        log ? console.log(` ${log}:  => `, error) : '';
        reject(error);
      });
  });
};

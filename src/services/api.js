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

// Handle response errors globally
// apiClient.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response && error.response.status === 401) {
//       console.log('Unauthorized access, please login again.');
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;

// const userStore = useUserStore();

export const getAll = (apiEndpoint, params = null) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  return new Promise((resolve, reject) => {
    apiClient
      .get(apiEndpoint, { params: params })
      .then(response => {
        resolve(response.data);
        userStore.loadingApi = false;
      })
      .catch(error => {
        userStore.loadingApi = false;
        console.log(`Error fetching all data from ${apiEndpoint}:`, error);
        reject(error.response);
      });
  });
};

export const getOne = (apiEndpoint, id) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  return new Promise((resolve, reject) => {
    apiClient
      .get(`${apiEndpoint}/${id}`)
      .then(response => {
        console.log(`fetching item with ID ${id} from ${apiEndpoint}:`, response.data.data);
        userStore.loadingApi = false;
        resolve(response.data.data); // تمرير البيانات باستخدام resolve
      })
      .catch(error => {
        userStore.loadingApi = false;
        console.log(`Error fetching item with ID ${id} from ${apiEndpoint}:`, error.message);
        reject(error.response); // تمرير الخطأ باستخدام reject
      });
  });
};

export const saveItem = (apiEndpoint, data, id = false) => {
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
          resolve(response.data);
          userStore.loadingApi = false;
        })
        .catch(error => {
          userStore.loadingApi = false;
          console.error(`Failed to update the item with ID ${id}:`, error.response.data.message);
          reject(error);
        });
    } else {
      apiClient
        .post(apiEndpoint, formData)
        .then(response => {
          resolve(response.data);
          userStore.loadingApi = false;
        })
        .catch(error => {
          console.error(`Failed to create a new item at endpoint: ${apiEndpoint}:`, error);
          userStore.loadingApi = false;
          reject(error);
        });
    }
  });
};

export const deleteOne = (apiEndpoint, id) => {
  return new Promise((resolve, reject) => {
    apiClient
      .delete(`${apiEndpoint}/${id}`)
      .then(response => {
        resolve(response.data.data);
      })
      .catch(error => {
        console.error(`Error deleting item with ID ${id} from ${apiEndpoint}:`, error.response.data.message);
        reject(error);
      });
  });
};

export const deleteAll = (apiEndpoint, ids) => {
  return new Promise((resolve, reject) => {
    apiClient
      .post(apiEndpoint, { user_ids: ids })
      .then(response => {
        resolve(response.data.data);
      })
      .catch(error => {
        console.error(`Error deleting multiple items from ${apiEndpoint}:`, error);
        reject(error);
      });
  });
};

export const register = (apiEndpoint, id) => {
  return new Promise((resolve, reject) => {
    apiClient
      .delete(`${apiEndpoint}/${id}`)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error(`Error deleting item with ID ${id} from ${apiEndpoint}:`, error.response.data.message);
        reject(error);
      });
  });
};
export const login = async (apiEndpoint, data) => {
  const userStore = useUserStore();
  userStore.loadingApi = true;
  try {
    const response = await apiClient.post(apiEndpoint, data);
    console.log('login', response.data);

    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    userStore.loadingApi = false;
  } catch (error) {
    console.error(`Error logging in at ${apiEndpoint}:`, error);
    userStore.loadingApi = false;
    throw error; // يمكن أن تستخدم reject هنا في حال كنت تستخدم promises
  }
};

export const logOut = apiEndpoint => {
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
        resolve(response.data);
        location.reload();
      })
      .catch(error => {
        userStore.loadingApi = false;
        console.error(`Error logging in at ${apiEndpoint}:`, error);
        reject(error);
      });
  });
};

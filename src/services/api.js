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
    // إذا كان الخطأ 401 أو رسالة Unauthenticated (انتهاء الجلسة أو التوكن غير صالح)
    if (error?.response?.status === 401 || error?.response?.data?.message === 'Unauthenticated.') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    // إذا كان الخطأ 403 أو Forbidden أو Unauthorized (لا يملك صلاحية فقط)
    if (error?.response?.status === 403 || error?.response?.data?.message === 'Forbidden' || error?.response?.data?.message === 'Unauthorized') {
      // يمكنك هنا استخدام toast أو alert حسب مكتبتك
      alert('ليس لديك صلاحية للوصول إلى هذا المورد.');
      // أو استخدم toast('ليس لديك صلاحية ...')
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const getAll = (apiEndpoint, params = null, loading = true, log = false) => {
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

export const getOne = (apiEndpoint, id, loading = true, log = false) => {
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

export const saveItem = (apiEndpoint, data, id = false, loading = true, log = false) => {
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
          toast.success('تم التعديل بنجاح!');
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
          toast.success('تم الحفظ بنجاح!');
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

export const deleteOne = (apiEndpoint, id, loading = true, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .delete(`${apiEndpoint}/${id}`)
      .then(response => {
        log ? console.log(`deleteOne:  => `, response.data) : '';
        loading ? (userStore.loadingApi = false) : '';
        toast.success('تم الحذف بنجاح!');
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

export const updateItem = (apiEndpoint, loading = true, log = false) => {
  const userStore = useUserStore();
  loading ? (userStore.loadingApi = true) : '';
  return new Promise((resolve, reject) => {
    apiClient
      .put(`${apiEndpoint}`)
      .then(response => {
        log ? console.log(`updateItem:  => `, response.data) : '';
        loading ? (userStore.loadingApi = false) : '';
        toast.success('تم التعديل بنجاح!');
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

export const deleteAll = (apiEndpoint, ids, loading = true, log = false) => {
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

export const register = (apiEndpoint, id, loading = true, log = false) => {
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
export const login = (apiEndpoint, data, loading = true, log = false) => {
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

export const logOut = (apiEndpoint, loading = true, log = false) => {
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

export function deleteItem(resource, id) {
  return axios
    .delete(`${baseURL}/${resource}/${id}`)
    .then(response => {
      toast.success('تم الحذف بنجاح!');
      return response;
    })
    .catch(error => {
      toast.error('حدث خطأ أثناء الحذف!');
      throw error;
    });
}

export function archiveItem(resource, id) {
  return axios
    .post(`${baseURL}/${resource}/${id}/archive`)
    .then(response => {
      toast.success('تم الأرشفة بنجاح!');
      return response;
    })
    .catch(error => {
      toast.error('حدث خطأ أثناء الأرشفة!');
      throw error;
    });
}

export function restoreItem(resource, id) {
  return axios
    .post(`${baseURL}/${resource}/${id}/restore`)
    .then(response => {
      toast.success('تم الاستعادة بنجاح!');
      return response;
    })
    .catch(error => {
      toast.error('حدث خطأ أثناء الاستعادة!');
      throw error;
    });
}

export async function getLocalPermissions(remotePermissions) {
  let permissionGroups = allPermissionsConfig => {
    if (!allPermissionsConfig) return [];

    const groups = [];
    for (const entityKey in allPermissionsConfig) {
      if (allPermissionsConfig.hasOwnProperty(entityKey)) {
        const entityData = allPermissionsConfig[entityKey];
        const groupName =
          entityData.name && entityData.name.label
            ? entityData.name.label
            : entityKey
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

        const permissionsInGroup = [];
        for (const actionKey in entityData) {
          if (entityData.hasOwnProperty(actionKey) && actionKey !== 'name') {
            // console.log(`actionKey permission: ${actionKey}`);

            permissionsInGroup.push({
              label: entityData[actionKey].label, // التسمية المعربة للصلاحية
              value: entityData[actionKey].key, // المفتاح الفعلي للصلاحية (الـ key)
            });
          }
        }
        groups.push({
          name: groupName,
          permissions: permissionsInGroup,
        });
      }
    }
    return groups;
  };

  const permissionsApi = await getAll('permissions');
  if (!Array.isArray(remotePermissions)) {
    console.error('Invalid remotePermissions data:', remotePermissions);
    return [];
  }
  console.log('permissionsApi:', permissionsApi);

  let permissionsLocal = permissionGroups(permissionsApi);
  return permissionsLocal
    .map(group => ({
      ...group,
      permissions: group.permissions.filter(permission => remotePermissions.includes(permission.value)),
    }))
    .filter(group => group.permissions.length > 0);
}

function permKey(permissionKey) {
  // تقسيم المفتاح المدخل إلى كيان (entity) وفعل (action)
  const parts = permissionKey.split('.', 2);
  const [entity, action] = parts;
  // التحقق مما إذا كان الكيان والفعل موجودين في كائن الصلاحيات
  if (permissionsApi[entity] && permissionsApi[entity][action] && permissionsApi[entity][action].key) {
    return permissionsApi[entity][action].key;
  }
}

function getPermissionKeys(permissionKeysArray) {
  const resolvedKeys = [];
  for (const key of permissionKeysArray) {
    try {
      const resolved = permKey(key);
      resolvedKeys.push(resolved);
    } catch (error) {
      console.warn(`تحذير: تم تجاهل مفتاح صلاحية غير صالح: ${key}. الخطأ: ${error.message}`);
    }
  }
  return resolvedKeys;
}

function resolvePermissionKeys(input) {
  // دالة مساعدة داخلية لاسترجاع مفتاح صلاحية واحد
  // (مماثلة لـ permKey الأصلية، ولكنها لا تُرمي خطأ هنا للتعامل المرن مع المصفوفات)
  const _getSinglePermissionKey = permissionKey => {
    const parts = permissionKey.split('.', 2);
    if (parts.length !== 2) {
      throw new Error(`Permission key '${permissionKey}' is not in the correct 'entity.action' format.`);
    }
    const [entity, action] = parts;
    if (permissionsApi[entity] && permissionsApi[entity][action] && permissionsApi[entity][action].key) {
      return permissionsApi[entity][action].key;
    }
    throw new Error(`Permission key '${permissionKey}' not found in permissions registry.`);
  };

  // التحقق مما إذا كان المدخل مصفوفة
  if (Array.isArray(input)) {
    const resolvedKeys = [];
    for (const key of input) {
      try {
        const resolved = _getSinglePermissionKey(key);
        resolvedKeys.push(resolved);
      } catch (error) {
        console.warn(`تحذير: تم تجاهل مفتاح صلاحية غير صالح في المصفوفة: ${key}. الخطأ: ${error.message}`);
      }
    }
    return resolvedKeys;
  } else if (typeof input === 'string') {
    // إذا كان المدخل سلسلة نصية واحدة، استخدم الدالة المساعدة مباشرة
    return _getSinglePermissionKey(input);
  } else {
    // إذا كان المدخل ليس سلسلة ولا مصفوفة، ارمِ خطأ
    throw new Error('Invalid input: Expected a string or an array of strings for permission keys.');
  }
}

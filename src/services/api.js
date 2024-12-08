import { useUserStore } from '@/stores/user'
import axios from 'axios'
const userStore = useUserStore()
const apiClient = axios.create({
  baseURL: window.location.protocol === 'https:' ? 'https://api-bill.hwnix.com/api/' : 'http://127.0.0.1:8000/api/',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json',
  },
})

export const getAll = async apiEndpoint => {
  userStore.loadengApi = true

  try {
    const response = await apiClient.get(apiEndpoint)
    userStore.loadengApi = false
    return response.data
  } catch (error) {
    console.error(`Error fetching all data from ${apiEndpoint}:`, error)
    throw new Error(`Failed to fetch all items from the endpoint: ${apiEndpoint}`)
  }
}

export const getOne = async (apiEndpoint, id) => {
  userStore.loadengApi = true
  try {
    const response = await apiClient.get(`${apiEndpoint}/${id}`)
    userStore.loadengApi = false
    return response.data
  } catch (error) {
    console.error(`Error fetching item with ID ${id} from ${apiEndpoint}:`, error)
    throw new Error(`Failed to fetch item with ID ${id} from the endpoint: ${apiEndpoint}`)
  }
}

export const saveItem = async (apiEndpoint, data, id = false) => {
  userStore.loadengApi = true
  try {
    if (id) {
      const apiEndpointIfId = `${apiEndpoint}/${id}`
      const response = await apiClient.put(apiEndpointIfId, data)
      userStore.loadengApi = false
      return response.data
    }
    const response = await apiClient.post(apiEndpoint, data)
    userStore.loadengApi = false
    return response.data
  } catch (error) {
    console.error(`Error saving data to ${apiEndpoint}:`, error)
    throw new Error(
      id ? `Failed to update the item with ID ${id}` : `Failed to create a new item at endpoint: ${apiEndpoint}`,
    )
  }
}

export const deleteOne = async (apiEndpoint, id) => {
  userStore.loadengApi = true
  try {
    const response = await apiClient.delete(`${apiEndpoint}/${id}`)
    userStore.loadengApi = false
    return response.data
  } catch (error) {
    console.error(`Error deleting item with ID ${id} from ${apiEndpoint}:`, error)
    throw new Error(`Failed to delete item with ID ${id} from the endpoint: ${apiEndpoint}`)
  }
}

export const deleteAll = async (apiEndpoint, ids) => {
  userStore.loadengApi = true
  try {
    const response = await apiClient.post(apiEndpoint, ids)
    userStore.loadengApi = false
    return response.data
  } catch (error) {
    console.error(`Error deleting multiple items from ${apiEndpoint}:`, error)
    throw new Error(`Failed to delete multiple items at endpoint: ${apiEndpoint}`)
  }
}

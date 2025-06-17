import api from '../../../api/axiosConfig';
import { ADMIN_SHELTER_ENDPOINTS } from '../../../constants/endpoints';

export const adminShelterKeluargaApi = {
  getAllKeluarga: async (params = {}) => {
    return await api.get(ADMIN_SHELTER_ENDPOINTS.KELUARGA.LIST, { params });
  },

  getKeluargaDetail: async (id) => {
    return await api.get(ADMIN_SHELTER_ENDPOINTS.KELUARGA.DETAIL(id));
  },

  createKeluarga: async (keluargaData) => {
    return await api.post(ADMIN_SHELTER_ENDPOINTS.KELUARGA.LIST, keluargaData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
  },

  updateKeluarga: async (id, keluargaData) => {
    return await api.post(ADMIN_SHELTER_ENDPOINTS.KELUARGA.DETAIL(id), keluargaData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
  },

  deleteKeluarga: async (id) => {
    return await api.delete(ADMIN_SHELTER_ENDPOINTS.KELUARGA.DETAIL(id));
  },

  getDropdownData: async () => {
    return await api.get(ADMIN_SHELTER_ENDPOINTS.KELUARGA.DROPDOWN);
  },

  getWilbinByKacab: async (kacabId) => {
    return await api.get(ADMIN_SHELTER_ENDPOINTS.KELUARGA.WILBIN_BY_KACAB(kacabId));
  },

  getShelterByWilbin: async (wilbinId) => {
    return await api.get(ADMIN_SHELTER_ENDPOINTS.KELUARGA.SHELTER_BY_WILBIN(wilbinId));
  }
};
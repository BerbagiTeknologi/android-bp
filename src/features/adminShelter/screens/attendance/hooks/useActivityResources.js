import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchKegiatanOptions,
  selectKegiatanOptions,
  selectKegiatanOptionsError,
  selectKegiatanOptionsLoading,
} from '../../../redux/aktivitasSlice';
import { adminShelterKelompokApi } from '../../../api/adminShelterKelompokApi';
import { adminShelterTutorApi } from '../../../api/adminShelterTutorApi';
import { deriveKelompokDisplayLevel } from '../utils/activityFormUtils';

const defaultLoadingState = { kelompok: false, tutor: false };
const defaultErrorState = { kelompok: null, tutor: null };

const useActivityResources = ({
  activity,
  isEditing,
  formData,
  setFormData,
}) => {
  const dispatch = useDispatch();

  const kegiatanOptions = useSelector(selectKegiatanOptions);
  const kegiatanOptionsLoading = useSelector(selectKegiatanOptionsLoading);
  const kegiatanOptionsError = useSelector(selectKegiatanOptionsError);

  const [kelompokList, setKelompokList] = useState([]);
  const [tutorList, setTutorList] = useState([]);
  const [loadingStates, setLoadingStates] = useState(defaultLoadingState);
  const [errors, setErrors] = useState(defaultErrorState);

  const hasSelectedKegiatan = useMemo(
    () => Boolean(formData.id_kegiatan),
    [formData.id_kegiatan],
  );

  const fetchData = useCallback(async (apiCall, applyData, key) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));

    try {
      const response = await apiCall();
      applyData(response.data?.data || []);
    } catch (err) {
      console.error(`Error mengambil ${key}:`, err);
      setErrors(prev => ({ ...prev, [key]: `Gagal memuat data ${key}` }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const fetchTutorData = useCallback(
    () => fetchData(
      adminShelterTutorApi.getActiveTutors,
      setTutorList,
      'tutor',
    ),
    [fetchData],
  );

  const fetchKelompokData = useCallback(
    () => fetchData(
      adminShelterKelompokApi.getAllKelompok,
      (data) => {
        setKelompokList(data);

        if (isEditing && formData.nama_kelompok) {
          const match = data.find(k => k.nama_kelompok === formData.nama_kelompok);
          if (match) {
            setFormData(prev => ({
              ...prev,
              selectedKelompokId: match.id_kelompok,
              selectedKelompokObject: match,
              level: deriveKelompokDisplayLevel(match),
            }));
          }
        }
      },
      'kelompok',
    ),
    [fetchData, formData.nama_kelompok, isEditing, setFormData],
  );

  const refetchKegiatanOptions = useCallback(
    () => dispatch(fetchKegiatanOptions()),
    [dispatch],
  );

  useEffect(() => {
    if (!kegiatanOptions.length && !kegiatanOptionsLoading) {
      dispatch(fetchKegiatanOptions());
    }
  }, [dispatch, kegiatanOptions.length, kegiatanOptionsLoading]);

  useEffect(() => {
    fetchTutorData();
  }, [fetchTutorData]);

  useEffect(() => {
    if (
      isEditing &&
      activity &&
      !formData.id_kegiatan &&
      kegiatanOptions.length > 0
    ) {
      const matched = kegiatanOptions.find(
        option => option.id_kegiatan === activity.id_kegiatan ||
          option.nama_kegiatan === activity.jenis_kegiatan,
      );

      if (matched) {
        setFormData(prev => ({
          ...prev,
          id_kegiatan: matched.id_kegiatan,
          jenis_kegiatan: matched.nama_kegiatan,
        }));
      }
    }
  }, [activity, formData.id_kegiatan, isEditing, kegiatanOptions, setFormData]);

  useEffect(() => {
    if (hasSelectedKegiatan && !kelompokList.length && !loadingStates.kelompok) {
      fetchKelompokData();
    }
  }, [fetchKelompokData, hasSelectedKegiatan, kelompokList.length, loadingStates.kelompok]);

  useEffect(() => {
    if (
      !isEditing ||
      !formData.nama_kelompok ||
      formData.selectedKelompokId ||
      !kelompokList.length
    ) {
      return;
    }

    const match = kelompokList.find(k => k.nama_kelompok === formData.nama_kelompok);
    if (match) {
      setFormData(prev => ({
        ...prev,
        selectedKelompokId: match.id_kelompok,
        selectedKelompokObject: match,
        level: deriveKelompokDisplayLevel(match),
      }));
    }
  }, [formData.nama_kelompok, formData.selectedKelompokId, kelompokList, isEditing, setFormData]);

  return {
    kegiatanOptions,
    kegiatanOptionsLoading,
    kegiatanOptionsError,
    kelompokList,
    tutorList,
    loadingStates,
    errors,
    fetchTutorData,
    fetchKelompokData,
    refetchKegiatanOptions,
  };
};

export default useActivityResources;

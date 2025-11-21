import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import PickerInput from '../../../common/components/PickerInput';
import TextInput from '../../../common/components/TextInput';
import Button from '../../../common/components/Button';
import ErrorMessage from '../../../common/components/ErrorMessage';
import { superAdminUserApi } from '../api/superAdminUserApi';
import { USER_ROLES } from '../../../constants/config';
import { selectUser } from '../../auth/redux/authSlice';

const ROLE_OPTIONS = [
  { label: 'Super Admin', value: USER_ROLES.SUPER_ADMIN },
  { label: 'Admin Pusat', value: USER_ROLES.ADMIN_PUSAT },
  { label: 'Admin Cabang', value: USER_ROLES.ADMIN_CABANG },
  { label: 'Admin Shelter', value: USER_ROLES.ADMIN_SHELTER },
  { label: 'Donatur', value: USER_ROLES.DONATUR },
];

const STATUS_OPTIONS = [
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Tidak Aktif', value: 'Tidak Aktif' },
];

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  try {
    return new Date(value).toLocaleString('id-ID');
  } catch (error) {
    return value;
  }
};

const SuperAdminUserFormScreen = ({ route, navigation }) => {
  const { userId } = route.params ?? {};
  const authUser = useSelector(selectUser);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Aktif');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [profileForm, setProfileForm] = useState({
    namaLengkap: '',
    alamat: '',
    noHp: '',
  });
  const [selectedKacab, setSelectedKacab] = useState('');
  const [selectedWilbin, setSelectedWilbin] = useState('');
  const [selectedShelter, setSelectedShelter] = useState('');
  const [kacabOptions, setKacabOptions] = useState([]);
  const [wilbinOptions, setWilbinOptions] = useState([]);
  const [shelterOptions, setShelterOptions] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState({
    kacabs: false,
    wilbins: false,
    shelters: false,
  });
  const prefillingRef = useRef(false);

  const resolvedAuthId =
    authUser?.id ?? authUser?.id_users ?? null;
  const resolvedTargetId = userId ?? null;
  const isSelfModification =
    resolvedAuthId !== null &&
    resolvedTargetId !== null &&
    String(resolvedAuthId) === String(resolvedTargetId);

  const parsePayload = (payload) => payload?.data ?? payload;

  const requiresProfileFields = useMemo(
    () =>
      [
        USER_ROLES.ADMIN_PUSAT,
        USER_ROLES.ADMIN_CABANG,
        USER_ROLES.ADMIN_SHELTER,
      ].includes(role),
    [role]
  );

  const requiresCabang = useMemo(
    () => [USER_ROLES.ADMIN_CABANG, USER_ROLES.ADMIN_SHELTER].includes(role),
    [role]
  );

  const requiresWilbin = useMemo(
    () => role === USER_ROLES.ADMIN_SHELTER,
    [role]
  );

  const requiresShelter = requiresWilbin;

  const shouldSendProfile = requiresProfileFields || requiresCabang || requiresWilbin;

  const extractList = (payload) => {
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    return [];
  };

  const clearFieldError = useCallback((key) => {
    setFieldErrors((prev) => {
      if (!prev || !prev[key]) {
        return prev;
      }

      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const applyProfileFromPayload = useCallback((profilePayload) => {
    const profileData = profilePayload || {};
    setProfileForm({
      namaLengkap:
        profileData?.nama_lengkap ??
        profileData?.nama ??
        profileData?.nama_lengkap_adm ??
        '',
      alamat:
        profileData?.alamat ??
        profileData?.alamat_adm ??
        '',
      noHp: profileData?.no_hp ?? '',
    });

    prefillingRef.current = true;
    setSelectedKacab(
      profileData?.id_kacab ? String(profileData.id_kacab) : ''
    );
    setSelectedWilbin(
      profileData?.id_wilbin ? String(profileData.id_wilbin) : ''
    );
    setSelectedShelter(
      profileData?.id_shelter ? String(profileData.id_shelter) : ''
    );
    setTimeout(() => {
      prefillingRef.current = false;
    }, 0);
  }, []);

  const handleProfileChange = useCallback(
    (field, value) => {
      setProfileForm((prev) => ({
        ...prev,
        [field]: value,
      }));
      clearFieldError(field);
      setFormError(null);
    },
    [clearFieldError]
  );

  const handleRoleChange = useCallback(
    (value) => {
      setRole(value);
      setFormError(null);
      setFieldErrors({});

      if (![USER_ROLES.ADMIN_CABANG, USER_ROLES.ADMIN_SHELTER].includes(value)) {
        setSelectedKacab('');
      }

      if (value !== USER_ROLES.ADMIN_SHELTER) {
        setSelectedWilbin('');
        setSelectedShelter('');
      }
    },
    []
  );

  const handleKacabChange = useCallback(
    (value) => {
      setSelectedKacab(value);
      clearFieldError('id_kacab');
      setFormError(null);
    },
    [clearFieldError]
  );

  const handleWilbinChange = useCallback(
    (value) => {
      setSelectedWilbin(value);
      clearFieldError('id_wilbin');
      setFormError(null);
    },
    [clearFieldError]
  );

  const handleShelterChange = useCallback(
    (value) => {
      setSelectedShelter(value);
      clearFieldError('id_shelter');
      setFormError(null);
    },
    [clearFieldError]
  );

  const updateDropdownLoading = useCallback((key, nextValue) => {
    setDropdownLoading((prev) => ({
      ...prev,
      [key]: nextValue,
    }));
  }, []);

  const fetchKacabs = useCallback(async () => {
    updateDropdownLoading('kacabs', true);
    try {
      const response = await superAdminUserApi.listKacabs();
      const list = extractList(response.data);
      setKacabOptions(
        list.map((item) => ({
          label: item.nama_kacab || item.nama_cabang || `Cabang ${item.id_kacab}`,
          value: String(item.id_kacab),
        }))
      );
    } catch (err) {
      console.error('Gagal memuat daftar cabang:', err);
    } finally {
      updateDropdownLoading('kacabs', false);
    }
  }, [updateDropdownLoading]);

  const fetchWilbins = useCallback(
    async (kacabId, { resetSelection = true } = {}) => {
      if (!kacabId) {
        setWilbinOptions([]);
        if (resetSelection) {
          setSelectedWilbin('');
          setSelectedShelter('');
        }
        return;
      }

      updateDropdownLoading('wilbins', true);
      try {
        const response = await superAdminUserApi.listWilbins(kacabId);
        const list = extractList(response.data);
        setWilbinOptions(
          list.map((item) => ({
            label: item.nama_wilbin || `Wilbin ${item.id_wilbin}`,
            value: String(item.id_wilbin),
          }))
        );
        if (resetSelection) {
          setSelectedWilbin('');
          setSelectedShelter('');
        }
      } catch (err) {
        console.error('Gagal memuat daftar wilbin:', err);
      } finally {
        updateDropdownLoading('wilbins', false);
      }
    },
    [updateDropdownLoading]
  );

  const fetchShelters = useCallback(
    async (wilbinId, { resetSelection = true } = {}) => {
      if (!wilbinId) {
        setShelterOptions([]);
        if (resetSelection) {
          setSelectedShelter('');
        }
        return;
      }

      updateDropdownLoading('shelters', true);
      try {
        const response = await superAdminUserApi.listShelters(wilbinId);
        const list = extractList(response.data);
        setShelterOptions(
          list.map((item) => ({
            label: item.nama_shelter || `Shelter ${item.id_shelter}`,
            value: String(item.id_shelter),
          }))
        );
        if (resetSelection) {
          setSelectedShelter('');
        }
      } catch (err) {
        console.error('Gagal memuat daftar shelter:', err);
      } finally {
        updateDropdownLoading('shelters', false);
      }
    },
    [updateDropdownLoading]
  );

  const validateProfile = useCallback(() => {
    const errors = {};

    const trimmedNama = profileForm.namaLengkap?.trim();
    const trimmedAlamat = profileForm.alamat?.trim();
    const trimmedNoHp = profileForm.noHp?.trim();

    if (requiresProfileFields) {
      if (!trimmedNama) {
        errors.nama_lengkap = 'Nama lengkap wajib diisi.';
      }

      if (!trimmedAlamat) {
        errors.alamat = 'Alamat wajib diisi.';
      }

      if (!trimmedNoHp) {
        errors.no_hp = 'Nomor HP wajib diisi.';
      }
    }

    if (requiresCabang && !selectedKacab) {
      errors.id_kacab = 'Cabang wajib dipilih.';
    }

    if (requiresWilbin && !selectedWilbin) {
      errors.id_wilbin = 'Wilayah binaan wajib dipilih.';
    }

    if (requiresShelter && !selectedShelter) {
      errors.id_shelter = 'Shelter wajib dipilih.';
    }

    return errors;
  }, [
    profileForm.alamat,
    profileForm.namaLengkap,
    profileForm.noHp,
    requiresCabang,
    requiresProfileFields,
    requiresShelter,
    requiresWilbin,
    selectedKacab,
    selectedShelter,
    selectedWilbin,
  ]);

  const toNumberOrNull = (value) => {
    if (!value) {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const loadUser = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setLoading(true);
      const response = await superAdminUserApi.show(userId);
      const payload = parsePayload(response.data);
      setUser(payload);
      setRole(payload?.level || '');
      setStatus(payload?.status || 'Aktif');
      applyProfileFromPayload(payload?.profile);
      setFieldErrors({});
      setError(null);
    } catch (err) {
      console.error('Gagal memuat detail user:', err);
      const message =
        err.response?.data?.message || 'Tidak bisa memuat detail pengguna.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, applyProfileFromPayload]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    fetchKacabs();
  }, [fetchKacabs]);

  useEffect(() => {
    if (!selectedKacab) {
      setWilbinOptions([]);
      if (!prefillingRef.current) {
        setSelectedWilbin('');
        setSelectedShelter('');
      }
      return;
    }

    fetchWilbins(selectedKacab, { resetSelection: !prefillingRef.current });
  }, [selectedKacab, fetchWilbins]);

  useEffect(() => {
    if (!selectedWilbin) {
      setShelterOptions([]);
      if (!prefillingRef.current) {
        setSelectedShelter('');
      }
      return;
    }

    fetchShelters(selectedWilbin, { resetSelection: !prefillingRef.current });
  }, [selectedWilbin, fetchShelters]);

  const handleSubmit = async () => {
    if (isSelfModification) {
      Alert.alert(
        'Tidak Diizinkan',
        'Anda tidak dapat mengubah role atau status akun sendiri.'
      );
      return;
    }

    if (!role) {
      setFormError('Role wajib dipilih.');
      return;
    }

    const validationErrors = validateProfile();

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError('Lengkapi data wajib sebelum menyimpan.');
      return;
    }

    const profilePayload = {
      nama_lengkap: profileForm.namaLengkap?.trim() || null,
      alamat: profileForm.alamat?.trim() || null,
      no_hp: profileForm.noHp?.trim() || null,
      id_kacab: toNumberOrNull(selectedKacab),
      id_wilbin: toNumberOrNull(selectedWilbin),
      id_shelter: toNumberOrNull(selectedShelter),
    };

    const requestBody = {
      level: role,
      status,
    };

    if (shouldSendProfile) {
      requestBody.profile = profilePayload;
    }

    try {
      setSaving(true);
      const response = await superAdminUserApi.update(userId, requestBody);
      const payload = parsePayload(response.data);
      setUser(payload);
      applyProfileFromPayload(payload?.profile);
      setFieldErrors({});
      setFormError(null);
      Alert.alert('Berhasil', 'Perubahan role tersimpan.');
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (err) {
      console.error('Gagal menyimpan role:', err);
      const message =
        err.response?.data?.message || 'Perubahan role gagal disimpan.';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#9b59b6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <ErrorMessage message={error} visible onRetry={loadUser} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Nama</Text>
        <Text style={styles.value}>{user?.username || '-'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || '-'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>SSO SUB</Text>
        <Text style={styles.value}>{user?.token_api || '-'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Terakhir diperbarui</Text>
        <Text style={styles.value}>{formatDate(user?.updated_at)}</Text>
      </View>

      {isSelfModification && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Anda tidak dapat mengubah role atau status akun sendiri.
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <PickerInput
          label="Role Lokal"
          value={role}
          onValueChange={handleRoleChange}
          items={ROLE_OPTIONS}
          placeholder="Pilih role"
          pickerProps={{ enabled: !isSelfModification }}
        />
      </View>

      <View style={styles.section}>
        <PickerInput
          label="Status"
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setFormError(null);
          }}
          items={STATUS_OPTIONS}
          placeholder="Pilih status"
          pickerProps={{ enabled: !isSelfModification }}
        />
      </View>

      {requiresProfileFields && (
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Informasi Profil</Text>
          <TextInput
            label="Nama Lengkap"
            value={profileForm.namaLengkap}
            onChangeText={(text) => handleProfileChange('namaLengkap', text)}
            error={fieldErrors.nama_lengkap}
            disabled={isSelfModification}
          />
          <TextInput
            label="Alamat"
            value={profileForm.alamat}
            onChangeText={(text) => handleProfileChange('alamat', text)}
            error={fieldErrors.alamat}
            disabled={isSelfModification}
            multiline
            inputProps={{ numberOfLines: 3 }}
          />
          <TextInput
            label="Nomor HP"
            value={profileForm.noHp}
            onChangeText={(text) => handleProfileChange('noHp', text)}
            error={fieldErrors.no_hp}
            disabled={isSelfModification}
            inputProps={{ keyboardType: 'phone-pad' }}
          />
        </View>
      )}

      {requiresCabang && (
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Penempatan Cabang</Text>
          <PickerInput
            label="Cabang"
            value={selectedKacab}
            onValueChange={handleKacabChange}
            items={kacabOptions}
            placeholder={
              dropdownLoading.kacabs ? 'Memuat cabang...' : 'Pilih cabang'
            }
            error={fieldErrors.id_kacab}
            pickerProps={{
              enabled:
                !isSelfModification &&
                !dropdownLoading.kacabs &&
                kacabOptions.length > 0,
            }}
          />
          {dropdownLoading.kacabs && (
            <Text style={styles.helperText}>Memuat daftar cabang...</Text>
          )}
        </View>
      )}

      {requiresWilbin && (
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>Wilayah Binaan & Shelter</Text>
          <PickerInput
            label="Wilayah Binaan"
            value={selectedWilbin}
            onValueChange={handleWilbinChange}
            items={wilbinOptions}
            placeholder={
              dropdownLoading.wilbins
                ? 'Memuat wilayah binaan...'
                : 'Pilih wilayah binaan'
            }
            error={fieldErrors.id_wilbin}
            pickerProps={{
              enabled:
                !isSelfModification &&
                !!selectedKacab &&
                !dropdownLoading.wilbins &&
                wilbinOptions.length > 0,
            }}
          />
          {dropdownLoading.wilbins && (
            <Text style={styles.helperText}>Memuat daftar wilayah binaan...</Text>
          )}
          <PickerInput
            label="Shelter"
            value={selectedShelter}
            onValueChange={handleShelterChange}
            items={shelterOptions}
            placeholder={
              dropdownLoading.shelters
                ? 'Memuat shelter...'
                : 'Pilih shelter'
            }
            error={fieldErrors.id_shelter}
            pickerProps={{
              enabled:
                !isSelfModification &&
                !!selectedWilbin &&
                !dropdownLoading.shelters &&
                shelterOptions.length > 0,
            }}
          />
          {dropdownLoading.shelters && (
            <Text style={styles.helperText}>Memuat daftar shelter...</Text>
          )}
        </View>
      )}

      {formError && (
        <ErrorMessage
          message={formError}
          visible
          onRetry={() => setFormError(null)}
          retryText="Tutup"
        />
      )}

      <Button
        title="Simpan Perubahan"
        onPress={handleSubmit}
        loading={saving}
        disabled={isSelfModification}
        fullWidth
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionGroup: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  notice: {
    backgroundColor: '#fff8e6',
    borderColor: '#f4d03f',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 13,
    color: '#a67c00',
    lineHeight: 18,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default SuperAdminUserFormScreen;

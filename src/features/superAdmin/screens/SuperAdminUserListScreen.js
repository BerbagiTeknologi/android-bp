import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { superAdminUserApi } from '../api/superAdminUserApi';
import Button from '../../../common/components/Button';
import ErrorMessage from '../../../common/components/ErrorMessage';
import { useAuth } from '../../../common/hooks/useAuth';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin_pusat: 'Admin Pusat',
  admin_cabang: 'Admin Cabang',
  admin_shelter: 'Admin Shelter',
  donatur: 'Donatur',
  siswa: 'Siswa',
};

const SuperAdminUserListScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [showDirectory, setShowDirectory] = useState(false);
  const [ssoUsers, setSsoUsers] = useState([]);
  const [ssoSearch, setSsoSearch] = useState('');
  const [ssoLoading, setSsoLoading] = useState(false);
  const [ssoError, setSsoError] = useState(null);
  const [importingSub, setImportingSub] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const extractList = (payload) => {
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    return [];
  };

  const fetchUsers = useCallback(
    async (override = {}) => {
      const query = {
        search: (override.search ?? search) || undefined,
        per_page: 25,
      };

      try {
        if (!override.silent) {
          setLoading(true);
        }
        const response = await superAdminUserApi.list(query);
        const items = extractList(response.data);
        setUsers(items);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        const message =
          err.response?.data?.message || 'Gagal memuat daftar pengguna.';
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search]
  );

  useFocusEffect(
    useCallback(() => {
      fetchUsers({ search: '' });
    }, [fetchUsers])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers({ silent: true });
  };

  const handleSearch = () => {
    fetchUsers({ search });
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchUsers({ search: '' });
  };

  const handleLogout = useCallback(async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const result = await logout();

      if (result?.success === false && result?.message) {
        Alert.alert(
          'Logout Kilau SSO',
          `${result.message}\nSesi lokal sudah dibersihkan oleh aplikasi.`,
          [{ text: 'Mengerti' }]
        );
      }
    } finally {
      if (isMountedRef.current) {
        setLoggingOut(false);
      }
    }
  }, [loggingOut, logout]);

  const handleConfirmLogout = useCallback(() => {
    if (loggingOut) {
      return;
    }

    Alert.alert(
      'Keluar dari Kilau SSO',
      'Anda akan keluar sebagai super admin. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: handleLogout },
      ]
    );
  }, [handleLogout, loggingOut]);

  const fetchSsoUsers = useCallback(
    async (override = {}) => {
      const query = {
        search: (override.search ?? ssoSearch) || undefined,
      };

      try {
        setSsoLoading(true);
        const response = await superAdminUserApi.listSsoDirectory(query);
        const items = extractList(response.data);
        setSsoUsers(items);
        setSsoError(null);
      } catch (err) {
        console.error('Failed to fetch SSO directory:', err);
        const message =
          err.response?.data?.message ||
          'Gagal memuat daftar pengguna dari IdP.';
        setSsoError(message);
      } finally {
        setSsoLoading(false);
      }
    },
    [ssoSearch]
  );

  const handleToggleDirectory = () => {
    const next = !showDirectory;
    setShowDirectory(next);

    if (next && ssoUsers.length === 0 && !ssoLoading) {
      fetchSsoUsers();
    }
  };

  const handleImport = async (sub) => {
    try {
      setImportingSub(sub);
      await superAdminUserApi.importFromSso(sub);
      await fetchUsers({ silent: true });
      await fetchSsoUsers({ search: ssoSearch });
      setSsoError(null);
    } catch (err) {
      console.error('Failed to import user:', err);
      const message =
        err.response?.data?.message ||
        'Gagal mengimpor pengguna dari IdP.';
      setSsoError(message);
    } finally {
      setImportingSub(null);
    }
  };

  const renderSsoItem = ({ item }) => (
    <View style={styles.ssoCard} key={item.sub}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name || 'Tanpa Nama'}</Text>
        <View
          style={[
            styles.badge,
            item.status === 'active' ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              item.status === 'active' ? styles.activeText : styles.inactiveText,
            ]}
          >
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardEmail}>{item.email || '-'}</Text>
      <Text style={styles.subtleMeta}>
        SUB: <Text style={styles.highlight}>{item.sub}</Text>
      </Text>
      <View style={styles.ssoActions}>
        <View
          style={[
            styles.badge,
            item.exists_locally ? styles.syncedBadge : styles.roleBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              item.exists_locally ? styles.syncedText : styles.highlight,
            ]}
          >
            {item.exists_locally ? 'Sudah Ada' : 'Belum Ada'}
          </Text>
        </View>
        {!item.exists_locally && (
          <Button
            title="Import"
            size="small"
            onPress={() => handleImport(item.sub)}
            loading={importingSub === item.sub}
          />
        )}
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('SuperAdminUserForm', { userId: item.id_users })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{item.username || 'Tanpa Nama'}</Text>
          <View style={styles.ssoBadge}>
            <Text style={styles.ssoBadgeText}>SSO</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#bdc3c7" />
      </View>
      <Text style={styles.cardEmail}>{item.email || '-'}</Text>
      <View style={styles.cardMeta}>
        <View style={[styles.badge, styles.roleBadge]}>
          <Text style={styles.badgeText}>
            {ROLE_LABELS[item.level] || item.level || 'Tidak diketahui'}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            item.status === 'Aktif' ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              item.status === 'Aktif' ? styles.activeText : styles.inactiveText,
            ]}
          >
            {item.status || 'Tidak Aktif'}
          </Text>
        </View>
      </View>
      <Text style={styles.subtleMeta}>
        SSO SUB: <Text style={styles.highlight}>{item.token_api || '-'}</Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Kelola Super Admin</Text>
          <Text style={styles.headerSubtitle}>
            Pantau akun Kilau SSO dan sinkronisasi pengguna
          </Text>
        </View>
        <Button
          title="Keluar"
          type="danger"
          size="small"
          onPress={handleConfirmLogout}
          loading={loggingOut}
          disabled={loggingOut}
          style={styles.logoutButton}
        />
      </View>
      <View style={styles.infoBanner}>
        <Ionicons name="shield-checkmark" size={20} color="#2c3e50" />
        <Text style={styles.infoBannerText}>
          Daftar ini hanya menampilkan akun yang sudah autentikasi via Kilau SSO.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.infoBanner,
          { backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe' },
        ]}
        onPress={handleToggleDirectory}
        activeOpacity={0.8}
      >
        <Ionicons name="cloud-download-outline" size={20} color="#1d4ed8" />
        <Text style={styles.infoBannerText}>
          {showDirectory
            ? 'Sembunyikan user IdP'
            : 'Tampilkan user IdP untuk import sebelum login'}
        </Text>
        <Ionicons
          name={showDirectory ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#1d4ed8"
        />
      </TouchableOpacity>

      {showDirectory && (
        <View style={styles.ssoSection}>
          <Text style={styles.sectionTitle}>Direktori IdP</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama/email IdP"
              value={ssoSearch}
              onChangeText={setSsoSearch}
              returnKeyType="search"
              onSubmitEditing={() => fetchSsoUsers({ search: ssoSearch })}
            />
            <Button
              title="Cari"
              size="small"
              onPress={() => fetchSsoUsers({ search: ssoSearch })}
              style={styles.searchButton}
            />
            <Button
              title="Reset"
              type="secondary"
              size="small"
              onPress={() => {
                setSsoSearch('');
                fetchSsoUsers({ search: '' });
              }}
            />
          </View>
          {ssoError && (
            <ErrorMessage
              message={ssoError}
              visible
              onRetry={() => fetchSsoUsers({ search: ssoSearch })}
            />
          )}
          {ssoLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : ssoUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Tidak ada user IdP yang cocok.</Text>
            </View>
          ) : (
            <View>{ssoUsers.map((item) => renderSsoItem({ item }))}</View>
          )}
        </View>
      )}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama, email, atau SUB"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Button
          title="Cari"
          onPress={handleSearch}
          style={styles.searchButton}
          size="small"
        />
        <Button
          title="Reset"
          type="secondary"
          onPress={handleClearSearch}
          style={styles.searchButton}
          size="small"
        />
      </View>

      {error && (
        <ErrorMessage message={error} visible onRetry={fetchUsers} />
      )}

      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#9b59b6" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) =>
            (item.id_users && String(item.id_users)) || `user-${index}`
          }
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark" size={48} color="#bdc3c7" />
              <Text style={styles.emptyText}>
                Belum ada user Kilau SSO yang disinkronkan.
              </Text>
            </View>
          }
          contentContainerStyle={
            users.length === 0 ? styles.emptyContainer : undefined
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f6fb',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  headerTextGroup: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  logoutButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: '#eef3ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  infoBannerText: {
    flex: 1,
    color: '#2c3e50',
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  searchButton: {
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  ssoBadge: {
    backgroundColor: '#dff5e5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  ssoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1f8a4c',
    textTransform: 'uppercase',
  },
  cardEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleBadge: {
    backgroundColor: '#f0f3ff',
  },
  activeBadge: {
    backgroundColor: '#eafaf1',
  },
  inactiveBadge: {
    backgroundColor: '#fdecea',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#27ae60',
  },
  inactiveText: {
    color: '#c0392b',
  },
  subtleMeta: {
    marginTop: 8,
    fontSize: 12,
    color: '#95a5a6',
  },
  highlight: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
  },
  ssoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  ssoCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9fafb',
  },
  ssoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  syncedBadge: {
    backgroundColor: '#e0f2fe',
  },
  syncedText: {
    color: '#0369a1',
  },
});

export default SuperAdminUserListScreen;

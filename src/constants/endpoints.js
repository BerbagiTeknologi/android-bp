export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  USER: '/auth/user'
};

export const ADMIN_PUSAT_ENDPOINTS = {
  DASHBOARD: '/admin-pusat/dashboard',
  PROFILE: '/admin-pusat/profile',
  ANAK: {
    LIST: '/admin-pusat/anak',
    DETAIL: (id) => `/admin-pusat/anak/${id}`,
    TOGGLE_STATUS: (id) => `/admin-pusat/anak/${id}/toggle-status`,
    SUMMARY: '/admin-pusat/anak-summary'
  },
  RAPORT: {
    LIST: (childId) => `/admin-pusat/anak/${childId}/raport`,
    DETAIL: (childId, raportId) => `/admin-pusat/anak/${childId}/raport/${raportId}`
  },
  PRESTASI: {
    LIST: (childId) => `/admin-pusat/anak/${childId}/prestasi`,
    DETAIL: (childId, prestasiId) => `/admin-pusat/anak/${childId}/prestasi/${prestasiId}`
  },
  RIWAYAT: {
    LIST: (childId) => `/admin-pusat/anak/${childId}/riwayat`,
    DETAIL: (childId, riwayatId) => `/admin-pusat/anak/${childId}/riwayat/${riwayatId}`
  },
  KELUARGA: {
  LIST: '/admin-pusat/keluarga',
  DETAIL: (id) => `/admin-pusat/keluarga/${id}`,
  DROPDOWN: '/admin-pusat/keluarga-dropdown',
  WILBIN_BY_KACAB: (kacabId) => `/admin-pusat/keluarga-wilbin/${kacabId}`,
  SHELTER_BY_WILBIN: (wilbinId) => `/admin-pusat/keluarga-shelter/${wilbinId}`
}
};

export const ADMIN_CABANG_ENDPOINTS = {
  DASHBOARD: '/admin-cabang/dashboard',
  PROFILE: '/admin-cabang/profile',
  SURVEY_APPROVAL: {
    LIST: '/admin-cabang/survey-approval',
    STATS: '/admin-cabang/survey-approval/stats',
    DETAIL: (id) => `/admin-cabang/survey-approval/${id}`,
    APPROVE: (id) => `/admin-cabang/survey-approval/${id}/approve`,
    REJECT: (id) => `/admin-cabang/survey-approval/${id}/reject`
  },
  PENGAJUAN_DONATUR: {
  CPB_CHILDREN: '/admin-cabang/pengajuan-donatur/cpb-children',
  AVAILABLE_DONATUR: '/admin-cabang/pengajuan-donatur/available-donatur',
  ASSIGN_DONATUR: '/admin-cabang/pengajuan-donatur/assign-donatur',
  CHILD_DETAIL: (id) => `/admin-cabang/pengajuan-donatur/child-detail/${id}`
}
};

export const ADMIN_SHELTER_ENDPOINTS = {
  DASHBOARD: '/admin-shelter/dashboard',
  PROFILE: '/admin-shelter/profile',
  ANAK: {
    LIST: '/admin-shelter/anak',
    DETAIL: (id) => `/admin-shelter/anak/${id}`,
    TOGGLE_STATUS: (id) => `/admin-shelter/anak/${id}/toggle-status`
  },
  RAPORT: {
    LIST: (childId) => `/admin-shelter/anak/${childId}/raport`,
    CREATE: (childId) => `/admin-shelter/anak/${childId}/raport/create`,
    DETAIL: (childId, raportId) => `/admin-shelter/anak/${childId}/raport/${raportId}`,
    UPDATE: (childId, raportId) => `/admin-shelter/anak/${childId}/raport/${raportId}/update`
  },
 PRESTASI: {
  LIST: (childId) => `/admin-shelter/anak/${childId}/prestasi`,
  CREATE: (childId) => `/admin-shelter/anak/${childId}/prestasi`,
  DETAIL: (childId, prestasiId) => `/admin-shelter/anak/${childId}/prestasi/${prestasiId}`,
  UPDATE: (childId, prestasiId) => `/admin-shelter/anak/${childId}/prestasi/${prestasiId}`,
  DELETE: (childId, prestasiId) => `/admin-shelter/anak/${childId}/prestasi/${prestasiId}`
},

RIWAYAT: {
  LIST: (childId) => `/admin-shelter/anak/${childId}/riwayat`,
  CREATE: (childId) => `/admin-shelter/anak/${childId}/riwayat`,
  DETAIL: (childId, riwayatId) => `/admin-shelter/anak/${childId}/riwayat/${riwayatId}`,
  UPDATE: (childId, riwayatId) => `/admin-shelter/anak/${childId}/riwayat/${riwayatId}`,
  DELETE: (childId, riwayatId) => `/admin-shelter/anak/${childId}/riwayat/${riwayatId}`
},
TUTOR: {
    LIST: '/admin-shelter/tutor',
    DETAIL: (id) => `/admin-shelter/tutor/${id}`,
    CREATE: '/admin-shelter/tutor',
    UPDATE: (id) => `/admin-shelter/tutor/${id}`
},
 KELOMPOK: {
    LIST: '/admin-shelter/kelompok',
    DETAIL: (id) => `/admin-shelter/kelompok/${id}`,
    LEVELS: '/admin-shelter/kelompok-levels',
    AVAILABLE_CHILDREN: (shelterId) => `/admin-shelter/kelompok/available-children/${shelterId}`,
    GROUP_CHILDREN: (kelompokId) => `/admin-shelter/kelompok/${kelompokId}/children`,
    ADD_CHILD: (kelompokId) => `/admin-shelter/kelompok/${kelompokId}/add-child`,
    REMOVE_CHILD: (kelompokId, childId) => `/admin-shelter/kelompok/${kelompokId}/remove-child/${childId}`,
    MOVE_CHILD: (childId) => `/admin-shelter/move-child/${childId}`
  },
  KELUARGA: {
  LIST: '/admin-shelter/keluarga',
  DETAIL: (id) => `/admin-shelter/keluarga/${id}`,
  DROPDOWN: '/admin-shelter/keluarga-dropdown',
  WILBIN_BY_KACAB: (kacabId) => `/admin-shelter/keluarga-wilbin/${kacabId}`,
  SHELTER_BY_WILBIN: (wilbinId) => `/admin-shelter/keluarga-shelter/${wilbinId}`
},
PENGAJUAN_ANAK: {
  SEARCH_KELUARGA: '/admin-shelter/pengajuan-anak/search-keluarga',
  VALIDATE_KK: '/admin-shelter/pengajuan-anak/validate-kk',
  SUBMIT: '/admin-shelter/pengajuan-anak/submit'
},

AKTIVITAS: {
  LIST: '/admin-shelter/aktivitas',
  DETAIL: (id) => `/admin-shelter/aktivitas/${id}`,
  CREATE: '/admin-shelter/aktivitas'
},
SURAT: {
  LIST: (childId) => `/admin-shelter/anak/${childId}/surat`,
  CREATE: (childId) => `/admin-shelter/anak/${childId}/surat`,
  DETAIL: (childId, suratId) => `/admin-shelter/anak/${childId}/surat/${suratId}`,
  UPDATE: (childId, suratId) => `/admin-shelter/anak/${childId}/surat/${suratId}`,
  DELETE: (childId, suratId) => `/admin-shelter/anak/${childId}/surat/${suratId}`,
  MARK_READ: (childId, suratId) => `/admin-shelter/anak/${childId}/surat/${suratId}/read`
},
RAPORT_FORMAL: {
  LIST: (childId) => `/admin-shelter/anak/${childId}/raport-formal`,
  CREATE: (childId) => `/admin-shelter/anak/${childId}/raport-formal`,
  DETAIL: (childId, raportId) => `/admin-shelter/anak/${childId}/raport-formal/${raportId}`,
  UPDATE: (childId, raportId) => `/admin-shelter/anak/${childId}/raport-formal/${raportId}`,
  DELETE: (childId, raportId) => `/admin-shelter/anak/${childId}/raport-formal/${raportId}`
},
};

export const DONATUR_ENDPOINTS = {
  DASHBOARD: '/donatur/dashboard',
  PROFILE: '/donatur/profile',
  CHILDREN: '/donatur/children',
  CHILD_DETAIL: (childId) => `/donatur/children/${childId}`,
  
  SURAT: {
    LIST: (childId) => `/donatur/children/${childId}/surat`,
    CREATE: (childId) => `/donatur/children/${childId}/surat`,
    DETAIL: (childId, suratId) => `/donatur/children/${childId}/surat/${suratId}`,
    MARK_READ: (childId, suratId) => `/donatur/children/${childId}/surat/${suratId}/read`
  },
  
  PRESTASI: {
    LIST: (childId) => `/donatur/children/${childId}/prestasi`,
    DETAIL: (childId, prestasiId) => `/donatur/children/${childId}/prestasi/${prestasiId}`,
    MARK_READ: (childId, prestasiId) => `/donatur/children/${childId}/prestasi/${prestasiId}/read`
  },
  
  RAPORT: {
    LIST: (childId) => `/donatur/children/${childId}/raport`,
    DETAIL: (childId, raportId) => `/donatur/children/${childId}/raport/${raportId}`,
    SUMMARY: (childId) => `/donatur/children/${childId}/raport-summary`
  },
  
  AKTIVITAS: {
    LIST: (childId) => `/donatur/children/${childId}/aktivitas`,
    DETAIL: (childId, aktivitasId) => `/donatur/children/${childId}/aktivitas/${aktivitasId}`,
    ATTENDANCE_SUMMARY: (childId) => `/donatur/children/${childId}/attendance-summary`
  },

  MARKETPLACE: {
    AVAILABLE_CHILDREN: '/donatur/marketplace/available-children',
    CHILD_PROFILE: (childId) => `/donatur/marketplace/children/${childId}/profile`,
    SPONSOR_CHILD: (childId) => `/donatur/marketplace/children/${childId}/sponsor`,
    FILTERS: '/donatur/marketplace/filters',
    FEATURED_CHILDREN: '/donatur/marketplace/featured-children'
  }
};

export const MANAGEMENT_ENDPOINTS = {
  USERS: '/users',
  USER_DETAIL: (id) => `/users/${id}`,
  
  KACAB: '/kacab',
  KACAB_DETAIL: (id) => `/kacab/${id}`,
  
  WILBIN: '/wilbin',
  WILBIN_DETAIL: (id) => `/wilbin/${id}`,
  
  SHELTER: '/shelter',
  SHELTER_DETAIL: (id) => `/shelter/${id}`
};
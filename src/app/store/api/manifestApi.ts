// src/app/store/api/manifestApi.ts
// RTK Query slice for /api/v2/manifest — HOME-01
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../../constants';
import { ManifestV2Response } from '../../services/v2/ManifestV2Service';
import { STORAGE_KEYS } from '../../constants';

export const manifestApi = createApi({
  reducerPath: 'manifestApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(STORAGE_KEYS.ugflix_auth_token);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getManifest: builder.query<ManifestV2Response, void>({
      query: () => 'v2/manifest',
      transformResponse: (response: { code?: number; data?: ManifestV2Response }) =>
        response?.data ?? (response as ManifestV2Response),
      // Cache for 15 minutes
      keepUnusedDataFor: 15 * 60,
    }),
  }),
});

export const { useGetManifestQuery } = manifestApi;

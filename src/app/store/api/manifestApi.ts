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
      transformResponse: (response: { code?: number; data?: Record<string, unknown> }) => {
        const d = response?.data ?? {};
        return {
          featured: d.featured as ManifestV2Response['featured'],
          sections: Array.isArray(d.sections) ? d.sections : [],
          genres: Array.isArray(d.genres) ? d.genres : [],
          vjs: Array.isArray(d.vjs) ? d.vjs : [],
          config: d.config as ManifestV2Response['config'],
          subscription: d.subscription as ManifestV2Response['subscription'],
          stats: d.stats as ManifestV2Response['stats'],
        } as ManifestV2Response;
      },
      keepUnusedDataFor: 15 * 60,
    }),
  }),
});

export const { useGetManifestQuery } = manifestApi;

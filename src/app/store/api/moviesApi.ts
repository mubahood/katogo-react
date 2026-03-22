// src/app/store/api/moviesApi.ts
// RTK Query slice for /api/v2/movies endpoints
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, STORAGE_KEYS } from '../../constants';
import type { MovieV2, MoviesV2Params, MoviesV2Response } from '../../services/v2/MoviesV2Service';

export const moviesApi = createApi({
  reducerPath: 'moviesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(STORAGE_KEYS.ugflix_auth_token);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Movie', 'MovieList'],
  endpoints: (builder) => ({
    getMovies: builder.query<MoviesV2Response, MoviesV2Params>({
      query: (params = {}) => ({
        url: 'v2/movies',
        params: {
          page: params.page ?? 1,
          per_page: params.per_page ?? 20,
          ...(params.type && { type: params.type }),
          ...(params.genre && { genre: params.genre }),
          ...(params.language && { language: params.language }),
          ...(params.vj && { vj: params.vj }),
          ...(params.year && { year: params.year }),
          ...(params.status && { status: params.status }),
          ...(params.sort && { sort: params.sort }),
        },
      }),
      transformResponse: (res: any) => res.data ?? res,
      providesTags: ['MovieList'],
      keepUnusedDataFor: 300, // 5 minutes
    }),
    getMovie: builder.query<MovieV2, number>({
      query: (id) => `v2/movies/${id}`,
      transformResponse: (res: any) => res.data?.movie ?? res.data ?? res,
      providesTags: (_result, _error, id) => [{ type: 'Movie', id }],
      keepUnusedDataFor: 600, // 10 minutes
    }),
    getRelatedMovies: builder.query<MovieV2[], number>({
      query: (id) => `v2/movies/${id}/related`,
      transformResponse: (res: any) => res.data?.items ?? res.data ?? [],
      keepUnusedDataFor: 300,
    }),
    getSeriesEpisodes: builder.query<MovieV2[], { categoryId: number; season?: number }>({
      query: ({ categoryId, season }) => ({
        url: `v2/series/${categoryId}/episodes`,
        params: season != null ? { season } : undefined,
      }),
      transformResponse: (res: any) => {
        const items: MovieV2[] = res.data?.items ?? res.data ?? [];
        return items.sort((a: MovieV2, b: MovieV2) => {
          const sa = Number(a.season_number || 0), sb = Number(b.season_number || 0);
          if (sa !== sb) return sa - sb;
          return Number(a.episode_number || 0) - Number(b.episode_number || 0);
        });
      },
      keepUnusedDataFor: 600, // 10 min — episodes don't change often
    }),
  }),
});

export const { useGetMoviesQuery, useGetMovieQuery, useGetRelatedMoviesQuery, useGetSeriesEpisodesQuery } = moviesApi;

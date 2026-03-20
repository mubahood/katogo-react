// src/app/store/api/moviesApi.ts
// RTK Query slice for /api/v2/movies endpoints
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { MovieV2, MoviesV2Params, MoviesV2Response } from '../../services/v2/MoviesV2Service';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://katogo.ugnews24.info/api/';

export const moviesApi = createApi({
  reducerPath: 'moviesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
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
  }),
});

export const { useGetMoviesQuery, useGetMovieQuery, useGetRelatedMoviesQuery } = moviesApi;

'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { PaginatedResponse } from '@/lib/types';
import { Broker } from '@/lib/types';

async function fetchBrokers() {
  const response = await apiClient.get<Broker[] | PaginatedResponse<Broker>>('/brokers/');
  return Array.isArray(response.data) ? response.data : response.data.results;
}

export function useBrokerOptions() {
  return useQuery({
    queryKey: ['brokers'],
    queryFn: fetchBrokers,
    enabled: true,
  });
}

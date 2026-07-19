import { apiClient } from './apiClient';
import { mapEnvelope } from './mappers/envelopeMappers';
import type { AddEnvelopePayload, EditEnvelopePayload, Envelope } from '../types';

export async function listEnvelopes(): Promise<Envelope[]> {
  const { data } = await apiClient.get('/api/finance/envelopes');
  return (data as unknown[]).map((item, index) =>
    mapEnvelope(item as Parameters<typeof mapEnvelope>[0], index),
  );
}

export async function createEnvelope(
  payload: AddEnvelopePayload,
): Promise<Envelope> {
  const now = new Date();
  const { data } = await apiClient.post('/api/finance/envelopes', {
    category: payload.category,
    monthlyLimit: payload.monthlyLimit,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  return mapEnvelope(data);
}

export async function updateEnvelope(
  payload: EditEnvelopePayload,
): Promise<Envelope> {
  const { data } = await apiClient.put(`/api/finance/envelopes/${payload.id}`, {
    monthlyLimit: payload.monthlyLimit,
  });
  return mapEnvelope(data);
}

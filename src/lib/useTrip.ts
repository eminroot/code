import { useMemo } from 'react';
import { byCode } from '@/data/countries';
import { guideFor } from '@/data/guides';
import { useStore } from '@/lib/store';

export function useTrip() {
  const { trip } = useStore();
  return useMemo(() => {
    if (!trip) return null;
    const guide = guideFor(trip.to);
    const from = byCode(trip.from);
    const to = byCode(trip.to);
    if (!guide || !from || !to) return null;
    return { trip, guide, from, to };
  }, [trip]);
}

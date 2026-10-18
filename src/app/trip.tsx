import { router } from 'expo-router';
import { TripForm } from '@/components/TripForm';
import { useStore } from '@/lib/store';

export default function EditTrip() {
  const { trip, setTrip } = useStore();
  return (
    <TripForm
      initial={trip}
      doneLabel="Update my briefing"
      onClose={() => router.back()}
      onDone={(t) => {
        setTrip(t);
        router.back();
      }}
    />
  );
}

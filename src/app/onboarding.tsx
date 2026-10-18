import { router } from 'expo-router';
import { TripForm } from '@/components/TripForm';
import { useStore } from '@/lib/store';

export default function Onboarding() {
  const { setTrip } = useStore();
  return (
    <TripForm
      onClose={() => router.back()}
      onDone={(t) => {
        setTrip(t);
        if (router.canDismiss()) router.dismissAll();
        router.replace('/(tabs)');
      }}
    />
  );
}

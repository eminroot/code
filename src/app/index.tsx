import { Redirect } from 'expo-router';
import { useStore } from '@/lib/store';

export default function Index() {
  const { trip } = useStore();
  return <Redirect href={trip ? '/(tabs)' : '/welcome'} />;
}

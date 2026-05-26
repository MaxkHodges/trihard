import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      // Signed in but still on an auth screen — send to the app
      router.replace('/(app)/today');
    } else if (!session && !inAuthGroup) {
      // Not signed in and not on an auth screen — send to sign-in
      router.replace('/(auth)/sign-in');
    }
  }, [session, loading, segments, router]);

  // Don't render routes until we know the auth state
  if (loading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

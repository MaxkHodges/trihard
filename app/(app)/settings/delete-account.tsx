import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase/client';
import { useAuth } from '../../../hooks/useAuth';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmation === 'DELETE';

  async function handleDelete() {
    if (!canDelete) return;
    setError(null);

    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all your training data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              const token = sessionData.session?.access_token;

              const response = await fetch(
                `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error((body as { error?: string }).error ?? 'Deletion failed.');
              }

              // Sign out locally — auth user is already gone server-side
              await signOut();
              router.replace('/(auth)/sign-in');
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : 'Something went wrong.';
              setError(message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Delete account</Text>

      <View style={styles.warningBox}>
        <Text style={styles.warningTitle}>This cannot be undone</Text>
        <Text style={styles.warningBody}>Deleting your account will permanently remove:</Text>
        <Text style={styles.bullet}>• Your athlete profile and settings</Text>
        <Text style={styles.bullet}>• All training plans and sessions</Text>
        <Text style={styles.bullet}>• Your activity history and fitness metrics</Text>
        <Text style={styles.bullet}>• All check-ins and readiness data</Text>
      </View>

      <Text style={styles.confirmLabel}>
        Type <Text style={styles.confirmWord}>DELETE</Text> to confirm
      </Text>
      <TextInput
        style={styles.input}
        value={confirmation}
        onChangeText={setConfirmation}
        placeholder="DELETE"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!loading}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.deleteButton, (!canDelete || loading) && styles.deleteButtonDisabled]}
        onPress={handleDelete}
        disabled={!canDelete || loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.deleteButtonText}>Delete my account</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  back: {
    marginBottom: 32,
  },
  backText: {
    fontSize: 15,
    color: '#6B7280',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 8,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4,
  },
  warningBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  bullet: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  confirmWord: {
    fontWeight: '700',
    color: '#DC2626',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  deleteButton: {
    marginTop: 24,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.35,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

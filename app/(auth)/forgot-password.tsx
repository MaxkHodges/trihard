import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthForm } from '../../components/AuthForm';
import { useAuth } from '../../hooks/useAuth';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const err = await resetPassword(email.trim());
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>Check your inbox</Text>
        <Text style={styles.successBody}>
          We sent a password reset link to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text style={styles.backButtonText}>Back to sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AuthForm
      title="Reset password"
      subtitle="Enter your email and we'll send you a link to reset your password."
      fields={[
        {
          label: 'Email',
          value: email,
          onChange: setEmail,
          placeholder: 'you@example.com',
          keyboardType: 'email-address',
          autoCapitalize: 'none',
          autoComplete: 'email',
        },
      ]}
      submitLabel="Send reset link"
      onSubmit={handleReset}
      loading={loading}
      error={error}
      footer={
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Back to sign in</Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  successBody: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 26,
  },
  email: {
    color: '#111827',
    fontWeight: '600',
  },
  backButton: {
    marginTop: 40,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  link: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
});

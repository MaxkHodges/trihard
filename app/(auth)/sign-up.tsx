import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthForm } from '../../components/AuthForm';
import { useAuth } from '../../hooks/useAuth';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp() {
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const err = await signUp(email.trim(), password);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    // After sign-up, navigate to onboarding (built in Phase 4)
    // For now, the root layout will redirect once the session is established
  }

  return (
    <AuthForm
      title="Create your account"
      subtitle="Build your first triathlon training plan in minutes"
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
        {
          label: 'Password',
          value: password,
          onChange: setPassword,
          placeholder: '8+ characters',
          secureTextEntry: true,
          autoComplete: 'new-password',
        },
      ]}
      submitLabel="Create account"
      onSubmit={handleSignUp}
      loading={loading}
      error={error}
      footer={
        <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.link}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  footerText: {
    fontSize: 15,
    color: '#6B7280',
  },
  link: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
});

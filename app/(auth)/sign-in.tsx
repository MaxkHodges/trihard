import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthForm } from '../../components/AuthForm';
import { SocialAuth } from '../../components/SocialAuth';
import { useAuth } from '../../hooks/useAuth';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
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
    const err = await signIn(email.trim(), password);
    setLoading(false);

    if (err) {
      setError(err);
    }
    // On success, the root layout redirects to /today automatically
  }

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to your TriHard account"
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
          placeholder: '••••••••',
          secureTextEntry: true,
          autoComplete: 'password',
        },
      ]}
      submitLabel="Sign in"
      onSubmit={handleSignIn}
      loading={loading}
      error={error}
      footer={
        <>
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>
          <SocialAuth onError={setError} loading={loading} setLoading={setLoading} />
          <TouchableOpacity onPress={() => router.replace('/(auth)/sign-up')}>
            <Text style={styles.footerText}>
              No account? <Text style={styles.link}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </>
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

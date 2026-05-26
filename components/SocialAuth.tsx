import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase/client';

interface SocialAuthProps {
  onError: (message: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// Call once at app startup — see README for required webClientId setup
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
});

export function SocialAuth({ onError, loading, setLoading }: SocialAuthProps) {
  async function handleAppleSignIn() {
    try {
      setLoading(true);
      onError('');

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        onError('Apple sign-in failed. Please try again.');
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) onError(mapSocialError(error.message));
      // On success, root layout redirects automatically
    } catch (e: unknown) {
      if (isAppleCancelError(e)) return; // user dismissed — no error shown
      onError('Apple sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      onError('');

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      // idToken lives at response.data.idToken in v13+
      const idToken =
        'data' in response && response.data
          ? (response.data as { idToken?: string | null }).idToken
          : null;

      if (!idToken) {
        onError('Google sign-in failed. Please try again.');
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) onError(mapSocialError(error.message));
    } catch (e: unknown) {
      if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (isErrorWithCode(e) && e.code === statusCodes.IN_PROGRESS) return;
      onError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Apple Sign-In — iOS only, required by App Store guidelines */}
      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={12}
          style={styles.appleButton}
          onPress={handleAppleSignIn}
        />
      )}

      {/* Google Sign-In — both platforms */}
      <TouchableOpacity
        style={[styles.googleButton, loading && styles.disabled]}
        onPress={handleGoogleSignIn}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#374151" />
        ) : (
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function isAppleCancelError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'ERR_REQUEST_CANCELED'
  );
}

function mapSocialError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in with your password instead.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  return 'Sign-in failed. Please try again.';
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  appleButton: {
    height: 52,
    width: '100%',
  },
  googleButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  disabled: {
    opacity: 0.5,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});

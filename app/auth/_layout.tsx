import { Colors } from '@/constants/colors';
import { SocialSignUpProvider } from '@/hooks/use-social-signup';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <SocialSignUpProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      />
    </SocialSignUpProvider>
  );
}

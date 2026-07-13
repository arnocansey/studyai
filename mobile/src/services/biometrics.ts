import * as LocalAuthentication from 'expo-local-authentication';

export async function isAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  } catch {
    return false;
  }
}

export async function authenticate(prompt: string = 'Authenticate to continue'): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      fallbackLabel: 'Use Passcode',
    });
    return result.success;
  } catch {
    return false;
  }
}

export async function getAuthenticationType(): Promise<LocalAuthentication.AuthenticationType | null> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types[0] ?? null;
  } catch {
    return null;
  }
}

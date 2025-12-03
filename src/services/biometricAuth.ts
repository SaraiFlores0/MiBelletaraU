import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export const checkBiometricSupport = async () => {
  const { available } = await rnBiometrics.isSensorAvailable();
  return available === true;
};

export const requestBiometricAuth = async () => {
  const result = await rnBiometrics.simplePrompt({
    promptMessage: 'Confirma tu identidad',
  });

  return result.success === true;
};

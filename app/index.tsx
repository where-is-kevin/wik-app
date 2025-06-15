// app/index.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import LoginLogoSvg from '@/components/SvgComponents/LoginLogoSvg';
import CustomText from '@/components/CustomText';
import { verticalScale, scaleFontSize } from '@/utilities/scaling';
import CustomView from '@/components/CustomView';

export default function IndexScreen() {
  const { checkAuthAndNavigate } = useAuthGuard();

  useEffect(() => {
    checkAuthAndNavigate();
  }, []);

  // This screen shows while checking auth
  return (
    <CustomView style={styles.container}>
      <ActivityIndicator size={'large'} color={'#493CFA'} />
    </CustomView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: verticalScale(20),
    fontSize: scaleFontSize(16),
    color: '#666',
  },
});
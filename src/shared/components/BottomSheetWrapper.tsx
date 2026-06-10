import React, { forwardRef, useCallback } from 'react';
import { View, type ViewStyle } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetProps,
} from '@gorhom/bottom-sheet';
import type { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import { useTheme } from '../theme/ThemeContext';

interface BottomSheetWrapperProps
  extends Omit<BottomSheetProps, 'children' | 'ref'> {
  children: React.ReactNode;
  scrollable?: boolean;
  contentStyle?: ViewStyle;
}

export const BottomSheetWrapper = forwardRef<
  BottomSheet,
  BottomSheetWrapperProps
>(function BottomSheetWrapper(
  { children, scrollable = false, contentStyle, snapPoints, ...rest },
  ref,
) {
  const { colors } = useTheme();

  const renderBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    [],
  );

  const defaultSnaps = snapPoints ?? ['50%', '80%'];

  const handleStyle: ViewStyle = {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.bgCard,
  };
  const indicatorStyle: ViewStyle = {
    backgroundColor: colors.border,
    width: 36,
    height: 4,
  };
  const bgStyle: ViewStyle = {
    backgroundColor: colors.bgCard,
  };

  if (scrollable) {
    return (
      <BottomSheet
        ref={ref}
        snapPoints={defaultSnaps}
        backdropComponent={renderBackdrop}
        handleStyle={handleStyle}
        handleIndicatorStyle={indicatorStyle}
        backgroundStyle={bgStyle}
        enablePanDownToClose
        {...rest}
      >
        <BottomSheetScrollView contentContainerStyle={contentStyle}>
          {children}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      ref={ref}
      snapPoints={defaultSnaps}
      backdropComponent={renderBackdrop}
      handleStyle={handleStyle}
      handleIndicatorStyle={indicatorStyle}
      backgroundStyle={bgStyle}
      enablePanDownToClose
      {...rest}
    >
      <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
    </BottomSheet>
  );
});

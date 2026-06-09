import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

const isWeb = Platform.OS === 'web';

export const shadows: Record<'sm' | 'md' | 'float', ViewStyle> = {
  sm: isWeb
    ? ({ boxShadow: '2px 2px 4px rgba(0,0,0,0.08)' } as ViewStyle)
    : {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
  md: isWeb
    ? ({ boxShadow: '3px 4px 7px rgba(0,0,0,0.10)' } as ViewStyle)
    : {
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 7,
        elevation: 4,
      },
  float: isWeb
    ? ({ boxShadow: '0px 8px 16px rgba(0,0,0,0.15)' } as ViewStyle)
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      },
};

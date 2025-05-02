import { verticalScale } from '@/utilities/scaling'
import { StyleSheet } from 'react-native'

export const commonStyles = StyleSheet.create({
    horizontalLine: {
        width: '100%',
        height: 0.5,
        marginVertical: verticalScale(16),
    },
})
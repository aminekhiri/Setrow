import React from 'react';
import { View, Text, Modal as RNModal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function Modal({ visible, onClose, title, children }) {
    return (
        <RNModal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.content}>
                            <View style={styles.handle} />
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.body}>
                                {children}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </RNModal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.overlay,
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        maxHeight: '85%',
        paddingBottom: 34,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.textMuted,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        color: COLORS.text,
        fontSize: FONTS.sizes.lg,
        fontWeight: '700',
    },
    closeButton: {
        padding: SPACING.xs,
    },
    body: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
    },
});

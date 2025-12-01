
import React from 'react';
import { Modal, View, Image, Pressable, StyleSheet, PanResponder } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

interface SwipeableImageModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export function SwipeableImageModal({ visible, imageUrl, onClose }: SwipeableImageModalProps) {
  // PanResponder for swipe-down gesture
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped down more than 100 pixels, close the modal
        if (gestureState.dy > 100) {
          onClose();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} {...panResponder.panHandlers}>
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
        >
          <IconSymbol 
            ios_icon_name="xmark.circle.fill" 
            android_material_icon_name="cancel" 
            color="#FFFFFF" 
            size={36} 
          />
        </Pressable>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

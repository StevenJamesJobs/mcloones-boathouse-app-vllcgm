
import React, { useRef, useEffect } from 'react';
import { Modal, View, Image, Pressable, StyleSheet, Animated, PanResponder } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

interface SwipeableImageModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export function SwipeableImageModal({ visible, imageUrl, onClose }: SwipeableImageModalProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // PanResponder for swipe-down gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes (down direction)
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward swipes
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          // Fade out as user swipes down
          const newOpacity = Math.max(0, 1 - gestureState.dy / 400);
          opacity.setValue(newOpacity);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped down more than 150 pixels, close the modal
        if (gestureState.dy > 150) {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 500,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onClose();
            // Reset animations
            translateY.setValue(0);
            opacity.setValue(1);
          });
        } else {
          // Spring back to original position
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 8,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 8,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Reset animations when modal closes
  useEffect(() => {
    if (!visible) {
      translateY.setValue(0);
      opacity.setValue(1);
    }
  }, [visible, translateY, opacity]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity }]}>
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
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          )}
        </Animated.View>
      </Animated.View>
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
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

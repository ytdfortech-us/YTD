import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useAuthModal, useAuthStore } from './store';
import NeonAuthForm from './NeonAuthForm';

/**
 * Modal component for Neon database authentication
 * Can be used as a drop-in replacement for the existing AuthModal
 */
export const NeonAuthModal = () => {
  const { isOpen, mode, close } = useAuthModal();
  const { auth } = useAuthStore();

  const handleSuccess = () => {
    close();
  };

  return (
    <Modal
      visible={isOpen && !auth}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={close}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          <NeonAuthForm 
            initialMode={mode} 
            onSuccess={handleSuccess} 
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
});

export default NeonAuthModal;
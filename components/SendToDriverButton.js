import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Alert, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { sendToDriver, formatPhoneNumber, isValidPhoneNumber } from '../utils/whatsappHelper';

/**
 * SendToDriverButton Component
 * 
 * Button to send order delivery details to driver via WhatsApp
 * 
 * Props:
 * - order: Order object with customer and order details
 * - deliveryInfo: Object with { address, latitude, longitude, distance, estimatedTime }
 * - driverPhone: Driver's WhatsApp number (optional, can be entered)
 * - onSent: Callback after message is sent
 */

const SendToDriverButton = ({ order, deliveryInfo, driverPhone: initialDriverPhone, onSent }) => {
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [driverPhone, setDriverPhone] = useState(initialDriverPhone || '');
  const [isSending, setIsSending] = useState(false);

  const handleSendToDriver = () => {
    // If no driver phone, show modal to enter
    if (!driverPhone) {
      setShowPhoneModal(true);
      return;
    }

    // Validate phone number
    if (!isValidPhoneNumber(driverPhone)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid Ghana phone number (+233 XX XXX XXXX)');
      setShowPhoneModal(true);
      return;
    }

    // If no GPS coords, we still allow sending with just the address text
    // (the whatsappHelper will use a text search link instead)

    setIsSending(true);

    try {
      // Format phone and send
      const formattedPhone = formatPhoneNumber(driverPhone);
      const whatsappLink = sendToDriver(formattedPhone, order, deliveryInfo);

      // Call onSent callback if provided
      if (onSent) {
        onSent(formattedPhone, whatsappLink);
      }

      Alert.alert(
        'WhatsApp Opened',
        'WhatsApp has been opened with the delivery details. Click Send in WhatsApp to deliver the message to your driver.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sending to driver:', error);
      Alert.alert('Error', 'Failed to open WhatsApp. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmPhone = () => {
    if (!driverPhone.trim()) {
      Alert.alert('Phone Required', 'Please enter the driver\'s WhatsApp number');
      return;
    }

    if (!isValidPhoneNumber(driverPhone)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid Ghana phone number');
      return;
    }

    setShowPhoneModal(false);
    // After closing modal, send the message
    setTimeout(() => handleSendToDriver(), 300);
  };

  return (
    <>
      {/* Send to Driver Button */}
      <Pressable
        style={[styles.button, isSending && styles.buttonDisabled]}
        onPress={handleSendToDriver}
        disabled={isSending}
      >
        <FontAwesome5 name="whatsapp" size={18} color="#FFFFFF" />
        <Text style={styles.buttonText}>
          {isSending ? 'Opening...' : 'Send to Driver'}
        </Text>
      </Pressable>

      {/* Driver Phone Modal */}
      <Modal
        visible={showPhoneModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPhoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Driver's WhatsApp Number</Text>
              <Pressable onPress={() => setShowPhoneModal(false)} style={styles.closeButton}>
                <FontAwesome5 name="times" size={20} color="#5F5E5F" />
              </Pressable>
            </View>

            <Text style={styles.modalDescription}>
              Enter the driver's WhatsApp number to send delivery details
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={driverPhone}
                onChangeText={setDriverPhone}
                placeholder="+233 24 123 4567"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                autoFocus
              />
              <Text style={styles.inputHint}>
                Format: +233 XX XXX XXXX or 0XX XXX XXXX
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowPhoneModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={handleConfirmPhone}
              >
                <FontAwesome5 name="whatsapp" size={16} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>Send via WhatsApp</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366', // WhatsApp green
    padding: 14,
    borderRadius: 8,
    gap: 10,
    marginVertical: 8,
    maxWidth: 280,
  },
  buttonDisabled: {
    backgroundColor: '#93C5A9',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B1C1C',
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: '#5F5E5F',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B1C1C',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FAF9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1B1C1C',
  },
  inputHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5F5E5F',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#25D366',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SendToDriverButton;

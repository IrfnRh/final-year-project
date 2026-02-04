import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, StatusBar } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons'; 

export default function App() {
  const [status, setStatus] = useState("SYSTEM READY");
  const [statusColor, setStatusColor] = useState("#FFD700"); // Gold
  const [showLoginRequest, setShowLoginRequest] = useState(false);

  // --- REAL FACE ID LOGIC ---
  const handleBiometricAuth = async () => {
    console.log("[DEBUG] Attempting Real Biometrics...");
    
    // 1. Check Hardware (Don't stop if missing, just try)
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    
    // 2. Scan Face
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'VERIFY SAIYAN ID',
            fallbackLabel: 'ENTER PASSCODE',
        });

        if (result.success) {
            grantAccess();
        } else {
            setStatus("ACCESS DENIED");
            setStatusColor("#FF0000");
        }
    } catch (e) {
        Alert.alert("Hardware Error", "Face ID not responding. Use Developer Override.");
    }
  };


  const handleDevBypass = () => {
      console.log("[DEBUG] Developer Override Triggered");
      grantAccess();
  }

  const grantAccess = async () => {
      console.log("[DEBUG] Power Level Verified!");
      setStatus("ACCESS GRANTED");
      setStatusColor("#00FF00"); // Bright Green
      setShowLoginRequest(false);
      
      // Send signal to backend
      try {
        await fetch('http://192.168.0.59:3000/api/auth/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'KAKAROT-01', decision: 'APPROVED' })
        });
      } catch (err) {
        console.log("Backend offline (Expected on localhost)");
      }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.scouterLine} />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
            <Ionicons name="planet" size={60} color="#1a1a2e" />
        </View>
        <Text style={styles.corpTitle}>CAPSULE CORP</Text>
        <Text style={styles.subTitle}>SECURE TERMINAL</Text>

        <View style={[styles.statusBox, { borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            STATUS: {status}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Text style={styles.label}>CONTROLS</Text>
        
        {/* MANUAL TRIGGER (ORANGE) */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowLoginRequest(true)}
        >
          <Ionicons name="warning" size={24} color="#1a1a2e" style={{marginRight: 10}}/>
          <Text style={styles.buttonText}>SIMULATE INCOMING</Text>
        </TouchableOpacity>
      </View>

      {/* POPUP SCREEN */}
      {showLoginRequest && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popupHeader}>INCOMING TRANSMISSION</Text>
            
            <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>SOURCE:</Text>
                <Text style={styles.infoValue}>WEST CITY PORTAL</Text>
                <Text style={styles.infoLabel}>IP ADDRESS:</Text>
                <Text style={styles.infoValue}>192.168.Z.Z</Text>
            </View>
            
            <View style={styles.popupButtons}>
              {/* REAL BUTTON */}
              <TouchableOpacity 
                style={[styles.smallButton, { backgroundColor: '#34C759' }]}
                onPress={handleBiometricAuth}
              >
                <Text style={styles.smallButtonText}>VERIFY (FACE ID)</Text>
              </TouchableOpacity>
              
              {/* BYPASS BUTTON (Use this if Face ID fails) */}
              <TouchableOpacity 
                style={[styles.smallButton, { backgroundColor: '#007AFF' }]}
                onPress={handleDevBypass}
              >
                <Text style={styles.smallButtonText}>DEV BYPASS</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
                onPress={() => setShowLoginRequest(false)}
                style={{marginTop: 15}}
            >
                <Text style={{color: 'red', fontWeight: 'bold'}}>CANCEL</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', padding: 20 },
  scouterLine: { position: 'absolute', top: 50, left: 0, right: 0, height: 2, backgroundColor: '#F85B1A', opacity: 0.5 },
  header: { alignItems: 'center', marginBottom: 50, borderWidth: 2, borderColor: '#072083', padding: 20, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)' },
  logoContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F85B1A', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 4, borderColor: '#fff' },
  corpTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  subTitle: { fontSize: 14, color: '#F85B1A', letterSpacing: 4, marginBottom: 20 },
  statusBox: { marginTop: 10, paddingVertical: 10, paddingHorizontal: 20, borderWidth: 2, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.5)', minWidth: '100%', alignItems: 'center' },
  statusText: { fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  controls: { padding: 20, borderTopWidth: 1, borderTopColor: '#333' },
  label: { color: '#555', marginBottom: 10, textAlign: 'center', letterSpacing: 2 },
  actionButton: { flexDirection: 'row', padding: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 15, backgroundColor: '#F85B1A', borderWidth: 2, borderColor: '#fff', shadowColor: '#F85B1A', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  buttonText: { color: '#1a1a2e', fontWeight: '900', fontSize: 18 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  popup: { width: '100%', backgroundColor: '#fff', padding: 25, borderRadius: 20, alignItems: 'center', borderWidth: 5, borderColor: '#F85B1A' },
  popupHeader: { fontSize: 20, fontWeight: '900', marginBottom: 15, color: '#072083' },
  infoBox: { width: '100%', backgroundColor: '#eee', padding: 15, borderRadius: 10, marginBottom: 20 },
  infoLabel: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  infoValue: { fontSize: 16, color: '#333', fontWeight: 'bold', marginBottom: 10 },
  popupButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 15 },
  smallButton: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
  smallButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 }
});
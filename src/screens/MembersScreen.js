// src/screens/MembersScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradient } from '../theme';
import MEMBERS from '../data/members';

const { width } = Dimensions.get('window');

export default function MembersScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <ScrollView contentContainerStyle={styles.center} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Team Members</Text>
          <Text style={styles.subtitle}>Leader & Members (tap to view)</Text>

          {MEMBERS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.row}
              onPress={() => setSelected(m)}
              activeOpacity={0.8}
            >
              {m.image ? (
                <Image source={m.image} style={styles.avatar} />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>
                    {m.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </Text>
                </View>
              )}
              <View style={styles.meta}>
                <Text style={styles.name}>{m.name}</Text>
                <Text style={styles.role}>{m.role}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent={false}>
        <View style={styles.modalRoot}>
          <TouchableOpacity
            onPress={() => setSelected(null)}
            style={styles.modalClose}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>

          {selected && (
            <>
              {selected.image ? (
                <Image source={selected.image} style={styles.modalAvatar} />
              ) : (
                <View style={[styles.modalAvatar, styles.modalPlaceholder]}>
                  <Text style={styles.modalPlaceholderText}>
                    {selected.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </Text>
                </View>
              )}
              <Text style={styles.modalName}>{selected.name}</Text>
              <Text style={styles.modalRole}>{selected.role}</Text>
            </>
          )}
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  card: {
    width: Math.min(width - 40, 640),
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'stretch',
    elevation: 6,
  },
  title: {
    alignSelf: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    alignSelf: 'center',
    color: Colors.muted,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eef6ff',
  },
  avatar: { width: 56, height: 56, borderRadius: 10, marginRight: 12 },
  placeholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#dbeffd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: Colors.primary, fontWeight: '900' },

  meta: { justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  role: { color: Colors.muted, marginTop: 4 },

  closeBtn: {
    alignSelf: 'stretch',
    marginTop: 14,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: '800' },

  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 48,
    backgroundColor: Gradient.from,
  },
  modalAvatar: {
    width: Math.min(260, width - 80),
    height: Math.min(260, width - 80),
    borderRadius: 12,
    marginBottom: 20,
  },
  modalPlaceholder: {
    backgroundColor: '#dbeffd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPlaceholderText: { color: Colors.primary, fontWeight: '900', fontSize: 48 },
  modalName: { fontSize: 22, fontWeight: '900', color: Colors.primary },
  modalRole: { color: Colors.muted, marginTop: 8 },

  modalClose: {
    position: 'absolute',
    right: 16,
    top: 40,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modalCloseText: { color: '#fff', fontWeight: '800' },
});

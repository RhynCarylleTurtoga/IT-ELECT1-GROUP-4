// src/ui/styles.js
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#f6f8fb',
  },

  header: {
    height: 64,
    backgroundColor: '#0d6efd',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
    paddingBottom: 12,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brand: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  main: {
    flex: 1,
    padding: 16,
  },

  footer: {
    height: 44,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerText: {
    color: '#6b7280',
    fontSize: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  btnPrimary: {
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },

  btnOutline: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  smallTextMuted: {
    color: '#6b7280',
    fontSize: 12,
  },

  row: { flexDirection: 'row', alignItems: 'center' },

  spacedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  center: { alignItems: 'center', justifyContent: 'center' },
});

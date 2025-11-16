// src/screens/Admin/UsersScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllUsers, getLoginHistory } from '../../db/database';
import { Colors, Gradient } from '../../theme';

function formatShort(ts) {
  if (!ts) return '-';
  try { return new Date(ts).toLocaleString(); } catch { return String(ts); }
}

export default function UsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const u = await getAllUsers();
      const h = await getLoginHistory({ limit: 200 });
      setUsers(u || []);
      setHistory(h || []);
    } catch (e) {
      console.warn('admin load err', e);
      Alert.alert('Error', 'Could not load admin data. See console.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const renderUser = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.colId}>{item.id}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.meta}>Created: {formatShort(item.created_at)} • Last login: {formatShort(item.last_login)}</Text>
      </View>
    </View>
  );

  const renderHistory = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.colId}>{item.id}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.username}>{item.username || 'Guest'}</Text>
        <Text style={styles.meta}>{formatShort(item.ts)}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Users — Registered & Login History</Text>
        <TouchableOpacity style={styles.refresh} onPress={load}><Text style={styles.refreshText}>Refresh</Text></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
        <>
          <Text style={styles.sectionTitle}>Registered Users ({users.length})</Text>
          <View style={[styles.table, { maxHeight: 220 }]}>
            <FlatList data={users} keyExtractor={(i) => String(i.id)} renderItem={renderUser} ItemSeparatorComponent={() => <View style={styles.sep} />} />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Recent Login History ({history.length})</Text>
          <View style={[styles.table, { maxHeight: 300 }]}>
            <FlatList data={history} keyExtractor={(i) => String(i.id)} renderItem={renderHistory} ItemSeparatorComponent={() => <View style={styles.sep} />} />
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  refresh: { backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  refreshText: { color: '#fff', fontWeight: '700' },

  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  table: { backgroundColor: Colors.card, borderRadius: 12, padding: 8, elevation: 2 },

  row: { flexDirection: 'row', paddingVertical: 10, alignItems: 'flex-start' },
  colId: { width: 36, fontWeight: '700', color: '#333' },
  username: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 12, color: Colors.muted, marginTop: 4 },

  sep: { height: 1, backgroundColor: '#eef6ff', marginVertical: 6 }
});
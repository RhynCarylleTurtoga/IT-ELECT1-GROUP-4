
// src/screens/Admin/UsersScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllUsers, getLoginHistory } from '../../db/database';
import { Colors, Gradient } from '../../theme';

function formatShort(ts) {
  if (!ts) return '-';
  try { return new Date(ts).toLocaleString(); } catch { return String(ts); }
}

const { width, height } = Dimensions.get('window');

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
    <View style={localStyles.row}>
      <Text style={localStyles.colId}>{item.id}</Text>
      <View style={localStyles.rowBody}>
        <Text style={localStyles.username}>{item.username}</Text>
        <Text style={localStyles.meta}>Created: {formatShort(item.created_at)}</Text>
        <Text style={localStyles.meta}>Last login: {formatShort(item.last_login)}</Text>
      </View>
    </View>
  );

  const renderHistory = ({ item }) => (
    <View style={localStyles.row}>
      <Text style={localStyles.colId}>{item.id}</Text>
      <View style={localStyles.rowBody}>
        <Text style={localStyles.username}>{item.username || 'Guest'}</Text>
        <Text style={localStyles.meta}>{formatShort(item.ts)}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={localStyles.root}>
      <View style={localStyles.headerRow}>
        <Text style={localStyles.headerTitle}>Users — Registered & Login History</Text>
        <TouchableOpacity style={localStyles.refresh} onPress={load} activeOpacity={0.8}>
          <Text style={localStyles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={localStyles.loaderWrap}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <Text style={localStyles.sectionTitle}>Registered Users ({users.length})</Text>
          <View style={[localStyles.table, { maxHeight: Math.min(220, height * 0.35) }]}>
            {users.length === 0 ? (
              <View style={localStyles.empty}>
                <Text style={localStyles.emptyText}>No registered users yet.</Text>
              </View>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(i) => String(i.id)}
                renderItem={renderUser}
                ItemSeparatorComponent={() => <View style={localStyles.sep} />}
              />
            )}
          </View>

          <Text style={[localStyles.sectionTitle, { marginTop: 18 }]}>Recent Login History ({history.length})</Text>
          <View style={[localStyles.table, { maxHeight: Math.min(300, height * 0.45) }]}>
            {history.length === 0 ? (
              <View style={localStyles.empty}>
                <Text style={localStyles.emptyText}>No login history available.</Text>
              </View>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(i) => String(i.id)}
                renderItem={renderHistory}
                ItemSeparatorComponent={() => <View style={localStyles.sep} />}
              />
            )}
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const localStyles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 12,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    flex: 1,
    paddingRight: 8,
  },
  refresh: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  refreshText: { color: '#fff', fontWeight: '700' },

  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 15,
    color: '#0f172a',
    paddingHorizontal: 6,
  },

  table: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
  },

  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  colId: {
    width: 42,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  rowBody: {
    flex: 1,
    paddingLeft: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  meta: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
  },

  sep: { height: 1, backgroundColor: '#eef6ff', marginVertical: 6 },

  loaderWrap: {
    marginTop: 20,
    alignItems: 'center',
  },

  empty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.muted,
  },
});

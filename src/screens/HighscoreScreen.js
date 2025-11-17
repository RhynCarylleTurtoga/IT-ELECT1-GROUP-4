// src/screens/HighscoresScreen.js
import React, { useEffect, useState, useMemo, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { getHighscores } from '../db/database';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradient } from '../theme';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const MODES = ['all', 'classic', 'timeattack'];
const GRID_SIZES = ['all', 3, 4, 5];
const SORTS = [
  { key: 'time', label: 'Fastest time' },
  { key: 'mistakes', label: 'Least mistakes' },
  { key: 'recent', label: 'Most recent' },
];

export default function HighscoresScreen() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [modeFilter, setModeFilter] = useState('all');
  const [gridFilter, setGridFilter] = useState('all');
  const [sortKey, setSortKey] = useState('time');
  const [query, setQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({}); // for collapse per group

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // increase limit so we can filter client-side
        const s = await getHighscores({ limit: 500 });
        if (!mounted) return;
        setScores(s || []);
      } catch (e) {
        console.warn('getHighscores err', e);
        setScores([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // helper: apply filters
  const filtered = useMemo(() => {
    let list = Array.isArray(scores) ? scores.slice() : [];

    // mode filter
    if (modeFilter !== 'all') {
      list = list.filter((r) => String(r.mode || '').toLowerCase() === String(modeFilter).toLowerCase());
    }

    // grid size filter
    if (gridFilter !== 'all') {
      const n = Number(gridFilter);
      list = list.filter((r) => Number(r.gridSize) === n);
    }

    // search by player substring
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => (r.player || '').toLowerCase().includes(q));
    }

    // sorting
    if (sortKey === 'time') {
      list.sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
    } else if (sortKey === 'mistakes') {
      list.sort((a, b) => (Number(a.mistakes) || 0) - (Number(b.mistakes) || 0));
    } else if (sortKey === 'recent') {
      // assume there is a created_at or id; fallback to id desc if no created_at
      list.sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : (a.id || 0);
        const tb = b.created_at ? new Date(b.created_at).getTime() : (b.id || 0);
        return tb - ta;
      });
    }

    return list;
  }, [scores, modeFilter, gridFilter, query, sortKey]);

  // medals for current filtered list (top3)
  const topMedals = useMemo(() => {
    return filtered.slice(0, 3).map((s, i) => ({ id: s.id, medal: i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }));
  }, [filtered]);

  // group by mode and gridSize for sections
  const grouped = useMemo(() => {
    const map = {};
    for (const r of filtered) {
      const mode = r.mode || 'classic';
      const grid = r.gridSize || '4';
      const key = `${mode}::${grid}`;
      if (!map[key]) map[key] = { mode, grid, items: [] };
      map[key].items.push(r);
    }
    // create array sorted by mode then grid (classic first)
    const arr = Object.keys(map).map(k => ({ key: k, ...map[k] }));
    arr.sort((a, b) => {
      if (a.mode === b.mode) return Number(a.grid) - Number(b.grid);
      if (a.mode === 'classic') return -1;
      if (b.mode === 'classic') return 1;
      return a.mode.localeCompare(b.mode);
    });
    return arr;
  }, [filtered]);

  // user's best score (lowest time) across all scores
  const userBest = useMemo(() => {
    if (!currentUser) return null;
    const mine = scores.filter(s => s.userId && String(s.userId) === String(currentUser.id));
    if (mine.length === 0) return null;
    mine.sort((a, b) => (Number(a.time) || 0) - (Number(b.time) || 0));
    return mine[0];
  }, [scores, currentUser]);

  function toggleGroup(key) {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function renderRow({ item, index }) {
    // index is per-group index; compute overallRank by finding index in filtered
    const overallIndex = filtered.findIndex(s => s.id === item.id);
    const rank = overallIndex >= 0 ? overallIndex + 1 : index + 1;

    const medalObj = topMedals.find(m => m.id === item.id);
    const medal = medalObj ? medalObj.medal : null;
    const isMine = currentUser && String(item.userId) === String(currentUser.id);

    return (
      <View style={[styles.row, isMine && styles.rowMine]}>
        <View style={styles.rankWrap}>
          <Text style={styles.rankText}>{rank}</Text>
          {medal ? <Text style={styles.medal}>{medal}</Text> : null}
        </View>

        <View style={styles.body}>
          <Text style={[styles.player, isMine && styles.playerMine]}>
            {item.player || 'Guest'}
          </Text>
          <Text style={styles.meta}>
            {((item.time || 0)).toFixed(2)}s • mistakes {item.mistakes} • {item.mode} • {item.gridSize}×{item.gridSize}
          </Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.dateText}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
          </Text>
        </View>
      </View>
    );
  }

  // header controls
  function ControlsBar() {
    return (
      <View style={styles.controls}>
        <View style={styles.filterRow}>
          {MODES.map(m => {
            const active = m === modeFilter;
            return (
              <TouchableOpacity
                key={m}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setModeFilter(m)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {m === 'all' ? 'All' : (m === 'classic' ? 'Classic' : 'Time Attack')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.filterRow, { marginTop: 8 }]}>
          {GRID_SIZES.map(g => {
            const active = String(g) === String(gridFilter);
            return (
              <TouchableOpacity
                key={String(g)}
                style={[styles.chipSmall, active && styles.chipActiveSmall]}
                onPress={() => setGridFilter(g)}
              >
                <Text style={[styles.chipTextSmall, active && styles.chipTextActiveSmall]}>
                  {g === 'all' ? 'All' : `${g}×${g}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.controlsRow}>
          <TextInput
            placeholder="Search player"
            value={query}
            onChangeText={setQuery}
            style={styles.search}
            returnKeyType="search"
          />

          <View style={styles.sortRow}>
            {SORTS.map(s => {
              const active = s.key === sortKey;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.sortBtn, active && styles.sortBtnActive]}
                  onPress={() => setSortKey(s.key)}
                >
                  <Text style={[styles.sortText, active && styles.sortTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={[Gradient.from, Gradient.to]} style={styles.root}>
      <Text style={styles.title}>Leaderboard</Text>

      <View style={styles.container}>
        <ControlsBar />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryText}>Showing {filtered.length} results</Text>
              {currentUser && userBest ? (
                <Text style={styles.youBest}>Your best: {userBest.time.toFixed(2)}s ({userBest.mode} {userBest.gridSize}×{userBest.gridSize})</Text>
              ) : currentUser ? (
                <Text style={styles.youBest}>You have no recorded score yet.</Text>
              ) : null}
            </View>

            {/* grouped sections */}
            <FlatList
              data={grouped}
              keyExtractor={(g) => g.key}
              contentContainerStyle={styles.listContent}
              renderItem={({ item: group }) => {
                const title = `${group.mode} • ${group.grid}×${group.grid}`;
                const isExpanded = expandedGroups[group.key] !== false; // default true
                return (
                  <View style={styles.group}>
                    <TouchableOpacity style={styles.groupHeader} onPress={() => toggleGroup(group.key)}>
                      <Text style={styles.groupTitle}>{title}</Text>
                      <Text style={styles.groupCount}>{group.items.length}</Text>
                    </TouchableOpacity>

                    {isExpanded ? (
                      <FlatList
                        data={group.items}
                        keyExtractor={(i) => String(i.id)}
                        renderItem={renderRow}
                        ItemSeparatorComponent={() => <View style={styles.sep} />}
                        scrollEnabled={false} // inner list won't scroll independently
                      />
                    ) : null}
                  </View>
                );
              }}
            />
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.primary, marginHorizontal: 12, marginBottom: 8 },

  container: { flex: 1, paddingHorizontal: 12 },

  controls: { marginBottom: 8 },
  filterRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 6,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    color: '#111827',
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },

  chipSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    marginRight: 8,
  },
  chipActiveSmall: { backgroundColor: '#e6f0ff' },
  chipTextSmall: { color: '#111827', fontWeight: '700' },
  chipTextActiveSmall: { color: Colors.primary },

  controlsRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  search: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
  },

  sortRow: { flexDirection: 'row', alignItems: 'center' },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginLeft: 6,
  },
  sortBtnActive: { backgroundColor: Colors.primary },
  sortText: { fontSize: 12, fontWeight: '700' },
  sortTextActive: { color: '#fff' },

  loaderWrap: { marginTop: 20, alignItems: 'center' },

  summary: { marginVertical: 8, paddingHorizontal: 4 },
  summaryText: { color: Colors.muted },
  youBest: { marginTop: 6, color: Colors.primary, fontWeight: '700' },

  listContent: { paddingBottom: 28 },

  group: { marginBottom: 12 },
  groupHeader: {
    backgroundColor: Colors.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupTitle: { fontWeight: '800', textTransform: 'capitalize' },
  groupCount: { color: Colors.muted },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  rowMine: {
    backgroundColor: 'rgba(13,110,253,0.06)',
    borderRadius: 10,
  },

  rankWrap: { width: 56, alignItems: 'center' },
  rankText: { fontWeight: '800', fontSize: 16, color: '#0f172a' },
  medal: { fontSize: 18, marginTop: 6 },

  body: { flex: 1, paddingHorizontal: 8 },
  player: { fontWeight: '800', fontSize: 15, color: '#0f172a' },
  playerMine: { color: Colors.primary },
  meta: { marginTop: 4, color: Colors.muted, fontSize: 12 },

  right: { minWidth: 80, alignItems: 'flex-end' },
  dateText: { fontSize: 12, color: Colors.muted },

  sep: { height: 8 },

});

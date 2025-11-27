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

  const [modeFilter, setModeFilter] = useState('all');
  const [gridFilter, setGridFilter] = useState('all');
  const [sortKey, setSortKey] = useState('time');
  const [query, setQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
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

  // FILTERING + SORTING
  const filtered = useMemo(() => {
    let list = scores.slice();

    if (modeFilter !== 'all') {
      list = list.filter((r) => (r.mode || '').toLowerCase() === modeFilter);
    }

    if (gridFilter !== 'all') {
      list = list.filter((r) => Number(r.gridSize) === Number(gridFilter));
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => (r.player || '').toLowerCase().includes(q));
    }

    // Sorting inside each group (global first, then per group)
    if (sortKey === 'time') {
      list.sort((a, b) => (a.time || 0) - (b.time || 0));
    } else if (sortKey === 'mistakes') {
      list.sort((a, b) => (a.mistakes || 0) - (b.mistakes || 0));
    } else if (sortKey === 'recent') {
      list.sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : a.id;
        const tb = b.created_at ? new Date(b.created_at).getTime() : b.id;
        return tb - ta;
      });
    }

    return list;
  }, [scores, modeFilter, gridFilter, query, sortKey]);

  // GROUPING (mode + grid)
  const grouped = useMemo(() => {
    const groups = {};

    for (const s of filtered) {
      const mode = s.mode || 'classic';
      const grid = s.gridSize || 4;
      const key = `${mode}::${grid}`;
      if (!groups[key]) groups[key] = { mode, grid, items: [] };
      groups[key].items.push(s);
    }

    return Object.keys(groups)
      .map(k => ({ key: k, ...groups[k] }))
      .sort((a, b) => {
        if (a.mode === b.mode) return a.grid - b.grid;
        return a.mode.localeCompare(b.mode);
      });
  }, [filtered]);

  // USER'S BEST
  const userBest = useMemo(() => {
    if (!currentUser) return null;
    const mine = scores.filter(s => String(s.userId) === String(currentUser.id));
    if (mine.length === 0) return null;
    mine.sort((a, b) => (a.time || 0) - (b.time || 0));
    return mine[0];
  }, [scores, currentUser]);

  // COLLAPSE/EXPAND
  function toggleGroup(key) {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // RENDER EACH SCORE ROW (ranking per group)
  function renderRow({ item, index, groupItems }) {
    const rank = index + 1;
    const medal = rank === 1 ? '🥇'
                : rank === 2 ? '🥈'
                : rank === 3 ? '🥉'
                : null;

    const isMine = currentUser && String(item.userId) === String(currentUser.id);

    return (
      <View style={[styles.row, isMine && styles.rowMine]}>
        <View style={styles.rankWrap}>
          <Text style={styles.rankText}>{rank}</Text>
          {medal && <Text style={styles.medal}>{medal}</Text>}
        </View>

        <View style={styles.body}>
          <Text style={[styles.player, isMine && styles.playerMine]}>
            {item.player || 'Guest'}
          </Text>
          <Text style={styles.meta}>
            {item.time.toFixed(2)}s • mistakes {item.mistakes} • {item.mode} • {item.gridSize}×{item.gridSize}
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

  // HEADER UI
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
                  {m === 'all' ? 'All' : m === 'classic' ? 'Classic' : 'Time Attack'}
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
              {currentUser && userBest && (
                <Text style={styles.youBest}>
                  Your best: {userBest.time.toFixed(2)}s ({userBest.mode} {userBest.gridSize}×{userBest.gridSize})
                </Text>
              )}
            </View>

            <FlatList
              data={grouped}
              keyExtractor={(g) => g.key}
              contentContainerStyle={styles.listContent}
              renderItem={({ item: group }) => {
                const isExpanded = expandedGroups[group.key] !== false;

                return (
                  <View style={styles.group}>
                    <TouchableOpacity
                      style={styles.groupHeader}
                      onPress={() => toggleGroup(group.key)}
                    >
                      <Text style={styles.groupTitle}>
                        {group.mode} • {group.grid}×{group.grid}
                      </Text>
                      <Text style={styles.groupCount}>{group.items.length}</Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <FlatList
                        data={group.items}
                        keyExtractor={(i) => String(i.id)}
                        renderItem={({ item, index }) =>
                          renderRow({ item, index, groupItems: group.items })
                        }
                        ItemSeparatorComponent={() => <View style={styles.sep} />}
                        scrollEnabled={false}
                      />
                    )}
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
  filterRow: { flexDirection: 'row', flexWrap: 'wrap' },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { color: '#111827', fontWeight: '700' },
  chipTextActive: { color: '#fff' },

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

  sortRow: { flexDirection: 'row' },
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
  },
  groupTitle: { fontWeight: '800', textTransform: 'capitalize' },
  groupCount: { color: Colors.muted },

  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  rowMine: { backgroundColor: 'rgba(13,110,253,0.06)', borderRadius: 10 },

  rankWrap: { width: 56, alignItems: 'center' },
  rankText: { fontWeight: '800', fontSize: 16 },
  medal: { fontSize: 20, marginTop: 4 },

  body: { flex: 1, paddingHorizontal: 8 },
  player: { fontWeight: '800', fontSize: 15 },
  playerMine: { color: Colors.primary },
  meta: { marginTop: 4, color: Colors.muted, fontSize: 12 },

  right: { minWidth: 80, alignItems: 'flex-end' },
  dateText: { fontSize: 12, color: Colors.muted },

  sep: { height: 8 },
});

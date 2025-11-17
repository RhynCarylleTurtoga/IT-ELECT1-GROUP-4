// src/components/NumberGrid.js
import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import NumberCell from './NumberCell';

const { width } = Dimensions.get('window');

export default function NumberGrid({
  gridSize = 4,
  onCorrect = () => {},
  onMistake = () => {},
  disabled = false,
  initialOrder = null,
}) {
  const count = gridSize * gridSize;

  const shuffledInitial = useMemo(() => {
    if (Array.isArray(initialOrder) && initialOrder.length === count) return initialOrder.slice();
    const arr = Array.from({ length: count }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [gridSize, initialOrder]);

  const [cells, setCells] = useState(shuffledInitial);
  const [nextTarget, setNextTarget] = useState(1);
  const [statusMap, setStatusMap] = useState({});

  // container width used by GameScreen gridWrap: keep consistent with that
  const containerWidth = Math.min(width - 36, 520);

  // gap between tiles (px). Tune this (smaller => larger tiles)
  const gap = 12;

  // compute cell size so gridSize tiles + gaps fit inside containerWidth
  // totalGapWidth = gap * (gridSize - 1)
  // availableForTiles = containerWidth - totalGapWidth
  // cellSize = floor(availableForTiles / gridSize)
  const totalGap = gap * (gridSize - 1);
  const cellSize = Math.floor((containerWidth - totalGap) / gridSize);

  useEffect(() => {
    setCells(shuffledInitial);
    setNextTarget(1);
    setStatusMap({});
  }, [gridSize, shuffledInitial]);

  function handlePress(value) {
    if (disabled) return;
    if (value === nextTarget) {
      setStatusMap(s => ({ ...s, [value]: 'correct' }));
      setNextTarget(n => n + 1);
      onCorrect({ value, next: nextTarget });
    } else {
      setStatusMap(s => ({ ...s, [value]: 'wrong' }));
      onMistake({ value, next: nextTarget });
      setTimeout(() => {
        setStatusMap(s => {
          const copy = { ...s };
          if (copy[value] === 'wrong') delete copy[value];
          return copy;
        });
      }, 400);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { width: containerWidth, marginHorizontal: 0 }]}>
        {cells.map((v, i) => (
          <View
            key={v}
            style={{
              width: cellSize,
              height: cellSize,
              marginRight: (i % gridSize) === (gridSize - 1) ? 0 : gap,
              marginBottom: gap,
            }}
          >
            <NumberCell
              value={v}
              onPress={() => handlePress(v)}
              status={statusMap[v] || (v < nextTarget ? 'correct' : 'idle')}
              size={cellSize}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
});

import { memo, useMemo } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Svg, { G, Rect } from 'react-native-svg';

interface Props {
  weeksLived: number;
  totalWeeks: number;
  onSquareLongPress?: (weekIndex: number) => void;
}

const COLS = 52;
const GAP = 2;

// Renders every week of the user's estimated life as a coloured square.
// Performance contract: single SVG element, two G groups (lived / remaining),
// all positions computed once in useMemo. Never re-renders unless props change.
export const WeekGrid = memo(function WeekGrid({ weeksLived, totalWeeks }: Props) {
  const { width } = useWindowDimensions();
  const availableWidth = width - 48; // 24px padding each side
  const dotSize = Math.floor((availableWidth - 51 * GAP) / COLS);
  const cellSize = dotSize + GAP;

  const rows = Math.ceil(totalWeeks / COLS);
  const gridWidth = COLS * cellSize - GAP;
  const gridHeight = rows * cellSize - GAP;

  // Build two flat arrays of <Rect> — one per colour group.
  // Grouping inside <G fill="…"> avoids a fill attribute on every element,
  // cutting the SVG node size roughly in half.
  const { livedRects, remainingRects } = useMemo(() => {
    const lived: React.ReactElement[] = [];
    const remaining: React.ReactElement[] = [];

    for (let i = 0; i < totalWeeks; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = col * cellSize;
      const y = row * cellSize;
      const el = (
        <Rect
          key={i}
          x={x}
          y={y}
          width={dotSize}
          height={dotSize}
          rx={1}
          ry={1}
        />
      );
      if (i < weeksLived) {
        lived.push(el);
      } else {
        remaining.push(el);
      }
    }

    return { livedRects: lived, remainingRects: remaining };
  }, [weeksLived, totalWeeks, dotSize, cellSize]);

  return (
    <View>
      <Svg width={gridWidth} height={gridHeight}>
        <G fill="#d4537e">{livedRects}</G>
        <G fill="#1e1e1e">{remainingRects}</G>
      </Svg>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}
      >
        <Text style={{ fontSize: 10, color: '#333' }}>each square = 1 week</Text>
        <Text style={{ fontSize: 10, color: '#333' }}>{weeksLived} weeks lived</Text>
      </View>
    </View>
  );
});

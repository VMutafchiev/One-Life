import { memo, useMemo, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  useAnimatedReaction,
} from 'react-native-reanimated';
import Svg, { G, Rect } from 'react-native-svg';

interface Props {
  /** Total number of squares in the grid */
  total: number;
  /** 0-based index of the square currently being consumed (counts down) */
  currentIndex: number;
  /** Fraction [0,1] through the current square */
  progress: number;
  accentColor?: string;
  /** If true, the grid fills from left; if false, squares vanish from left (countdown) */
  countUp?: boolean;
  cols?: number;
  /** Horizontal padding already applied by parent — affects available width */
  horizontalPadding?: number;
}

const GAP = 2;
const PAST_COLOR = '#1e1e1e';

export const TimeGrid = memo(function TimeGrid({
  total,
  currentIndex,
  progress,
  accentColor = '#d4537e',
  countUp = false,
  cols: colsProp,
  horizontalPadding = 48,
}: Props) {
  const { width } = useWindowDimensions();
  const availableWidth = width - horizontalPadding;

  // Pick a COLS count that fits nicely
  const COLS = colsProp ?? (total <= 24 ? 12 : total <= 60 ? 12 : 52);

  const dotSize = Math.floor((availableWidth - (COLS - 1) * GAP) / COLS);
  const cellSize = dotSize + GAP;

  const rows = Math.ceil(total / COLS);
  const gridWidth = COLS * cellSize - GAP;
  const gridHeight = rows * cellSize - GAP;

  // Flash animation when currentIndex changes
  const flashOpacity = useSharedValue(0);
  const prevIndex = useRef(currentIndex);

  useAnimatedReaction(
    () => currentIndex,
    (curr) => {
      if (curr !== prevIndex.current) {
        prevIndex.current = curr;
        flashOpacity.value = withSequence(
          withTiming(1, { duration: 80 }),
          withTiming(0, { duration: 300 }),
        );
      }
    },
  );

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const { pastRects, futureRects, currentRect } = useMemo(() => {
    const past: React.ReactElement[] = [];
    const future: React.ReactElement[] = [];
    let cur: { x: number; y: number } | null = null;

    for (let i = 0; i < total; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = col * cellSize;
      const y = row * cellSize;

      if (i === currentIndex) {
        cur = { x, y };
        // Current square goes into future (will be overlaid by the animated View)
        future.push(
          <Rect key={i} x={x} y={y} width={dotSize} height={dotSize} rx={1} ry={1} />,
        );
      } else if (countUp ? i < currentIndex : i > currentIndex) {
        past.push(
          <Rect key={i} x={x} y={y} width={dotSize} height={dotSize} rx={1} ry={1} />,
        );
      } else {
        future.push(
          <Rect key={i} x={x} y={y} width={dotSize} height={dotSize} rx={1} ry={1} />,
        );
      }
    }

    return { pastRects: past, futureRects: future, currentRect: cur };
  }, [total, currentIndex, countUp, COLS, cellSize, dotSize]);

  // Current-square overlay position (absolute, on top of SVG)
  const overlayLeft = currentRect ? currentRect.x : 0;
  const overlayTop = currentRect ? currentRect.y : 0;

  // Interpolate current square color from accentColor toward PAST_COLOR based on progress
  // We use accentColor for the animated overlay; the underlying SVG square is future-colored
  const overlayStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: overlayLeft,
    top: overlayTop,
    width: dotSize,
    height: dotSize,
    borderRadius: 1,
    backgroundColor: accentColor,
    // Vanish as progress increases: scale down + fade slightly
    opacity: 1 - progress * 0.4,
    transform: [{ scale: 1 - progress * 0.15 }],
  }));

  return (
    <View style={{ position: 'relative' }}>
      <Svg width={gridWidth} height={gridHeight}>
        <G fill={PAST_COLOR}>{pastRects}</G>
        <G fill={accentColor === '#d4537e' ? '#2a1520' : '#1a1a2e'}>{futureRects}</G>
      </Svg>

      {/* Animated current-square overlay — NOT inside SVG for Reanimated compatibility */}
      {currentRect && (
        <Animated.View style={overlayStyle} />
      )}

      {/* Flash overlay on tick */}
      {currentRect && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: overlayLeft - 4,
              top: overlayTop - 4,
              width: dotSize + 8,
              height: dotSize + 8,
              borderRadius: 4,
              backgroundColor: accentColor,
            },
            flashStyle,
          ]}
        />
      )}
    </View>
  );
});

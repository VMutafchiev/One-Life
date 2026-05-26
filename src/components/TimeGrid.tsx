import { memo, useEffect, useMemo, useRef } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Rect } from 'react-native-svg';

interface Props {
  total: number;
  currentIndex: number;
  progress: number;
  accentColor?: string;
  countUp?: boolean;
  cols?: number;
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

  const COLS = colsProp ?? (total <= 24 ? 12 : total <= 60 ? 12 : 52);
  const dotSize = Math.floor((availableWidth - (COLS - 1) * GAP) / COLS);
  const cellSize = dotSize + GAP;
  const rows = Math.ceil(total / COLS);
  const gridWidth = COLS * cellSize - GAP;
  const gridHeight = rows * cellSize - GAP;

  // Flash when current square changes
  const flashOpacity = useSharedValue(0);
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (currentIndex !== prevIndexRef.current) {
      prevIndexRef.current = currentIndex;
      flashOpacity.value = withSequence(
        withTiming(1, { duration: 70 }),
        withTiming(0, { duration: 280 }),
      );
    }
  }, [currentIndex, flashOpacity]);

  // Continuous pulse on current square
  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 650 }),
        withTiming(0.9, { duration: 650 }),
      ),
      -1,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));

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
        future.push(<Rect key={i} x={x} y={y} width={dotSize} height={dotSize} rx={1} ry={1} />);
      } else if (countUp ? i < currentIndex : i > currentIndex) {
        past.push(<Rect key={i} x={x} y={y} width={dotSize} height={dotSize} rx={1} ry={1} />);
      } else {
        future.push(<Rect key={i} x={x} y={y} width={dotSize} height={dotSize} rx={1} ry={1} />);
      }
    }

    return { pastRects: past, futureRects: future, currentRect: cur };
  }, [total, currentIndex, countUp, COLS, cellSize, dotSize]);

  const overlayLeft = currentRect ? currentRect.x : 0;
  const overlayTop = currentRect ? currentRect.y : 0;

  const overlayStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: overlayLeft,
    top: overlayTop,
    width: dotSize,
    height: dotSize,
    borderRadius: 2,
    backgroundColor: accentColor,
    opacity: 1 - progress * 0.35,
    transform: [{ scale: pulseScale.value * (1 - progress * 0.1) }],
  }));

  const futureColor = accentColor === '#d4537e' ? '#2a1520' : '#1a1a2e';

  return (
    <View style={{ position: 'relative' }}>
      <Svg width={gridWidth} height={gridHeight}>
        <G fill={PAST_COLOR}>{pastRects}</G>
        <G fill={futureColor}>{futureRects}</G>
      </Svg>

      {currentRect && <Animated.View style={overlayStyle} />}

      {currentRect && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: overlayLeft - 5,
              top: overlayTop - 5,
              width: dotSize + 10,
              height: dotSize + 10,
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

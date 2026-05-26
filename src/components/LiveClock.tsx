import { useEffect, useState } from 'react';
import { Dimensions, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  baseDays: number;
  earnedMinutes: number;
}

const { width } = Dimensions.get('window');
const NUMBER_FONT_SIZE = width <= 375 ? 52 : 64;

function totalDays(baseDays: number, earnedMinutes: number): number {
  return baseDays + Math.floor(earnedMinutes / 1440);
}

export function LiveClock({ baseDays, earnedMinutes }: Props) {
  const [days, setDays] = useState(() => totalDays(baseDays, earnedMinutes));
  const pulse = useSharedValue(1);

  // Recalculate whenever props change.
  useEffect(() => {
    setDays(totalDays(baseDays, earnedMinutes));
  }, [baseDays, earnedMinutes]);

  // Tick every 60 seconds — days don't change by the second.
  useEffect(() => {
    const id = setInterval(() => {
      setDays(totalDays(baseDays, earnedMinutes));
    }, 60_000);
    return () => clearInterval(id);
  }, [baseDays, earnedMinutes]);

  // Subtle 4-second breathing pulse on the subtitle to signal time passing.
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 2000 }),
        withTiming(1.0, { duration: 2000 }),
      ),
      -1,
    );
  // pulse is a stable shared-value ref — intentionally excluded from deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <>
      <Animated.Text
        style={[
          {
            fontSize: 10,
            color: '#444',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: 8,
          },
          pulseStyle,
        ]}
      >
        days remaining
      </Animated.Text>

      <Text
        style={{
          fontFamily: 'Courier',
          fontSize: NUMBER_FONT_SIZE,
          fontWeight: '500',
          color: '#f0f0f0',
          letterSpacing: -2,
          textAlign: 'center',
        }}
      >
        {days.toLocaleString()}
      </Text>

      <Text
        style={{
          fontSize: 10,
          color: '#333',
          textAlign: 'center',
          marginTop: 6,
        }}
      >
        est. based on your profile
      </Text>
    </>
  );
}

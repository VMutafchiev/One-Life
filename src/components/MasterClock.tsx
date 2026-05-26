import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { getLiveTimeUnits, type TimeUnits } from '@/lib/timeCalc';

interface Props {
  daysRemaining: number;
  earnedMinutes: number;
}

interface UnitDisplay {
  key: keyof TimeUnits;
  label: string;
  decimals: number;
}

// 6 units — seconds and ms are combined into one cell below
const UNITS: UnitDisplay[] = [
  { key: 'years',   label: 'years', decimals: 2 },
  { key: 'weeks',   label: 'weeks', decimals: 1 },
  { key: 'days',    label: 'days',  decimals: 0 },
  { key: 'hours',   label: 'hours', decimals: 0 },
  { key: 'minutes', label: 'min',   decimals: 0 },
];

const cellStyle = {
  flex: 1,
  alignItems: 'center' as const,
  paddingVertical: 10,
  backgroundColor: '#111',
  borderWidth: 0.5,
  borderColor: '#1e1e1e',
  borderRadius: 8,
  margin: 3,
};

const monoText = {
  fontFamily: 'Courier',
  fontSize: 15,
  color: '#f0f0f0',
  letterSpacing: -0.5,
  includeFontPadding: false,
};

const labelText = {
  fontSize: 9,
  color: '#444',
  marginTop: 3,
};

function UnitCell({ label, value, decimals }: { label: string; value: number; decimals: number }) {
  const flash = useSharedValue(1);
  const prevRef = useRef(Math.floor(value));

  useEffect(() => {
    const intPart = Math.floor(value);
    if (intPart !== prevRef.current) {
      prevRef.current = intPart;
      flash.value = withSequence(
        withTiming(0.3, { duration: 60 }),
        withTiming(1, { duration: 200 }),
      );
    }
  });

  const animStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const formatted = decimals === 0 ? Math.floor(value).toLocaleString() : value.toFixed(decimals);

  return (
    <View style={cellStyle}>
      <Animated.Text style={[monoText, animStyle]}>{formatted}</Animated.Text>
      <Text style={labelText}>{label}</Text>
    </View>
  );
}

// Combined seconds + milliseconds cell
function SecMsCell({ secondsTotal }: { secondsTotal: number }) {
  const flash = useSharedValue(1);
  const prevRef = useRef(Math.floor(secondsTotal));

  useEffect(() => {
    const intPart = Math.floor(secondsTotal);
    if (intPart !== prevRef.current) {
      prevRef.current = intPart;
      flash.value = withSequence(
        withTiming(0.3, { duration: 60 }),
        withTiming(1, { duration: 200 }),
      );
    }
  });

  const animStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const intPart = Math.floor(secondsTotal).toLocaleString();
  const msPart = String(Math.floor((secondsTotal % 1) * 1000)).padStart(3, '0');

  return (
    <View style={cellStyle}>
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'baseline' }, animStyle]}>
        <Text style={monoText}>{intPart}</Text>
        <Text style={{ fontFamily: 'Courier', fontSize: 10, color: '#555', letterSpacing: -0.5 }}>
          .{msPart}
        </Text>
      </Animated.View>
      <Text style={labelText}>sec · ms</Text>
    </View>
  );
}

export function MasterClock({ daysRemaining, earnedMinutes }: Props) {
  const [units, setUnits] = useState<TimeUnits>(() =>
    getLiveTimeUnits(daysRemaining, earnedMinutes),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setUnits(getLiveTimeUnits(daysRemaining, earnedMinutes));
    }, 100);
    return () => clearInterval(id);
  }, [daysRemaining, earnedMinutes]);

  // 3 + 3 layout
  const row1 = UNITS.slice(0, 3);
  const row2 = UNITS.slice(3, 5);

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        {row1.map((u) => (
          <UnitCell key={u.key} label={u.label} value={units[u.key]} decimals={u.decimals} />
        ))}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {row2.map((u) => (
          <UnitCell key={u.key} label={u.label} value={units[u.key]} decimals={u.decimals} />
        ))}
        <SecMsCell secondsTotal={units.seconds} />
      </View>
    </View>
  );
}

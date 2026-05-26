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

const UNITS: UnitDisplay[] = [
  { key: 'years',   label: 'years',   decimals: 2 },
  { key: 'weeks',   label: 'weeks',   decimals: 1 },
  { key: 'days',    label: 'days',    decimals: 0 },
  { key: 'hours',   label: 'hours',   decimals: 0 },
  { key: 'minutes', label: 'min',     decimals: 0 },
  { key: 'seconds', label: 'sec',     decimals: 0 },
  { key: 'ms',      label: 'ms',      decimals: 0 },
];

function UnitCell({ label, value, decimals }: { label: string; value: number; decimals: number }) {
  const flash = useSharedValue(1);
  const prevRef = useRef(Math.round(value));

  const rounded = decimals === 0 ? Math.floor(value) : parseFloat(value.toFixed(decimals));

  // Flash when integer part changes
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

  const formatted =
    decimals === 0
      ? Math.floor(value).toLocaleString()
      : value.toFixed(decimals);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#111',
        borderWidth: 0.5,
        borderColor: '#1e1e1e',
        borderRadius: 8,
        margin: 3,
      }}
    >
      <Animated.Text
        style={[
          {
            fontFamily: 'Courier',
            fontSize: 15,
            color: '#f0f0f0',
            letterSpacing: -0.5,
            includeFontPadding: false,
          },
          animStyle,
        ]}
      >
        {formatted}
      </Animated.Text>
      <Text style={{ fontSize: 9, color: '#444', marginTop: 3 }}>{label}</Text>
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

  // 4-column grid layout (7 items → rows of 4, 3, or 4+3)
  const rows: UnitDisplay[][] = [];
  for (let i = 0; i < UNITS.length; i += 4) {
    rows.push(UNITS.slice(i, i + 4));
  }

  return (
    <View style={{ paddingHorizontal: 16 }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map((u) => (
            <UnitCell
              key={u.key}
              label={u.label}
              value={units[u.key]}
              decimals={u.decimals}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

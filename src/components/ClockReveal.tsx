import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  daysRemaining: number;
  onShare: () => void;
  onRefine: () => void;
  onContinue: () => void;
}

export function ClockReveal({ daysRemaining, onShare, onRefine, onContinue }: Props) {
  const opacity = useSharedValue(0);
  const progress = useSharedValue(0);
  const [count, setCount] = useState(0);

  // Bridge the animated value back to JS so Text re-renders with each tick.
  useAnimatedReaction(
    () => Math.round(progress.value),
    (current) => runOnJS(setCount)(current),
  );

  useEffect(() => {
    // Screen fades in over 0.8s, count-up starts 0.3s after fade begins.
    opacity.value = withTiming(1, { duration: 800 });
    progress.value = withDelay(
      300,
      withTiming(daysRemaining, {
        duration: 2500,
        easing: Easing.out(Easing.cubic),
      }),
    );
  // Run once on mount — deps intentionally empty.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingBottom: 48,
        },
        fadeStyle,
      ]}
    >
      {/* "your life" label */}
      <Text
        style={{
          fontSize: 10,
          color: '#444',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginBottom: 20,
        }}
      >
        your life
      </Text>

      {/* Animated count-up number */}
      <Text
        style={{
          fontFamily: 'Courier',
          fontSize: 56,
          fontWeight: '500',
          color: '#f0f0f0',
          letterSpacing: -2,
          textAlign: 'center',
        }}
      >
        {count.toLocaleString()}
      </Text>

      {/* "days remaining" subtitle */}
      <Text
        style={{
          fontSize: 11,
          color: '#444',
          marginTop: 10,
          marginBottom: 36,
        }}
      >
        days remaining
      </Text>

      {/* Separator */}
      <View
        style={{
          height: 1,
          backgroundColor: '#1a1a1a',
          width: '100%',
          marginBottom: 28,
        }}
      />

      {/* Disclaimer */}
      <Text
        style={{
          fontSize: 11,
          color: '#333',
          textAlign: 'center',
          fontStyle: 'italic',
          lineHeight: 17,
          marginBottom: 44,
        }}
      >
        Statistical estimate based on peer-reviewed research.{'\n'}Not medical advice.
      </Text>

      {/* Primary CTA */}
      <Pressable
        onPress={onShare}
        style={({ pressed }) => ({
          width: '100%',
          height: 52,
          backgroundColor: '#d4537e',
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff' }}>
          Share your grid →
        </Text>
      </Pressable>

      {/* Secondary CTA */}
      <Pressable
        onPress={onRefine}
        style={({ pressed }) => ({
          width: '100%',
          height: 48,
          borderWidth: 0.5,
          borderColor: '#333',
          borderRadius: 12,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 14, color: '#555' }}>
          Make it more accurate →
        </Text>
      </Pressable>

      {/* Tertiary text link */}
      <Pressable onPress={onContinue}>
        <Text style={{ fontSize: 12, color: '#333' }}>
          Continue to my clock
        </Text>
      </Pressable>
    </Animated.View>
  );
}

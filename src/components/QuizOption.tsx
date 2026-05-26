import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
}

export function QuizOption({ label, selected, onPress, icon }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          {
            height: 48,
            borderRadius: 10,
            backgroundColor: selected ? '#1a0a0e' : '#111',
            borderWidth: selected ? 1 : 0.5,
            borderColor: selected ? '#d4537e' : '#222',
            justifyContent: 'center',
            paddingHorizontal: 16,
            marginBottom: 8,
          },
          animatedStyle,
        ]}
      >
        <Text
          style={{
            fontSize: 14,
            color: selected ? '#f0f0f0' : '#888',
            fontWeight: selected ? '500' : '400',
          }}
        >
          {icon ? `${icon}  ${label}` : label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

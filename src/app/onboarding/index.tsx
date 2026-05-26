import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ClockReveal } from '@/components/ClockReveal';
import { QuizOption } from '@/components/QuizOption';
import { calculateDaysRemaining } from '@/lib/lifeCalc';
import type { QuizAnswers } from '@/lib/lifeCalc';
import { requestNotificationPermission, scheduleDailyNotification } from '@/lib/notifications';
import { useLifeStore } from '@/store/useLifeStore';

type Step = 0 | 1 | 2 | 'reveal';

const AGE_MIN = 15;
const AGE_MAX = 90;

// Neutral defaults for the 9 questions not asked in the fast-track quiz.
// Each maps to a 0-year adjustment so the initial clock reflects only age + sex + smoking.
const NEUTRAL_DEFAULTS: Omit<QuizAnswers, 'age' | 'sex' | 'smoker'> = {
  alcohol: 'occasional',
  exercise: 'low',
  bmi: 'healthy',
  sleep: 'seven_eight',
  stress: 'low',
  diet: 'average',
  social: 'average',
  conditions: 'none',
  family: 'average',
};

function ProgressBar({ step }: { step: Step }) {
  const stepIndex = step === 'reveal' ? 3 : step;
  const seg0 = useSharedValue(1); // step 0 is entered on mount
  const seg1 = useSharedValue(0);
  const seg2 = useSharedValue(0);

  const seg0Style = useAnimatedStyle(() => ({ opacity: seg0.value }));
  const seg1Style = useAnimatedStyle(() => ({ opacity: seg1.value }));
  const seg2Style = useAnimatedStyle(() => ({ opacity: seg2.value }));

  useEffect(() => {
    seg0.value = withTiming(stepIndex >= 0 ? 1 : 0, { duration: 300 });
    seg1.value = withTiming(stepIndex >= 1 ? 1 : 0, { duration: 300 });
    seg2.value = withTiming(stepIndex >= 2 ? 1 : 0, { duration: 300 });
  // seg0/seg1/seg2 are stable shared-value refs — intentionally excluded from deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  const segments = [
    { style: seg0Style },
    { style: seg1Style },
    { style: seg2Style },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
      }}
    >
      {segments.map(({ style }, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 2,
            backgroundColor: '#1e1e1e',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#d4537e',
              },
              style,
            ]}
          />
        </View>
      ))}
    </View>
  );
}

function ContinueButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        width: '100%',
        height: 52,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 32,
        opacity: disabled ? 0.2 : 1,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#0c0c0c' }}>
        Continue
      </Text>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // Step 0
  const [age, setAge] = useState(30);
  const [sliderWidth, setSliderWidth] = useState(300);
  const sliderWidthRef = useRef(300);

  // Step 1
  const [sex, setSex] = useState<QuizAnswers['sex'] | null>(null);

  // Step 2
  const [smoker, setSmoker] = useState<QuizAnswers['smoker'] | null>(null);

  // Reveal
  const [calculatedDays, setCalculatedDays] = useState(0);

  const { setDaysRemaining, setQuizAnswers, setHasCompletedQuiz } = useLifeStore();

  // Keep the update function in a ref so PanResponder (created once) always calls the latest version.
  const updateAgeRef = useRef<(x: number) => void>(() => {});
  updateAgeRef.current = (x: number) => {
    const ratio = Math.max(0, Math.min(1, x / sliderWidthRef.current));
    setAge(Math.round(AGE_MIN + ratio * (AGE_MAX - AGE_MIN)));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: ({ nativeEvent }) =>
        updateAgeRef.current(nativeEvent.locationX),
      onPanResponderMove: ({ nativeEvent }) =>
        updateAgeRef.current(nativeEvent.locationX),
    }),
  ).current;

  function goForward(next: Step) {
    setDirection('forward');
    setStep(next);
  }

  function goBack() {
    setDirection('back');
    if (step === 1) setStep(0);
    else if (step === 2) setStep(1);
  }

  function handleContinueStep2() {
    if (!smoker || !sex) return;
    const answers: QuizAnswers = { age, sex, smoker, ...NEUTRAL_DEFAULTS };
    const days = calculateDaysRemaining(answers);
    setCalculatedDays(days);
    setDaysRemaining(days);
    setQuizAnswers({ age, sex, smoker });
    setHasCompletedQuiz(true);
    goForward('reveal');
  }

  async function handleShare() {
    await requestNotificationPermission();
    await scheduleDailyNotification(calculatedDays);
    router.replace('/(tabs)');
  }

  function handleRefine() {
    // /onboarding/refine is built in a later prompt — go home for now.
    router.replace('/(tabs)');
  }

  function handleContinue() {
    router.replace('/(tabs)');
  }

  // Reveal step uses the full screen — render before the shared chrome.
  if (step === 'reveal') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0c0c' }}>
        <ClockReveal
          daysRemaining={calculatedDays}
          onShare={handleShare}
          onRefine={handleRefine}
          onContinue={handleContinue}
        />
      </SafeAreaView>
    );
  }

  const enterAnim =
    direction === 'forward'
      ? FadeInRight.duration(250)
      : FadeInLeft.duration(250);
  const exitAnim =
    direction === 'forward'
      ? FadeOutLeft.duration(250)
      : FadeOutRight.duration(250);

  const thumbLeft =
    ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * (sliderWidth - 22);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0c0c' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ProgressBar step={step} />

        {/* Back button row — hidden on step 0 */}
        <View style={{ height: 44, justifyContent: 'center', paddingHorizontal: 24 }}>
          {step > 0 && (
            <Pressable onPress={goBack} hitSlop={12}>
              <Text style={{ fontSize: 20, color: '#555' }}>←</Text>
            </Pressable>
          )}
        </View>

        {/* Step content — absolutely positioned so entering and exiting views overlap cleanly */}
        <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {step === 0 && (
            <Animated.View
              key="step-0"
              entering={enterAnim}
              exiting={exitAnim}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '500',
                  color: '#f0f0f0',
                  marginBottom: 8,
                }}
              >
                How old are you?
              </Text>
              <Text style={{ fontSize: 13, color: '#555', marginBottom: 40 }}>
                Your baseline starts here.
              </Text>

              {/* Large age display */}
              <Text
                style={{
                  fontFamily: 'Courier',
                  fontSize: 64,
                  color: '#f0f0f0',
                  textAlign: 'center',
                  marginBottom: 32,
                }}
              >
                {age}
              </Text>

              {/* Custom slider */}
              <View
                style={{ height: 32, justifyContent: 'center', marginBottom: 48 }}
                onLayout={(e) => {
                  const w = e.nativeEvent.layout.width;
                  sliderWidthRef.current = w;
                  setSliderWidth(w);
                }}
                {...panResponder.panHandlers}
              >
                {/* Track background */}
                <View
                  style={{
                    height: 4,
                    backgroundColor: '#1e1e1e',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {/* Filled track */}
                  <View
                    style={{
                      height: '100%',
                      width: `${((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100}%`,
                      backgroundColor: '#d4537e',
                      borderRadius: 2,
                    }}
                  />
                </View>

                {/* Thumb */}
                <View
                  style={{
                    position: 'absolute',
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: '#d4537e',
                    top: 5,
                    left: thumbLeft,
                    shadowColor: '#d4537e',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 6,
                  }}
                />
              </View>

              <ContinueButton onPress={() => goForward(1)} disabled={false} />
            </Animated.View>
          )}

          {step === 1 && (
            <Animated.View
              key="step-1"
              entering={enterAnim}
              exiting={exitAnim}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '500',
                  color: '#f0f0f0',
                  marginBottom: 8,
                }}
              >
                Biological sex?
              </Text>
              <Text style={{ fontSize: 13, color: '#555', marginBottom: 32 }}>
                Affects baseline by up to 5 years.
              </Text>

              <QuizOption
                label="Male"
                selected={sex === 'male'}
                onPress={() => setSex('male')}
              />
              <QuizOption
                label="Female"
                selected={sex === 'female'}
                onPress={() => setSex('female')}
              />
              <QuizOption
                label="Prefer not to say"
                selected={sex === 'other'}
                onPress={() => setSex('other')}
              />

              <ContinueButton
                onPress={() => { if (sex) goForward(2); }}
                disabled={sex === null}
              />
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View
              key="step-2"
              entering={enterAnim}
              exiting={exitAnim}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '500',
                  color: '#f0f0f0',
                  marginBottom: 8,
                }}
              >
                Do you smoke?
              </Text>
              <Text style={{ fontSize: 13, color: '#555', marginBottom: 32 }}>
                The single biggest lifestyle factor.
              </Text>

              <QuizOption
                label="Never"
                selected={smoker === 'never'}
                onPress={() => setSmoker('never')}
              />
              <QuizOption
                label="Quit 5+ years ago"
                selected={smoker === 'quit'}
                onPress={() => setSmoker('quit')}
              />
              <QuizOption
                label="1–10 per day"
                selected={smoker === 'light'}
                onPress={() => setSmoker('light')}
              />
              <QuizOption
                label="11–20 per day"
                selected={smoker === 'moderate'}
                onPress={() => setSmoker('moderate')}
              />
              <QuizOption
                label="20+ per day"
                selected={smoker === 'heavy'}
                onPress={() => setSmoker('heavy')}
              />

              <ContinueButton onPress={handleContinueStep2} disabled={smoker === null} />
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

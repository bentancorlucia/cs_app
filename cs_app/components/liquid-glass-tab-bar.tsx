import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClubColors } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Check if native glass effect is available (iOS 26+)
const useNativeGlass = isLiquidGlassAvailable();

interface TabButtonProps {
  onPress: () => void;
  onLongPress: () => void;
  icon: React.ReactNode;
}

function TabButton({ onPress, onLongPress, icon }: TabButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      style={[styles.tabButton, animatedStyle]}
    >
      <View style={styles.tabButtonInner}>{icon}</View>
    </AnimatedPressable>
  );
}

function GlassContainer({ children }: { children: React.ReactNode }) {
  if (useNativeGlass) {
    // Use native iOS 26 liquid glass effect with maroon tint
    return (
      <GlassView
        style={styles.glassContainer}
        glassEffectStyle="regular"
        tintColor="rgba(115, 13, 50, 0.6)"
      >
        {children}
      </GlassView>
    );
  }

  // Fallback for older iOS versions and Android
  return (
    <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
      <View style={styles.baseTint} />
      <View style={styles.innerBorder} />
      {children}
    </BlurView>
  );
}

export function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Shadow for depth (only on fallback, native glass has its own) */}
      {!useNativeGlass && (
        <View style={styles.shadowContainer}>
          <View style={styles.shadow} />
        </View>
      )}

      <GlassContainer>
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];

            // Skip hidden tabs (href is expo-router specific, tabBarStyle.display for react-navigation)
            const tabBarStyle = options.tabBarStyle as { display?: string } | undefined;
            if (
              (options as { href?: null }).href === null ||
              tabBarStyle?.display === 'none' ||
              !options.tabBarIcon
            ) {
              return null;
            }

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const icon = options.tabBarIcon?.({
              focused: isFocused,
              color: isFocused ? ClubColors.secondary : 'rgba(255, 255, 255, 0.9)',
              size: 28,
            });

            return (
              <TabButton
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                icon={icon}
              />
            );
          })}
        </View>
      </GlassContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  shadowContainer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    height: 56,
    zIndex: -1,
  },
  shadow: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  glassContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 4,
  },
  blurContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 4,
  },
  baseTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(115, 13, 50, 0.5)',
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
});

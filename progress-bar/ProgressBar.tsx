import React, { useEffect, useRef } from "react";
import {
  ColorValue,
  StyleSheet,
  View,
  Text,
  Animated,
  StyleProp,
  ViewStyle,
} from "react-native";

interface IProgressBarProps {
  numberOfSteps: number;
  currentStep: number;
  inActiveBgColor?: ColorValue;
  activeBgColor?: ColorValue;
  progressType?: "line" | "circle" | "dashed";
  activeCircleTextColor?: ColorValue;
  inActiveCircleTextColor?: ColorValue;
  submittedCircleTextColor?: ColorValue;
  addedSteps?: number[];
  animationDuration?: number;
  containerStyle?: StyleProp<ViewStyle>;
  childrenStyle?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<IProgressBarProps> = ({
  numberOfSteps,
  currentStep,
  inActiveBgColor,
  activeBgColor,
  progressType = "line",
  activeCircleTextColor,
  inActiveCircleTextColor,
  submittedCircleTextColor,
  addedSteps,
  animationDuration = 500,
  containerStyle,
  childrenStyle,
}) => {
  // Animation value for line and dashed progress
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Animation values for each circle
  const circleAnims = useRef(
    Array.from({ length: numberOfSteps }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (progressType === "line" || progressType === "dashed") {
      // Animate the progress for line and dashed types
      Animated.timing(progressAnim, {
        toValue: currentStep,
        duration: animationDuration,
        useNativeDriver: false,
      }).start();
    } else if (progressType === "circle") {
      // Animate each circle individually
      circleAnims.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: index < currentStep ? 1 : 0,
          duration: animationDuration,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [currentStep, progressType, animationDuration]);

  const getCurrentTextColor = (stepIndex: number) => {
    const currStepIndex = stepIndex + 1;
    if (currStepIndex === currentStep) {
      return activeCircleTextColor || "#FFFFFF";
    } else {
      return inActiveCircleTextColor || "#000000";
    }
  };

  const renderLineProgress = () => {
    // Interpolate the animated value to percentage
    const progressPercentage = progressAnim.interpolate({
      inputRange: [0, numberOfSteps],
      outputRange: ["0%", "100%"],
    });

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: inActiveBgColor || "#e0e0e0",
          },
          containerStyle,
        ]}>
        <Animated.View
          style={[
            styles.progress,
            {
              width: progressPercentage,
              backgroundColor: activeBgColor || "#3b5998",
            },
            childrenStyle,
          ]}
        />
      </View>
    );
  };

  const renderCircleProgress = () => {
    // Calculate circle size based on number of steps
    const circleSize = Math.min(40, (100 / numberOfSteps) * 3.5);
    const fontSize = Math.min(14, circleSize * 0.35);

    return (
      <View style={[styles.dashedContainer, containerStyle]}>
        {Array.from({ length: numberOfSteps }).map((_, index) => {
          const submitted = addedSteps?.some((_, i) => i + 1 === index + 1);

          // Interpolate background color from inactive to active
          const backgroundColor = circleAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [
              (inActiveBgColor as string) || "#e0e0e0",
              (activeBgColor as string) || "#3b5998",
            ],
          });

          // Add a subtle scale animation for filling effect
          const scale = circleAnims[index].interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 1.15, 1],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.circleContainer,
                {
                  width: circleSize,
                  height: circleSize,
                  borderRadius: circleSize / 2,
                  backgroundColor,
                  transform: [{ scale }],
                },
                childrenStyle,
              ]}>
              <Text
                style={[
                  styles.circleText,
                  {
                    fontSize,
                    color: submitted
                      ? submittedCircleTextColor || getCurrentTextColor(index)
                      : getCurrentTextColor(index),
                  },
                ]}>
                {index + 1}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const renderDashedProgress = () => {
    return (
      <View style={styles.dashedContainer}>
        {Array.from({ length: numberOfSteps }).map((_, index) => {
          // Interpolate width for each dash segment
          const dashWidth = progressAnim.interpolate({
            inputRange: [index, index + 1],
            outputRange: ["0%", "100%"],
            extrapolate: "clamp",
          });

          const isCompleted = index < currentStep - 1;
          const isAnimating = index === currentStep - 1;

          return (
            <View
              key={index}
              style={[
                styles.dashedLineWrapper,
                {
                  width: `${100 / numberOfSteps - 1}%`,
                },
                containerStyle,
              ]}>
              {/* Background inactive dash */}
              <View
                style={[
                  styles.dashedLine,
                  {
                    backgroundColor: (inActiveBgColor as string) || "#e0e0e0",
                  },
                  containerStyle,
                ]}
              />
              {/* Animated active dash overlay */}
              <Animated.View
                style={[
                  styles.dashedLine,
                  styles.dashedLineActive,
                  {
                    width: isCompleted
                      ? "100%"
                      : isAnimating
                      ? dashWidth
                      : "0%",
                    backgroundColor: (activeBgColor as string) || "#3b5998",
                  },
                  childrenStyle,
                ]}
              />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <>
      {progressType === "line" && renderLineProgress()}
      {progressType === "circle" && renderCircleProgress()}
      {progressType === "dashed" && renderDashedProgress()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 0.5,
    borderRadius: 50,
    width: "100%",
    overflow: "hidden",
    height: 20,
  },
  progress: {
    height: 10,
  },
  dashedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dashedLineWrapper: {
    height: 10,
    position: "relative",
  },
  dashedLine: {
    height: 10,
    width: "100%",
    borderRadius: 50,
  },
  dashedLineActive: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

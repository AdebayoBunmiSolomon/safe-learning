import { View } from "react-native";
import { AppThemeType } from "./types";
import { darkThemeColors, lightThemeColors, ThemeProvider } from "./Theme";
import { Button } from "./components/ui";
import { ProgressBar } from "./progress-bar/ProgressBar";
import { useProgressBar } from "./progress-bar/useProgressBar";
import { VoiceNote } from "./voice-note/VoiceNote";

const themes: AppThemeType[] = ["light", "dark", "system"];

export default function App() {
  const {
    currentStep,
    numberOfSteps,
    goToNextStep,
    goToPreviousStep,
    addedSteps,
  } = useProgressBar(10, 1);
  return (
    <ThemeProvider>
      <View
        style={{
          paddingVertical: 100,
          paddingHorizontal: 20,
          flex: 1,
        }}>
        {/* <ProgressBar
          numberOfSteps={numberOfSteps}
          currentStep={currentStep}
          activeBgColor={lightThemeColors.red}
          inActiveBgColor={lightThemeColors.gray}
          progressType='dashed'
          activeCircleTextColor={darkThemeColors.black}
          inActiveCircleTextColor={lightThemeColors.black}
          addedSteps={addedSteps}
          // submittedCircleTextColor={"green"}
        /> */}
        <VoiceNote />
        {/* <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}>
          <Button
            title='Back'
            bgColor='red'
            onPress={() => goToPreviousStep()}
            textColor='black'
            btnStyle={{
              width: "45%",
            }}
          />
          <Button
            title='Next'
            bgColor='red'
            onPress={() => goToNextStep()}
            textColor='black'
            btnStyle={{
              width: "45%",
            }}
          />
        </View> */}
      </View>
    </ThemeProvider>
  );
}

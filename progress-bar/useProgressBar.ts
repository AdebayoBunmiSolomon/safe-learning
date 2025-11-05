import { useEffect, useState } from "react";

export const useProgressBar = (
  numbOfSteps: number = 0,
  currStep: number = 0
) => {
  const [numberOfSteps, setNumberOfSteps] = useState<number>(numbOfSteps);
  const [currentStep, setCurrentStep] = useState<number>(currStep);
  const [addedSteps, setAddedSteps] = useState<number[]>([1]);

  const addStep = (step: number) => {
    setAddedSteps((prevAddedSteps) => [...prevAddedSteps, step]);
  };

  const removeStep = (step: number) => {
    setAddedSteps((prevAddedSteps) => prevAddedSteps.filter((s) => s !== step));
  };

  const goToNextStep = () => {
    setCurrentStep((prevStep) => {
      if (prevStep < numberOfSteps) {
        const nextStep = prevStep + 1;
        addStep(nextStep); // Add the step when moving forward
        return nextStep;
      }
      return prevStep;
    });
  };

  const goToPreviousStep = () => {
    setCurrentStep((prevStep) => {
      if (prevStep > 1) {
        removeStep(prevStep); // Remove current step when going back
        return prevStep - 1;
      }
      return prevStep;
    });
  };

  return {
    numberOfSteps,
    currentStep,
    setNumberOfSteps,
    goToNextStep,
    goToPreviousStep,
    addedSteps,
  };
};

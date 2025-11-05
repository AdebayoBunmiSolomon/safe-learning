import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";
import { ColorKey } from "../../types";
import { useTheme } from "../../Theme";
import { fonts } from "../../fonts";

interface ITextProps {
  color?: ColorKey;
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  fontType: keyof typeof fonts;
}

export const AppText: React.FC<ITextProps> = ({
  color = "black",
  children,
  style,
  fontType,
}) => {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        styles.text,
        {
          color: colors[color],
          fontFamily: fonts[fontType],
        },
        style,
      ]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
});

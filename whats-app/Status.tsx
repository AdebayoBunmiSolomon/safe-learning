import React, { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { status as statuses, statusType } from "./constants";
import { ImageBackground, Image } from "expo-image";
import { AppText } from "@/components/ui/Text";
import { getInitials } from "@/helper";

interface IStatusProps {
  onPressStatus: (userStatusId: number | string | null) => void;
}

export const StatusUpdate: React.FC<IStatusProps> = ({ onPressStatus }) => {
  const renderStatusComponent = useCallback(
    ({ item, index }: { item: statusType; index: number }) => {
      return (
        <Pressable
          style={styles.statusContainer}
          key={index}
          onPress={() => onPressStatus(item?.id)}>
          <ImageBackground
            source={item?.user_picture ? item.user_picture : null}
            contentFit='cover'
            style={styles.bgImg}>
            <View
              style={[
                styles.overLayContainer,
                {
                  backgroundColor: item?.user_picture
                    ? "rgba(0,0,0,0.3)"
                    : "#000000",
                },
              ]}>
              <View style={styles.roundedInfoContainer}>
                {item?.user_picture ? (
                  <Image
                    style={[
                      styles.bgImg,
                      {
                        borderRadius: 100,
                      },
                    ]}
                    source={item?.user_picture}
                    contentFit='cover'
                  />
                ) : (
                  <View style={styles.initialTextContainer}>
                    <AppText fontType='regular' style={styles.initialText}>
                      {getInitials(item?.name)}
                    </AppText>
                  </View>
                )}
              </View>
            </View>
          </ImageBackground>
        </Pressable>
      );
    },
    []
  );

  return (
    <View>
      <FlatList
        contentContainerStyle={styles.flatList}
        data={statuses}
        keyExtractor={(__, index) => index.toString()}
        renderItem={({ item, index }) => renderStatusComponent({ item, index })}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        maxToRenderPerBatch={2}
        initialNumToRender={2}
        windowSize={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flatList: {
    paddingVertical: 10,
    gap: 5,
  },
  statusContainer: {
    width: 95,
    height: 140,
    borderRadius: 15,
    overflow: "hidden",
  },
  bgImg: {
    width: "100%",
    height: "100%",
  },
  roundedInfoContainer: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderColor: "#25D366",
    overflow: "hidden",
    marginTop: 5,
    marginLeft: 5,
    borderWidth: 1.5,
    padding: 2,
  },
  overLayContainer: {
    width: "100%",
    height: "100%",
  },
  initialTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontWeight: "bold",
    color: "#25D366",
    fontSize: 16,
  },
});

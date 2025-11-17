import {
  ImageSourcePropType,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { AppThemeType } from "./types";
import { ThemeProvider } from "./Theme";
import { StatusUpdate } from "./whats-app/Status";
import { useEffect, useState } from "react";
import { status as statuses, statusType } from "./whats-app/constants";
import { ProgressBar } from "./progress-bar/ProgressBar";
import { AppText } from "./components/ui/Text";
import { ImageBackground } from "expo-image";
import { truncateText } from "./helper";

const themes: AppThemeType[] = ["light", "dark", "system"];

type IStatusDataType = {
  caption: string;
  media: ImageSourcePropType | null;
};

export default function App() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [personalUserStatusData, setPersonalUserStatusData] = useState<
    IStatusDataType[] | []
  >([]);
  const [allUserStatus, setAllUserStatus] = useState<statusType[]>(statuses);
  const [currIndex, setCurrIndex] = useState<number>(0);
  const [seeMore, setSeeMore] = useState<boolean>(false);

  const caption = truncateText(personalUserStatusData[currIndex]?.caption, 35);

  useEffect(() => {
    if (userId) {
      const filteredStatus =
        allUserStatus && allUserStatus.find((status) => status.id === userId);
      const userStatusData = filteredStatus?.status;
      setPersonalUserStatusData(userStatusData ? userStatusData : []);
    }
  }, [userId]);

  const goToNextPicture = () => {
    const personalUserStatusLength =
      personalUserStatusData && personalUserStatusData?.length - 1;
    if (currIndex < personalUserStatusLength) {
      setCurrIndex((prev) => prev + 1);
    } else if (currIndex === personalUserStatusLength) {
      setCurrIndex(0);
      setModalVisible(!modalVisible);
    }
  };

  const gotoPrevPicture = () => {
    if (currIndex > 0) {
      // FIXED: Now decrements when index is greater than 0
      setCurrIndex((prev) => prev - 1);
    }
  };

  return (
    <ThemeProvider>
      <View
        style={{
          paddingVertical: 100,
          paddingHorizontal: 20,
          flex: 1,
        }}>
        <StatusUpdate
          onPressStatus={(userStatusId) => {
            setModalVisible(!modalVisible);
            setUserId(Number(userStatusId));
          }}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType='slide'>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ImageBackground
              style={{
                width: "100%",
                height: "100%",
                padding: 10,
              }}
              source={personalUserStatusData[currIndex]?.media}
              contentFit='cover'>
              <Pressable
                style={styles.closeBtn}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setSeeMore(!seeMore);
                  setCurrIndex(0);
                }}>
                <AppText
                  fontType='medium'
                  style={{
                    fontSize: 16,
                    fontWeight: "semibold",
                  }}>
                  X
                </AppText>
              </Pressable>
              <ProgressBar
                numberOfSteps={Number(personalUserStatusData?.length)}
                currentStep={currIndex + 1}
                progressType='dashed'
                activeBgColor={"#25D366"}
                containerStyle={styles.progressBar}
                childrenStyle={{ height: 5 }}
              />
              {/* action button */}
              <View style={styles.actionBtnContainer}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => {
                    // left press
                    gotoPrevPicture();
                  }}
                />
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => {
                    //right press
                    goToNextPicture();
                  }}
                />
              </View>
              <View style={styles.captionContainer}>
                <AppText fontType='medium' style={styles.captionText}>
                  {seeMore
                    ? personalUserStatusData[currIndex]?.caption
                    : caption.truncated}
                  {caption.isTruncated && !seeMore && (
                    <Pressable onPress={() => setSeeMore(!seeMore)}>
                      <AppText
                        fontType='regular'
                        style={{
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          marginBottom: -5,
                        }}>
                        See More...
                      </AppText>
                    </Pressable>
                  )}
                </AppText>
              </View>
            </ImageBackground>
          </View>
        </View>
      </Modal>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    paddingVertical: 10,
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    height: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: 5,
  },
  closeBtn: {
    backgroundColor: "#8a848495",
    width: 20,
    height: 20,
    borderRadius: 100,
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionBtnContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    height: "100%",
  },
  actionBtn: {
    width: 70,
    height: "100%",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  captionContainer: {
    width: "70%",
    alignSelf: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
  },
  captionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#FFFFFF",
  },
});

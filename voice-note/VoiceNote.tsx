import { useEffect } from "react";
import {
  StyleSheet,
  Alert,
  View,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { AudioModule, setAudioModeAsync } from "expo-audio";
import { Recording, useVoiceNote } from "./useVoiceNote";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ProgressBar } from "../progress-bar/ProgressBar";
import { AppText } from "../components/ui/Text";
import { useTheme } from "../Theme";

export const VoiceNote: React.FC = () => {
  const { colors } = useTheme();
  const {
    stopRecording,
    pauseRecording,
    formatDuration,
    record,
    recorderState,
    recordings,
    currentlyPlaying,
    togglePlayback,
    deleteRecording,
    playbackProgress,
    isPlaying,
  } = useVoiceNote();

  // Initialize audio permissions
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission denied", "Microphone permission required");
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const renderRecordingControls = () => (
    <View style={styles.recordingControls}>
      {recorderState.isRecording ? (
        <View style={styles.recordingActive}>
          <View style={styles.recordingInfo}>
            <View style={styles.recordingDot} />
            <AppText color='red' fontType='medium' style={styles.recordingText}>
              Recording...{" "}
              {formatDuration(recorderState.durationMillis)?.paddedVal}
            </AppText>
          </View>
          <View style={styles.recordingActions}>
            <Pressable
              style={[styles.controlButton, { backgroundColor: colors.red }]}
              onPress={pauseRecording}>
              <Ionicons name='pause' size={20} color={colors.black} />
            </Pressable>
            <Pressable
              style={[styles.controlButton, { backgroundColor: colors.red }]}
              onPress={stopRecording}>
              <MaterialIcons name='stop' size={20} color={colors.black} />
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          style={[styles.recordButton, { backgroundColor: colors.red }]}
          onPress={record}>
          <MaterialIcons name='mic' size={24} color={colors.black} />
          <AppText
            color='black'
            fontType='medium'
            style={styles.recordButtonText}>
            Start Recording
          </AppText>
        </Pressable>
      )}
    </View>
  );

  const renderVoiceNoteItem = (recording: Recording, index: number) => {
    const isCurrentlyPlaying = currentlyPlaying === recording.uri;

    return (
      <View
        key={index}
        style={[
          styles.voiceNoteCard,
          {
            backgroundColor: colors.blue,
            borderColor: isCurrentlyPlaying ? colors.red : colors.blue,
          },
        ]}>
        <View style={styles.voiceNoteHeader}>
          <AppText color='black' fontType='medium' style={styles.noteNumber}>
            Voice Note #{index + 1}
          </AppText>
          <AppText color='black' fontType='regular' style={styles.noteDuration}>
            {formatDuration(recording.duration)?.paddedVal}
          </AppText>
        </View>

        <View style={styles.voiceNoteControls}>
          <Pressable
            style={[styles.playButton, { backgroundColor: colors.blue }]}
            onPress={() => togglePlayback(recording.uri)}>
            {isCurrentlyPlaying && isPlaying ? (
              <Ionicons name='pause' size={20} color={colors.black} />
            ) : (
              <Entypo name='controller-play' size={20} color={colors.black} />
            )}
          </Pressable>

          <View style={styles.progressContainer}>
            <ProgressBar
              numberOfSteps={100}
              currentStep={playbackProgress}
              containerStyle={styles.progressBar}
              progressType='line'
              activeBgColor={colors.red}
            />
          </View>

          <Pressable
            style={[styles.deleteButton, { backgroundColor: colors.red }]}
            onPress={() => deleteRecording(recording.uri)}>
            <MaterialIcons name='delete' size={18} color={colors.black} />
          </Pressable>
        </View>

        <AppText color='black' fontType='regular' style={styles.noteDate}>
          {recording.recordedAt.toLocaleString()}
        </AppText>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgColor }]}>
      {renderRecordingControls()}

      <ScrollView style={styles.voiceNotesList}>
        <AppText color='black' fontType='medium' style={styles.sectionTitle}>
          My Voice Notes ({recordings.length})
        </AppText>

        {recordings.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name='record-voice-over'
              size={48}
              color={colors.gray}
            />
            <AppText color='gray' fontType='medium' style={styles.emptyText}>
              No voice notes yet
            </AppText>
            <AppText
              color='gray'
              fontType='regular'
              style={styles.emptySubtext}>
              Record your first voice note above
            </AppText>
          </View>
        ) : (
          recordings.map(renderVoiceNoteItem)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  recordingControls: {
    marginBottom: 20,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  recordButtonText: {
    fontSize: 16,
  },
  recordingActive: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  },
  recordingInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "red",
    marginRight: 8,
  },
  recordingText: {
    fontSize: 16,
  },
  recordingActions: {
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceNotesList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  voiceNoteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  voiceNoteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  noteNumber: {
    fontSize: 14,
  },
  noteDuration: {
    fontSize: 14,
  },
  voiceNoteControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  noteDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  emptySubtext: {
    fontSize: 14,
  },
});

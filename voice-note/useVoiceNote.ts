import { File, Directory, Paths } from "expo-file-system";
import {
  useAudioRecorder,
  useAudioPlayer,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  AudioQuality,
  IOSOutputFormat,
} from "expo-audio";
import { useState, useCallback, useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";

// Recording configuration
RecordingPresets.LOW_QUALITY = {
  extension: ".m4a",
  sampleRate: 22050,
  numberOfChannels: 1,
  bitRate: 64000,
  android: {
    outputFormat: "mpeg4",
    audioEncoder: "aac",
  },
  ios: {
    audioQuality: AudioQuality.MIN,
    outputFormat: IOSOutputFormat.MPEG4AAC,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

export interface Recording {
  uri: string;
  duration: number;
  recordedAt: Date;
}

export const useVoiceNote = () => {
  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const audioPlayer = useAudioPlayer();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);

  // Refs to track playback state
  const playbackStartTimeRef = useRef<number>(0);
  const playbackDurationRef = useRef<number>(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPlayingUriRef = useRef<string | null>(null);

  // File utilities
  const testFileAccess = async (uri: string) => {
    try {
      const fileInfo = new File(uri);
      return fileInfo.exists && (fileInfo.size || 0) > 0;
    } catch (error) {
      console.error("File access error:", error);
      return false;
    }
  };

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, []);

  // Recording controls
  const record = async () => {
    try {
      // Stop any currently playing audio before recording
      if (currentlyPlaying) {
        await stopPlayback();
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      Alert.alert("Error", "Failed to start recording");
      console.error("Recording error:", error);
    }
  };

  // const stopRecording = async () => {
  //   try {
  //     if (Platform.OS === "android") {
  //       await new Promise((resolve) => setTimeout(resolve, 100));
  //     }

  //     await audioRecorder.stop();

  //     if (Platform.OS === "android") {
  //       await new Promise((resolve) => setTimeout(resolve, 400));
  //     }

  //     if (!audioRecorder.uri) {
  //       Alert.alert("Error", "Recording failed: No URI found");
  //       return;
  //     }

  //     console.log("Original recording URI:", audioRecorder.uri);

  //     // Validate recording file exists using the File class
  //     const originalFile = new File(audioRecorder.uri);
  //     if (!originalFile.exists) {
  //       Alert.alert("Error", "Recording file does not exist");
  //       return;
  //     }

  //     const fileSize = originalFile.size || 0;
  //     if (fileSize === 0) {
  //       Alert.alert("Error", "Recording file is empty");
  //       return;
  //     }

  //     // ALWAYS copy to a new unique location for BOTH iOS and Android
  //     try {
  //       const documentDir = Paths.document;
  //       console.log("document dir", documentDir?.uri);

  //       // Create a truly unique filename with timestamp and random string
  //       const timestamp = Date.now();
  //       const randomString = Math.random().toString(36).substring(2, 15);
  //       const fileName = `recording_${timestamp}_${randomString}.m4a`;

  //       // Create the new file in the document directory
  //       const newFile = new File(documentDir, fileName);
  //       const newPath = newFile.uri;

  //       console.log(`📁 Copying recording from: ${audioRecorder.uri}`);
  //       console.log(`📁 Copying recording to: ${newPath}`);

  //       // Read the original file bytes
  //       const originalBytes = await originalFile.bytes();

  //       // Write to the new file using writable stream
  //       const writableStream = newFile.writableStream();
  //       const writer = writableStream.getWriter();
  //       await writer.write(originalBytes);
  //       await writer.close();

  //       console.log(
  //         `✅ Copy successful: ${fileName}, size: ${originalBytes.length} bytes`
  //       );

  //       const newRecording: Recording = {
  //         uri: newPath,
  //         duration: recorderState.durationMillis || 0,
  //         recordedAt: new Date(),
  //       };

  //       setRecordings((prev) => [...prev, newRecording]);
  //       console.log(`🎉 Added new recording: ${fileName}`);
  //     } catch (copyError) {
  //       console.error("File copy error:", copyError);
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to stop recording");
  //     console.error("Stop recording error:", error);
  //   }
  // };

  const stopRecording = async () => {
    try {
      if (Platform.OS === "android") {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await audioRecorder.stop();

      // ⚠️ FIX: Add delay for iOS to ensure file is written to disk
      if (Platform.OS === "ios") {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else if (Platform.OS === "android") {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      if (!audioRecorder.uri) {
        Alert.alert("Error", "Recording failed: No URI found");
        return;
      }

      console.log("Original recording URI:", audioRecorder.uri);

      // ⚠️ FIX: Validate recording file with retries for iOS
      const originalFile = new File(audioRecorder.uri);

      // Wait for file to be ready (especially important for iOS)
      let attempts = 0;
      const maxAttempts = 5;
      while (attempts < maxAttempts) {
        if (originalFile.exists && (originalFile.size || 0) > 0) {
          break;
        }
        console.log(
          `⏳ Waiting for file to be ready... attempt ${attempts + 1}`
        );
        await new Promise((resolve) => setTimeout(resolve, 200));
        attempts++;
      }

      if (!originalFile.exists) {
        Alert.alert("Error", "Recording file does not exist");
        return;
      }

      const fileSize = originalFile.size || 0;
      console.log(`📊 Original file size: ${fileSize} bytes`);

      if (fileSize === 0) {
        Alert.alert("Error", "Recording file is empty");
        return;
      }

      // ALWAYS copy to a new unique location for BOTH iOS and Android
      try {
        // Get document directory path
        const documentDirInfo = Paths.document;
        const documentDirPath =
          typeof documentDirInfo === "string"
            ? documentDirInfo
            : documentDirInfo.uri;

        console.log("document dir path:", documentDirPath);

        // Create a truly unique filename with timestamp and random string
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `recording_${timestamp}_${randomString}.m4a`;

        // ⚠️ FIX: Build the complete file path as a string
        const newPath = `${documentDirPath}${fileName}`;

        console.log(`📁 Copying recording from: ${audioRecorder.uri}`);
        console.log(`📁 Copying recording to: ${newPath}`);

        // Read the original file bytes
        const originalBytes = await originalFile.bytes();
        console.log(`📦 Read ${originalBytes.length} bytes from original file`);

        // ⚠️ FIX: Use File.create or direct path to write
        // Create a writable stream to the new path
        const newFile = new File(newPath);

        try {
          const writableStream = newFile.writableStream();
          const writer = writableStream.getWriter();
          await writer.write(originalBytes);
          await writer.close();

          console.log(
            `✅ Copy successful: ${fileName}, size: ${originalBytes.length} bytes`
          );
        } catch (writeError) {
          console.error("Write error:", writeError);

          // ⚠️ ALTERNATIVE METHOD: Try using file system copy instead
          // This might work better on iOS
          throw writeError;
        }

        const newRecording: Recording = {
          uri: newPath,
          duration: recorderState.durationMillis || 0,
          recordedAt: new Date(),
        };

        setRecordings((prev) => [...prev, newRecording]);
        console.log(`🎉 Added new recording: ${fileName}`);
      } catch (copyError) {
        console.error("File copy error:", copyError);
        Alert.alert("Error", "Failed to copy recording");
        return; // Don't add recording if copy fails
      }
    } catch (error) {
      Alert.alert("Error", "Failed to stop recording");
      console.error("Stop recording error:", error);
    }
  };

  const pauseRecording = async () => {
    try {
      if (audioRecorder.pause) {
        audioRecorder.pause();
      } else {
        await stopRecording();
      }
    } catch (error) {
      console.error("Pause recording error:", error);
    }
  };

  // Progress tracking
  const startProgressTracking = (duration: number) => {
    playbackStartTimeRef.current = Date.now();
    playbackDurationRef.current = duration;

    stopProgressTracking();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - playbackStartTimeRef.current;
      const progress = Math.min((elapsed / duration) * 100, 100);

      setPlaybackProgress(progress);

      if (progress >= 100) {
        stopPlayback();
      }
    }, 100);
  };

  // Stop progress tracking
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setPlaybackProgress(0);
  };

  // VERIFY the URI is being loaded correctly
  const verifyAndPlayRecording = async (uri: string) => {
    try {
      console.log(`🔊 VERIFYING URI: ${uri}`);

      const file = new File(uri);

      if (!file.exists) {
        console.error(`❌ File does not exist: ${uri}`);
        Alert.alert("Error", "Recording file not found");
        return false;
      }

      const fileSize = file.size || 0;
      if (fileSize === 0) {
        console.error(`❌ File is empty: ${uri}`);
        Alert.alert("Error", "Recording file is empty");
        return false;
      }

      console.log(
        `✅ File verified - Size: ${fileSize} bytes, URI: ${uri.substring(
          uri.length - 30
        )}`
      );
      return true;
    } catch (error) {
      console.error(`❌ Verification failed for: ${uri}`, error);
      return false;
    }
  };

  // Playback controls
  const playRecording = async (uri: string) => {
    try {
      console.log(`🎵 PLAY REQUESTED for: ${uri.substring(uri.length - 30)}`);

      // Verify the file first
      const isValid = await verifyAndPlayRecording(uri);
      if (!isValid) {
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      // COMPLETELY stop and reset the audio player
      console.log("🛑 Stopping current playback...");
      audioPlayer.pause();

      // Small delay to ensure clean state
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Get the recording duration
      const recording = recordings.find((r) => r.uri === uri);
      if (!recording) {
        console.error(`❌ Recording not found in state: ${uri}`);
        Alert.alert("Error", "Recording not found");
        return;
      }

      console.log(`📥 REPLACING audio with: ${uri.substring(uri.length - 30)}`);

      // Use the synchronous replace method
      audioPlayer.replace(uri);

      // Small delay to ensure the URI is loaded
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("▶️ Starting playback...");

      // Use the synchronous play method
      audioPlayer.play();

      // Update state
      currentPlayingUriRef.current = uri;
      setCurrentlyPlaying(uri);
      setIsPlaying(true);

      // Start progress tracking
      startProgressTracking(recording.duration);

      console.log(`✅ SUCCESS: Now playing ${uri.substring(uri.length - 30)}`);
    } catch (error) {
      console.error("❌ Play recording error:", error);
      Alert.alert("Error", "Failed to play recording");
      setCurrentlyPlaying(null);
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const pausePlayback = async () => {
    try {
      console.log("⏸️ Pausing playback...");
      audioPlayer.pause();
      setIsPlaying(false);
      stopProgressTracking();
    } catch (error) {
      console.error("Pause playback error:", error);
    }
  };

  const stopPlayback = async () => {
    try {
      console.log("🛑 Stopping all playback...");
      audioPlayer.pause();
      currentPlayingUriRef.current = null;
      setCurrentlyPlaying(null);
      setIsPlaying(false);
      stopProgressTracking();
    } catch (error) {
      console.error("Stop playback error:", error);
    }
  };

  const togglePlayback = async (uri: string) => {
    console.log(
      `🔄 TOGGLE: ${uri.substring(uri.length - 30)}, Current: ${
        currentPlayingUriRef.current
          ? currentPlayingUriRef.current.substring(uri.length - 30)
          : "none"
      }, Playing: ${isPlaying}`
    );

    // If clicking the same recording that's currently playing
    if (currentPlayingUriRef.current === uri) {
      if (isPlaying) {
        await pausePlayback();
      } else {
        // Resume playback of current recording
        const recording = recordings.find((r) => r.uri === uri);
        if (recording) {
          console.log("▶️ Resuming playback...");
          audioPlayer.play();
          setIsPlaying(true);
          startProgressTracking(recording.duration);
        }
      }
    } else {
      // Play a different recording - stop current and play new one
      console.log("🔄 Switching to different recording...");
      await playRecording(uri);
    }
  };

  // Recording management
  const deleteRecording = useCallback(async (uri: string) => {
    // If this recording is currently playing, stop it first
    if (currentPlayingUriRef.current === uri) {
      await stopPlayback();
    }

    Alert.alert("Delete Recording", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const file = new File(uri);
            if (file.exists) {
              file.delete();
              console.log(
                `🗑️ Deleted recording: ${uri.substring(uri.length - 30)}`
              );
            }
          } catch (err) {
            console.error("Error deleting file:", err);
          }

          setRecordings((prev) => prev.filter((r) => r.uri !== uri));
        },
      },
    ]);
  }, []);

  // Utilities
  const formatDuration = useCallback((ms: number) => {
    const total = Math.floor(ms / 1000);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return {
      total,
      mins,
      secs,
      paddedVal: `${mins}:${secs.toString().padStart(2, "0")}`,
    };
  }, []);

  const formatDate = useCallback((dateVal: string) => {
    const date = new Date(dateVal);
    const hrs = date.getHours();
    const mins = date.getMinutes();

    return {
      hrs,
      mins,
    };
  }, []);

  // Get playback progress for a specific recording
  const getPlaybackProgress = useCallback(
    (uri: string) => {
      if (currentPlayingUriRef.current === uri && isPlaying) {
        return playbackProgress;
      }
      return 0;
    },
    [isPlaying, playbackProgress]
  );

  return {
    // State
    recordings,
    currentlyPlaying,
    recorderState,
    audioPlayer,
    isPlaying,
    playbackProgress,

    // Recording controls
    record,
    stopRecording,
    pauseRecording,

    // Playback controls
    playRecording,
    pausePlayback,
    stopPlayback,
    togglePlayback,

    // Recording management
    deleteRecording,

    // Utilities
    formatDuration,
    formatDate,
    getPlaybackProgress,
    testFileAccess,
  };
};

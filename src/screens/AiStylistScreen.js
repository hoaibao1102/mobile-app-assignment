import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { askGemini } from "../services/geminiService";
import { getHandbags } from "../api/handbagApi";
import { colors } from "../constants/colors";

export function AiStylistScreen({ route, navigation }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      text: "Hello! I am Aura, your personal luxury fashion stylist.\n\nDescribe your outfit or upload a photo, and I'll suggest the most matching handbags from our collection!",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // URI
  const [selectedImageBase64, setSelectedImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [handbags, setHandbags] = useState([]);

  const flatListRef = useRef(null);

  useEffect(() => {
    if (route.params?.handbagPrompt) {
      const bag = route.params.handbagPrompt;
      setInputText(`How should I style the ${bag.brand} ${bag.handbagName} handbag?`);
      // Clear route params so it won't trigger again on subsequent tab selections
      navigation.setParams({ handbagPrompt: undefined });
    }
  }, [route.params?.handbagPrompt, navigation]);

  useEffect(() => {
    // Load handbags inventory on mount to feed Gemini as context
    const loadInventory = async () => {
      const data = await getHandbags();
      setHandbags(data);
    };
    loadInventory();
  }, []);

  const handlePickImage = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access gallery is required to upload outfit photos.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setSelectedImageBase64(result.assets[0].base64);
      }
    } catch (error) {
      console.log("Image picker error:", error);
    }
  };

  const handleSendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend && !selectedImageBase64) return;

    const userMsgId = Date.now().toString();
    const newUserMessage = {
      id: userMsgId,
      text: textToSend,
      isUser: true,
      image: selectedImage,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setSelectedImage(null);
    setSelectedImageBase64(null);
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const reply = await askGemini(textToSend, selectedImageBase64, handbags);
      const newAiMessage = {
        id: (Date.now() + 1).toString(),
        text: reply,
        isUser: false,
      };
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("AI reply error:", error);
      const errorAiMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I am experiencing connection issues with the styling server. Let's try again in a moment, or feel free to look at our store locations!",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessageItem = useCallback(({ item }) => {
    return (
      <View
        style={[
          styles.messageRow,
          item.isUser ? styles.userRow : styles.aiRow,
        ]}
      >
        {!item.isUser && (
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={16} color={colors.white} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            item.isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.bubbleImage} />
          )}
          {item.text ? (
            <Text
              style={[
                styles.messageText,
                item.isUser ? styles.userText : styles.aiText,
              ]}
            >
              {item.text}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AURA AI STYLIST</Text>
        <Text style={styles.headerSubtitle}>Elite Fashion & Handbag Consultant</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={styles.typingContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="sparkles" size={16} color={colors.white} />
                </View>
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={colors.muted} />
                  <Text style={styles.typingText}>Aura is analyzing...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Selected image preview block above inputs */}
        {selectedImage && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <Pressable
              style={styles.closePreviewBtn}
              onPress={() => {
                setSelectedImage(null);
                setSelectedImageBase64(null);
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.primary} />
            </Pressable>
          </View>
        )}

        {/* Input Controls */}
        <View style={styles.inputContainer}>
          <Pressable style={styles.attachBtn} onPress={handlePickImage}>
            <Ionicons name="image-outline" size={24} color={colors.primary} />
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Ask Aura or share outfit colors..."
            placeholderTextColor={colors.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={300}
          />

          <Pressable
            style={[
              styles.sendBtn,
              (!inputText.trim() && !selectedImage) && styles.disabledSendBtn,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() && !selectedImage}
          >
            <Ionicons name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
    fontWeight: "500",
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
    maxWidth: "82%",
  },
  userRow: {
    alignSelf: "flex-end",
  },
  aiRow: {
    alignSelf: "flex-start",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  bubbleImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: "cover",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: colors.white,
  },
  aiText: {
    color: colors.text,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderBottomLeftRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  typingText: {
    fontSize: 13,
    color: colors.muted,
  },
  previewContainer: {
    position: "relative",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closePreviewBtn: {
    position: "absolute",
    top: 4,
    left: 64,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  attachBtn: {
    padding: 4,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSendBtn: {
    backgroundColor: colors.muted,
    opacity: 0.6,
  },
});

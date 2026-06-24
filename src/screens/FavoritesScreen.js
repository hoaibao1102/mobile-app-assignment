import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { HandbagCard } from "../components/HandbagCard";
import { colors } from "../constants/colors";
import {
  getFavorites,
  removeFavorite,
} from "../services/favoriteService";

export function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const loadFavorites = async () => {
    const data = await getFavorites();
    setFavorites(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  const handleRemove = async (handbagId) => {
    const newFavorites = await removeFavorite(handbagId);
    setFavorites(newFavorites);
  };

  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelectedIds([]);
  };

  const toggleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleLongPress = (id) => {
    if (!selectMode) {
      setSelectMode(true);
      setSelectedIds([id]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      "Remove favorites",
      `Are you sure you want to remove ${selectedIds.length} item(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            let current = [...favorites];
            for (const id of selectedIds) {
              current = await removeFavorite(id);
            }
            setFavorites(current);
            setSelectMode(false);
            setSelectedIds([]);
          },
        },
      ],
    );
  };

  const handleCancelSelect = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        {favorites.length > 0 && !selectMode && (
          <Pressable onPress={toggleSelectMode} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          selectMode && styles.listContentWithBar,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on a handbag to save it here
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <HandbagCard
            handbag={item}
            isFavorite={true}
            selectMode={selectMode}
            isSelected={selectedIds.includes(item.id)}
            onSelectPress={() => toggleSelectItem(item.id)}
            onLongPress={() => handleLongPress(item.id)}
            onFavoritePress={() => handleRemove(item.id)}
            onPress={() =>
              !selectMode &&
              navigation.navigate("FavoriteDetail", { handbag: item })
            }
          />
        )}
      />

      {selectMode && (
        <View style={styles.floatingActions}>
          <Pressable onPress={handleDeleteSelected} style={styles.floatingDeleteBtn}>
            <Ionicons name="trash-outline" size={16} color={colors.white} />
            <Text style={styles.floatingDeleteText}>
              Delete ({selectedIds.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              setSelectedIds(
                selectedIds.length === favorites.length
                  ? []
                  : favorites.map((f) => f.id),
              )
            }
            style={styles.floatingSelectBtn}
          >
            <Text style={styles.floatingSelectText}>
              {selectedIds.length === favorites.length
                ? "Deselect All"
                : "Select All"}
            </Text>
          </Pressable>
          <Pressable onPress={handleCancelSelect} style={styles.floatingCancelBtn}>
            <Text style={styles.floatingCancelText}>Cancel</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  listContentWithBar: {
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  floatingActions: {
    position: "absolute",
    bottom: 24,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  floatingDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingDeleteText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
  },
  floatingSelectBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingSelectText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
  },
  floatingCancelBtn: {
    alignItems: "center",
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
});

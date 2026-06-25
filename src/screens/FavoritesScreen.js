import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  Pressable,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { HandbagCard } from "../components/HandbagCard";
import { colors } from "../constants/colors";
import {
  getFavorites,
  removeFavorite,
  removeMultipleFavorites,
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
      
      // Reset select mode and selected IDs when entering the screen
      setSelectMode(false);
      setSelectedIds([]);

      return () => {
        // Also reset when leaving the screen
        setSelectMode(false);
        setSelectedIds([]);
      };
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
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleLongPress = (id) => {
    if (!selectMode) {
      setSelectMode(true);
      setSelectedIds([id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === favorites.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(favorites.map((item) => item.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      "Remove Favorites",
      `Are you sure you want to remove ${selectedIds.length} item(s) from your favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const current = await removeMultipleFavorites(selectedIds);
            setFavorites(current);
            setSelectMode(false);
            setSelectedIds([]);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleCancelSelect = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  return (
    <View style={styles.container}>
      {favorites.length > 0 && (
        <View style={styles.headerInfo}>
          <Text style={styles.instructionText}>
            {selectMode 
              ? `Selected ${selectedIds.length} of ${favorites.length} products` 
              : "Long press an item to select multiple products"}
          </Text>
          <View style={styles.actionButtons}>
            {selectMode ? (
              <>
                <Pressable onPress={handleSelectAll} style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>
                    {selectedIds.length === favorites.length ? "Deselect All" : "Select All"}
                  </Text>
                </Pressable>
                <Pressable onPress={handleCancelSelect} style={styles.actionBtn}>
                  <Text style={[styles.actionBtnText, { color: colors.muted }]}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <Pressable onPress={() => setSelectMode(true)} style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>Select</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      <FlatList
        key={2}
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={72} color={colors.border} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Your Favorites is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Save your favorite luxury handbags while shopping to view them here later.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.exploreBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.exploreBtnText}>Go to Home</Text>
            </Pressable>
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
        <View style={styles.floatingBar}>
          <Pressable
            onPress={handleDeleteSelected}
            style={[
              styles.floatingBtnDelete,
              selectedIds.length === 0 && { backgroundColor: colors.muted, shadowColor: "rgba(0,0,0,0.1)" }
            ]}
            disabled={selectedIds.length === 0}
          >
            <Ionicons name="trash-outline" size={20} color={colors.white} />
            <Text style={styles.floatingBtnText}>Delete ({selectedIds.length})</Text>
          </Pressable>
          <Pressable onPress={handleCancelSelect} style={styles.floatingBtnClose}>
            <Ionicons name="close" size={22} color={colors.white} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: colors.background,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "500",
    flex: 1,
    paddingRight: 8,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionBtnText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  listContainer: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreBtnText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  floatingBar: {
    position: "absolute",
    bottom: 24,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  floatingBtnDelete: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 28,
    elevation: 8,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  floatingBtnClose: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 44,
    height: 44,
    borderRadius: 22,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  floatingBtnText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
});

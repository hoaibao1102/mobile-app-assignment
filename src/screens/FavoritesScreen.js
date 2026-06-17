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
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          !selectMode && favorites.length > 0 ? (
            <View style={styles.actionRow}>
              <Pressable onPress={toggleSelectMode}>
                <Text style={styles.selectText}>Select</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSelectMode(true);
                  setSelectedIds(favorites.map((f) => f.id));
                }}
              >
                <Text style={styles.selectAllText}>Select All</Text>
              </Pressable>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Your favorite list is empty.</Text>
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
            style={styles.floatingBtnDelete}
          >
            <Ionicons name="trash-outline" size={20} color={colors.white} />
            <Text style={styles.floatingBtnText}>Delete</Text>
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
    padding: 16,
    backgroundColor: colors.background,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginBottom: 12,
  },
  selectText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  selectAllText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 50,
  },
  floatingBar: {
    position: "absolute",
    bottom: 24,
    right: 16,
    flexDirection: "row",
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
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  floatingBtnClose: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 44,
    height: 44,
    borderRadius: 22,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  floatingBtnText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 15,
  },
});

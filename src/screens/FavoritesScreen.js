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

import { HandbagCard } from "../components/HandbagCard";
import { colors } from "../constants/colors";
import {
  clearFavorites,
  getFavorites,
  removeFavorite,
} from "../services/favoriteService";

export function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

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

  const handleClearAll = () => {
    Alert.alert("Clear all favorites", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          const data = await clearFavorites();
          setFavorites(data);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorite Handbags</Text>

        {favorites.length > 0 && (
          <Pressable onPress={handleClearAll}>
            <Text style={styles.clearText}>Clear All</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>Your favorite list is empty.</Text>
        }
        renderItem={({ item }) => (
          <HandbagCard
            handbag={item}
            isFavorite={true}
            onFavoritePress={() => handleRemove(item.id)}
            onPress={() =>
              navigation.navigate("FavoriteDetail", { handbag: item })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.text,
  },
  clearText: {
    color: colors.danger,
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 50,
  },
});

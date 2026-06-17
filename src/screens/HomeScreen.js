import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getHandbags } from "../api/handbagApi";
import { BrandFilter } from "../components/BrandFilter";
import { HandbagCard } from "../components/HandbagCard";
import { colors } from "../constants/colors";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoriteService";

export function HomeScreen({ navigation }) {
  const [handbags, setHandbags] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);

    const handbagData = await getHandbags();
    const favoriteData = await getFavorites();

    setHandbags(handbagData);
    setFavorites(favoriteData);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const brands = ["All", ...new Set(handbags.map((item) => item.brand))];

  const filteredHandbags = handbags
    .filter((item) => {
      if (selectedBrand === "All") return true;
      return item.brand === selectedBrand;
    })
    .sort((a, b) => Number(b.cost) - Number(a.cost));

  const isFavorite = (handbagId) => {
    return favorites.some((item) => item.id === handbagId);
  };

  const handleFavoritePress = async (handbag) => {
    let newFavorites;

    if (isFavorite(handbag.id)) {
      newFavorites = await removeFavorite(handbag.id);
    } else {
      newFavorites = await addFavorite(handbag);
    }

    setFavorites(newFavorites);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading handbags...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Luxury Handbags</Text>

      <Pressable
        style={styles.smartSearchBar}
        onPress={() => navigation.navigate("SmartSearch")}
      >
        <Ionicons name="search" size={20} color={colors.muted} />
        <Text style={styles.smartSearchText}>Smart Search</Text>
      </Pressable>

      <BrandFilter
        brands={brands}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
      />

      <FlatList
        data={filteredHandbags}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No handbags found.</Text>
        }
        renderItem={({ item }) => (
          <HandbagCard
            handbag={item}
            isFavorite={isFavorite(item.id)}
            onFavoritePress={() => handleFavoritePress(item)}
            onPress={() => navigation.navigate("Detail", { handbag: item })}
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 14,
  },
  smartSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    gap: 8,
  },
  smartSearchText: {
    flex: 1,
    fontSize: 14,
    color: colors.muted,
  },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.muted,
  },
});

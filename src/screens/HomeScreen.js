import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useProducts } from "../hooks/useProducts";
import { BrandFilter } from "../components/BrandFilter";
import { HandbagCard } from "../components/HandbagCard";
import { colors } from "../constants/colors";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoriteService";

export function HomeScreen({ navigation }) {
  const { products: handbags, loading, error, refreshing, handleRefresh, refetch } = useProducts();
  const [favorites, setFavorites] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("All");

  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        const favoriteData = await getFavorites();
        setFavorites(favoriteData);
      };
      loadFavorites();
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

  const handleFavoritePress = useCallback(async (handbag) => {
    let newFavorites;

    if (isFavorite(handbag.id)) {
      newFavorites = await removeFavorite(handbag.id);
    } else {
      newFavorites = await addFavorite(handbag);
    }

    setFavorites(newFavorites);
  }, [favorites]);

  if (loading && handbags.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading handbags...</Text>
      </View>
    );
  }

  if (error && handbags.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Luxury Handbags</Text>
        <Pressable
          style={({ pressed }) => [
            styles.locatorBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => navigation.navigate("StoreLocator")}
        >
          <Ionicons name="map-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.smartSearchBar,
          pressed && { opacity: 0.9 },
        ]}
        onPress={() => navigation.navigate("SmartSearch")}
      >
        <Ionicons name="search" size={20} color={colors.muted} />
        <Text style={styles.smartSearchText}>Search handbags, brands, colors...</Text>
      </Pressable>

      <BrandFilter
        brands={brands}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
      />

      <FlatList
        key={2}
        data={filteredHandbags}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No handbags found.</Text>
        }
        renderItem={({ item }) => (
          <HandbagCard
            handbag={item}
            isFavorite={isFavorite(item.id)}
            onFavoritePress={() => handleFavoritePress(item)}
            onPress={() => navigation.navigate("Detail", { handbag: item, allHandbags: handbags })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  locatorBtn: {
    padding: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.01)",
  },
  smartSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginHorizontal: 6,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  smartSearchText: {
    flex: 1,
    fontSize: 14,
    color: colors.muted,
    fontWeight: "500",
  },
  listContainer: {
    paddingBottom: 24,
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
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    color: colors.muted,
  },
  errorText: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 15,
  },
});

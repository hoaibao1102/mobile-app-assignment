import { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  SafeAreaView,
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

  const filteredHandbags = useMemo(
    () =>
      handbags
        .filter((item) => {
          if (selectedBrand === "All") return true;
          return item.brand === selectedBrand;
        })
        .sort((a, b) => Number(b.cost) - Number(a.cost)),
    [handbags, selectedBrand],
  );

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Luxury Handbags</Text>
          <Text style={styles.headerSubtitle}>{filteredHandbags.length} pieces</Text>
        </View>
        <Pressable
          style={styles.searchIconBtn}
          onPress={() => navigation.navigate("SmartSearch")}
        >
          <Ionicons name="search" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <BrandFilter
          brands={brands}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
        />
      </View>

      <Pressable
        style={styles.showroomBtn}
        onPress={() => navigation.navigate("Showroom")}
      >
        <Ionicons name="location-outline" size={14} color={colors.text} />
        <Text style={styles.showroomBtnText}>Find a showroom near you</Text>
        <Ionicons name="chevron-forward" size={12} color={colors.text} />
      </Pressable>

      <FlatList
        data={filteredHandbags}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "500",
    marginTop: 2,
  },
  searchIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  empty: {
    textAlign: "center",
    color: colors.muted,
    marginTop: 60,
    fontSize: 15,
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
  showroomBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 20,
    marginTop: 1,
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: colors.background,
  },
  showroomBtnText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
  },
});

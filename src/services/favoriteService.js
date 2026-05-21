import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITE_KEY = "FAVORITE_HANDBAGS";

export async function getFavorites() {
  try {
    const jsonValue = await AsyncStorage.getItem(FAVORITE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.log("Get favorites error:", error);
    return [];
  }
}

export async function saveFavorites(favorites) {
  try {
    await AsyncStorage.setItem(FAVORITE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.log("Save favorites error:", error);
  }
}

export async function addFavorite(handbag) {
  const favorites = await getFavorites();

  const existed = favorites.some((item) => item.id === handbag.id);

  if (existed) {
    return favorites;
  }

  const newFavorites = [handbag, ...favorites];
  await saveFavorites(newFavorites);

  return newFavorites;
}

export async function removeFavorite(handbagId) {
  const favorites = await getFavorites();

  const newFavorites = favorites.filter((item) => item.id !== handbagId);

  await saveFavorites(newFavorites);

  return newFavorites;
}

export async function clearFavorites() {
  await saveFavorites([]);
  return [];
}

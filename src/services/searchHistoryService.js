import AsyncStorage from "@react-native-async-storage/async-storage";

const SEARCH_HISTORY_KEY = "SEARCH_HISTORY";

export async function getSearchHistory() {
    try {
        const jsonValue = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.log("Get search history error:", error);
        return [];
    }
}

export async function addSearchTerm(term) {
    try {
        const history = await getSearchHistory();
        // Remove duplicate if exists (case-insensitive)
        const filtered = history.filter(
            (t) => t.toLowerCase() !== term.toLowerCase(),
        );
        // Add to front, keep max 5
        const updated = [term, ...filtered].slice(0, 5);
        await AsyncStorage.setItem(
            SEARCH_HISTORY_KEY,
            JSON.stringify(updated),
        );
        return updated;
    } catch (error) {
        console.log("Add search term error:", error);
        return [];
    }
}

export async function clearSearchHistory() {
    try {
        await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([]));
        return [];
    } catch (error) {
        console.log("Clear search history error:", error);
        return [];
    }
}

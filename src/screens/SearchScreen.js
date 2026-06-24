import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    ScrollView,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { getHandbags } from "../api/handbagApi";
import { SearchCard } from "../components/SearchCard";
import { colors } from "../constants/colors";
import {
    getSearchHistory,
    addSearchTerm,
    clearSearchHistory,
} from "../services/searchHistoryService";
import {
    getTrendingSearches,
    getSmartSuggestions,
    getRecommendationCards,
    filterProducts,
    rankProducts,
    getAllBrands,
    getAllCategories,
    getAllColors,
    getAverageRating,
} from "../utils/searchUtils";
import {
    addFavorite,
    getFavorites,
    removeFavorite,
} from "../services/favoriteService";

// ---------------------------------------------------------------------------
// Chip components
// ---------------------------------------------------------------------------

function FilterChip({ label, active, onPress }) {
    return (
        <Pressable
            style={[styles.chip, active && styles.chipActive]}
            onPress={onPress}
        >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {label}
            </Text>
        </Pressable>
    );
}

function SuggestionChip({ label, icon, onPress }) {
    return (
        <Pressable style={styles.suggestionChip} onPress={onPress}>
            <Ionicons name={icon} size={14} color={colors.muted} />
            <Text style={styles.suggestionChipText}>{label}</Text>
        </Pressable>
    );
}

// ---------------------------------------------------------------------------
// Recommendation card
// ---------------------------------------------------------------------------

function BrandRecommendationCard({ brand, productCount, avgRating, onPress }) {
    return (
        <Pressable style={styles.recommendCard} onPress={onPress}>
            <View style={styles.recommendCardContent}>
                <Text style={styles.recommendBrand}>{brand}</Text>
                <View style={styles.recommendMeta}>
                    <Text style={styles.recommendCount}>{productCount} products</Text>
                    <View style={styles.recommendRatingRow}>
                        <Ionicons name="star" size={12} color={colors.secondary} />
                        <Text style={styles.recommendRating}>{avgRating.toFixed(1)}</Text>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
    );
}

// ---------------------------------------------------------------------------
// Main SearchScreen
// ---------------------------------------------------------------------------

export function SearchScreen({ navigation }) {
    const [handbags, setHandbags] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Search state
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const searchInputRef = useRef(null);
    const debounceTimer = useRef(null);

    // Filter state
    const [activeFilters, setActiveFilters] = useState({
        category: null,
        brand: null,
        color: null,
    });

    // Search history & trending
    const [searchHistory, setSearchHistory] = useState([]);

    // -----------------------------------------------------------------------
    // Data loading
    // -----------------------------------------------------------------------

    const loadData = async () => {
        setLoading(true);
        const [handbagData, favoriteData, historyData] = await Promise.all([
            getHandbags(),
            getFavorites(),
            getSearchHistory(),
        ]);
        setHandbags(handbagData);
        setFavorites(favoriteData);
        setSearchHistory(historyData);
        setLoading(false);
        setInitialLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, []),
    );

    // -----------------------------------------------------------------------
    // Derived data
    // -----------------------------------------------------------------------

    const brands = useMemo(() => getAllBrands(handbags), [handbags]);
    const categories = useMemo(() => getAllCategories(handbags), [handbags]);
    const colorsList = useMemo(() => getAllColors(handbags), [handbags]);

    const trending = useMemo(() => getTrendingSearches(handbags), [handbags]);
    const recommendations = useMemo(
        () => getRecommendationCards(handbags),
        [handbags],
    );

    const suggestions = useMemo(
        () => getSmartSuggestions(handbags, query),
        [handbags, query],
    );

    // -----------------------------------------------------------------------
    // Debounce
    // -----------------------------------------------------------------------

    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            setDebouncedQuery(query);
        }, 250);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [query]);

    // -----------------------------------------------------------------------
    // Header — render search input in native stack header
    // -----------------------------------------------------------------------

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.searchHeader}>
                    <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder="Search handbags, brands, colors..."
                        placeholderTextColor={colors.muted}
                        value={query}
                        onChangeText={setQuery}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        returnKeyType="search"
                        onSubmitEditing={() => {
                            const trimmed = query.trim();
                            if (trimmed) {
                                setIsFocused(false);
                                searchInputRef.current?.blur();
                                addSearchTerm(trimmed).then(setSearchHistory);
                            }
                        }}
                    />
                    {query.length > 0 ? (
                        <Pressable onPress={() => setQuery("")} style={styles.headerIconBtn}>
                            <Ionicons name="close-circle" size={20} color={colors.muted} />
                        </Pressable>
                    ) : null}
                </View>
            ),
            headerLeft: () => (
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </Pressable>
            ),
            headerBackVisible: false,
            headerTitleContainerStyle: {
                flex: 1,
                marginHorizontal: 0,
            },
            headerStyle: {
                backgroundColor: colors.white,
                shadowOpacity: 0,
                elevation: 0,
                borderBottomWidth: 0,
            },
        });
    }, [navigation, query]);

    // -----------------------------------------------------------------------
    // Filtered + ranked results (computed from debounced query)
    // -----------------------------------------------------------------------

    const results = useMemo(() => {
        let filtered = filterProducts(handbags, debouncedQuery, activeFilters);

        if (debouncedQuery && debouncedQuery.trim()) {
            filtered = rankProducts(filtered, debouncedQuery);
        }

        return filtered;
    }, [handbags, debouncedQuery, activeFilters]);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    const handleSearch = useCallback(
        async (term) => {
            const trimmed = (term || query).trim();
            if (!trimmed) return;
            setQuery(trimmed);
            setDebouncedQuery(trimmed);
            setIsFocused(false);
            searchInputRef.current?.blur();
            const updated = await addSearchTerm(trimmed);
            setSearchHistory(updated);
        },
        [query],
    );

    const handleChipPress = useCallback(
        (type, value) => {
            setActiveFilters((prev) => {
                const next = { ...prev };
                if (prev[type] === value) {
                    next[type] = null; // toggle off
                } else {
                    next[type] = value;
                }
                return next;
            });
            setQuery("");
            setDebouncedQuery("");
        },
        [],
    );

    const handleClearHistory = useCallback(async () => {
        const cleared = await clearSearchHistory();
        setSearchHistory(cleared);
    }, []);

    const handleClearFilters = useCallback(() => {
        setActiveFilters({ category: null, brand: null, color: null });
        setQuery("");
        setDebouncedQuery("");
    }, []);

    const isFavorite = useCallback(
        (handbagId) => favorites.some((item) => item.id === handbagId),
        [favorites],
    );

    const handleFavoritePress = useCallback(
        async (handbag) => {
            let newFavorites;
            if (isFavorite(handbag.id)) {
                newFavorites = await removeFavorite(handbag.id);
            } else {
                newFavorites = await addFavorite(handbag);
            }
            setFavorites(newFavorites);
        },
        [isFavorite],
    );

    const handleProductPress = useCallback(
        (handbag) => {
            navigation.navigate("SearchDetail", { handbag });
        },
        [navigation],
    );

    // -----------------------------------------------------------------------
    // Computed flags
    // -----------------------------------------------------------------------

    const hasActiveFilters =
        activeFilters.category || activeFilters.brand || activeFilters.color;
    const hasResults = results.length > 0;
    const showRecent =
        !isFocused && !query && searchHistory.length > 0 && !hasActiveFilters;
    const showTrending =
        !isFocused && !query && !hasActiveFilters;
    const showRecommendations =
        isFocused && !query && !hasActiveFilters;
    const showSuggestions =
        isFocused &&
        query.length > 0 &&
        (suggestions.brands.length > 0 ||
            suggestions.categories.length > 0 ||
            suggestions.products.length > 0);
    const showResults =
        (query.length > 0 || hasActiveFilters) && !initialLoading;

    // -----------------------------------------------------------------------
    // Render helpers
    // -----------------------------------------------------------------------

    const renderProductItem = useCallback(
        ({ item }) => (
            <SearchCard
                handbag={item}
                isFavorite={isFavorite(item.id)}
                onFavoritePress={() => handleFavoritePress(item)}
                onPress={() => handleProductPress(item)}
            />
        ),
        [isFavorite, handleFavoritePress, handleProductPress],
    );

    const keyExtractor = useCallback((item) => item.id, []);

    // -----------------------------------------------------------------------
    // Empty state
    // -----------------------------------------------------------------------

    const renderEmptyState = () => {
        if (initialLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <Ionicons
                    name="search-outline"
                    size={64}
                    color={colors.muted}
                    style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No handbags found</Text>
                <Text style={styles.emptySubtitle}>Try:</Text>
                <Text style={styles.emptySuggestion}>• Different color</Text>
                <Text style={styles.emptySuggestion}>• Different brand</Text>
                <Text style={styles.emptySuggestion}>• Remove filters</Text>
                {hasActiveFilters && (
                    <Pressable style={styles.clearFilterBtn} onPress={handleClearFilters}>
                        <Text style={styles.clearFilterBtnText}>Clear all filters</Text>
                    </Pressable>
                )}
            </View>
        );
    };

    // -----------------------------------------------------------------------
    // Loading state
    // -----------------------------------------------------------------------

    if (initialLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading handbags...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* ---- Active filter chips indicator ---- */}
            {hasActiveFilters && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.activeFilterRow}
                    contentContainerStyle={styles.activeFilterRowContent}
                >
                    {activeFilters.category && (
                        <FilterChip
                            label={`Category: ${activeFilters.category}`}
                            active
                            onPress={() => handleChipPress("category", null)}
                        />
                    )}
                    {activeFilters.brand && (
                        <FilterChip
                            label={`Brand: ${activeFilters.brand}`}
                            active
                            onPress={() => handleChipPress("brand", null)}
                        />
                    )}
                    {activeFilters.color && (
                        <FilterChip
                            label={`Color: ${activeFilters.color}`}
                            active
                            onPress={() => handleChipPress("color", null)}
                        />
                    )}
                    <Pressable onPress={handleClearFilters}>
                        <Text style={styles.clearAllChips}>Clear all</Text>
                    </Pressable>
                </ScrollView>
            )}

            {/* ---- Main content ---- */}
            {showResults ? (
                /* ---------- RESULTS ---------- */
                <FlatList
                    data={results}
                    keyExtractor={keyExtractor}
                    renderItem={renderProductItem}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text style={styles.resultsCount}>
                            {results.length}{" "}
                            {results.length === 1 ? "result" : "results"} found
                        </Text>
                    }
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={styles.resultsList}
                />
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    style={styles.scrollContent}
                    contentContainerStyle={styles.scrollContentInner}
                >
                    {/* ---- SECTION: Recent Searches ---- */}
                    {showRecent && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Searches</Text>
                                <Pressable onPress={handleClearHistory}>
                                    <Text style={styles.clearText}>Clear</Text>
                                </Pressable>
                            </View>
                            <View style={styles.chipsRow}>
                                {searchHistory.map((term, index) => (
                                    <SuggestionChip
                                        key={`recent-${index}`}
                                        icon="search-outline"
                                        label={term}
                                        onPress={() => {
                                            setQuery(term);
                                            setDebouncedQuery(term);
                                            handleSearch(term);
                                        }}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ---- SECTION: Trending Searches ---- */}
                    {showTrending && trending.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Trending Searches</Text>
                            <View style={styles.chipsRow}>
                                {trending.map((term, index) => (
                                    <SuggestionChip
                                        key={`trend-${index}`}
                                        icon="flame-outline"
                                        label={term}
                                        onPress={() => {
                                            setQuery(term);
                                            setDebouncedQuery(term);
                                            handleSearch(term);
                                        }}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ---- SECTION: Quick Filters ---- */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.chipsScroll}
                            contentContainerStyle={styles.chipsScrollContent}
                        >
                            <FilterChip
                                label="All"
                                active={!activeFilters.category}
                                onPress={() => handleChipPress("category", null)}
                            />
                            {categories.map((cat) => (
                                <FilterChip
                                    key={cat}
                                    label={cat}
                                    active={activeFilters.category === cat}
                                    onPress={() => handleChipPress("category", cat)}
                                />
                            ))}
                        </ScrollView>

                        <Text style={styles.sectionTitle}>Brands</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.chipsScroll}
                            contentContainerStyle={styles.chipsScrollContent}
                        >
                            {brands.map((brand) => (
                                <FilterChip
                                    key={brand}
                                    label={brand}
                                    active={activeFilters.brand === brand}
                                    onPress={() => handleChipPress("brand", brand)}
                                />
                            ))}
                        </ScrollView>

                        <Text style={styles.sectionTitle}>Colors</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.chipsScroll}
                            contentContainerStyle={styles.chipsScrollContent}
                        >
                            {colorsList.map((color) => (
                                <FilterChip
                                    key={color}
                                    label={color}
                                    active={activeFilters.color === color}
                                    onPress={() => handleChipPress("color", color)}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    {/* ---- SECTION: Recommendation Cards (focused + empty) ---- */}
                    {showRecommendations && recommendations.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Popular Brands</Text>
                            {recommendations.map((rec) => (
                                <BrandRecommendationCard
                                    key={rec.brand}
                                    brand={rec.brand}
                                    productCount={rec.productCount}
                                    avgRating={rec.avgRating}
                                    onPress={() => handleChipPress("brand", rec.brand)}
                                />
                            ))}
                        </View>
                    )}

                    {/* ---- SECTION: Smart Suggestions (typing) ---- */}
                    {showSuggestions && (
                        <View style={styles.suggestionsContainer}>
                            {suggestions.brands.length > 0 && (
                                <View style={styles.suggestionGroup}>
                                    <Text style={styles.suggestionGroupTitle}>Brands</Text>
                                    {suggestions.brands.map((brand) => (
                                        <Pressable
                                            key={brand}
                                            style={styles.suggestionItem}
                                            onPress={() => {
                                                setQuery(brand);
                                                setDebouncedQuery(brand);
                                                handleSearch(brand);
                                            }}
                                        >
                                            <Ionicons
                                                name="pricetag-outline"
                                                size={16}
                                                color={colors.primary}
                                            />
                                            <Text style={styles.suggestionItemText}>{brand}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}

                            {suggestions.categories.length > 0 && (
                                <View style={styles.suggestionGroup}>
                                    <Text style={styles.suggestionGroupTitle}>Categories</Text>
                                    {suggestions.categories.map((cat) => (
                                        <Pressable
                                            key={cat}
                                            style={styles.suggestionItem}
                                            onPress={() => {
                                                handleChipPress("category", cat);
                                                setIsFocused(false);
                                                searchInputRef.current?.blur();
                                            }}
                                        >
                                            <Ionicons
                                                name="folder-outline"
                                                size={16}
                                                color={colors.primary}
                                            />
                                            <Text style={styles.suggestionItemText}>{cat}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}

                            {suggestions.products.length > 0 && (
                                <View style={styles.suggestionGroup}>
                                    <Text style={styles.suggestionGroupTitle}>Products</Text>
                                    {suggestions.products.map((product) => (
                                        <Pressable
                                            key={product.id}
                                            style={styles.suggestionItem}
                                            onPress={() => {
                                                navigation.navigate("SearchDetail", {
                                                    handbag: product,
                                                });
                                            }}
                                        >
                                            <Ionicons
                                                name="bag-outline"
                                                size={16}
                                                color={colors.primary}
                                            />
                                            <Text style={styles.suggestionItemText} numberOfLines={1}>
                                                {product.handbagName}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Bottom spacing */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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

    // ---------- Search Header (rendered in native stack header) ----------
    searchHeader: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    backBtn: {
        padding: 4,
        marginRight: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    headerIconBtn: {
        padding: 6,
        marginLeft: 4,
    },


    // ---------- Active Filters ----------
    activeFilterRow: {
        maxHeight: 50,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    activeFilterRowContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    clearAllChips: {
        color: colors.muted,
        fontWeight: "600",
        fontSize: 13,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },

    // ---------- Scroll Content ----------
    scrollContent: {
        flex: 1,
    },
    scrollContentInner: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },

    // ---------- Sections ----------
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
        letterSpacing: -0.3,
        marginBottom: 12,
        marginTop: 4,
    },
    clearText: {
        fontSize: 13,
        color: colors.muted,
        fontWeight: "500",
    },

    // ---------- Chips ----------
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        minHeight: 44,
    },
    chipsScroll: {
        height: 48,
        marginBottom: 8,
    },
    chipsScrollContent: {
        paddingRight: 24,
        alignItems: "center",
    },
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        backgroundColor: colors.white,
        marginRight: 10,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 8,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        color: colors.text,
        fontWeight: "500",
        fontSize: 13,
    },
    chipTextActive: {
        color: colors.white,
        fontWeight: "600",
    },

    // ---------- Suggestion Chips ----------
    suggestionChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 6,
    },
    suggestionChipText: {
        color: colors.text,
        fontWeight: "500",
        fontSize: 13,
    },

    // ---------- Recommendations ----------
    recommendCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    recommendCardContent: {
        flex: 1,
        gap: 4,
    },
    recommendBrand: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
        letterSpacing: -0.2,
    },
    recommendMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    recommendCount: {
        fontSize: 13,
        color: colors.muted,
    },
    recommendRatingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    recommendRating: {
        fontSize: 13,
        color: colors.secondary,
        fontWeight: "600",
    },

    // ---------- Suggestions ----------
    suggestionsContainer: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    suggestionGroup: {
        marginBottom: 8,
    },
    suggestionGroupTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.muted,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginBottom: 4,
        paddingHorizontal: 8,
        paddingTop: 4,
    },
    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 8,
        gap: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    suggestionItemText: {
        fontSize: 15,
        color: colors.text,
        flex: 1,
    },

    // ---------- Results ----------
    resultsList: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
    },
    resultsCount: {
        fontSize: 13,
        color: colors.muted,
        fontWeight: "500",
        marginBottom: 10,
    },

    // ---------- Empty State ----------
    emptyContainer: {
        alignItems: "center",
        paddingTop: 40,
        paddingBottom: 40,
    },
    emptyIcon: {
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.text,
        letterSpacing: -0.3,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: colors.muted,
        marginBottom: 6,
    },
    emptySuggestion: {
        fontSize: 14,
        color: colors.muted,
        marginBottom: 4,
    },
    clearFilterBtn: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.border,
    },
    clearFilterBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
    },
});

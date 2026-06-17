/**
 * Calculate average rating from review array
 */
export function getAverageRating(review = []) {
    if (!review || review.length === 0) return 0;
    const sum = review.reduce((acc, r) => acc + r.rating, 0);
    return sum / review.length;
}

/**
 * Extract unique values from products
 */
export function getAllBrands(products) {
    return [...new Set(products.map((p) => p.brand))].sort();
}

export function getAllCategories(products) {
    return [...new Set(products.map((p) => p.category))].sort();
}

export function getAllColors(products) {
    return [...new Set(products.flatMap((p) => p.color || []))].sort();
}

/**
 * Natural language query parser
 * Detects brand names, colors, categories, and price limits from free text
 */
export function parseSearchQuery(text, products) {
    if (!text || !text.trim()) {
        return {
            brand: null,
            color: null,
            category: null,
            maxPrice: null,
            minPrice: null,
        };
    }

    const lower = text.toLowerCase().trim();

    const allBrands = getAllBrands(products);
    const allCategories = getAllCategories(products);
    const allColors = getAllColors(products);

    let brand = null;
    let color = null;
    let category = null;
    let maxPrice = null;
    let minPrice = null;

    // Detect price: "under 500", "less than 500", "below 100", ">= 200", etc.
    const priceUnderMatch = lower.match(
        /(?:under|less than|below|cheaper than|max|budget|<=?)\s*(?:\$)?\s*(\d+\.?\d*)/i,
    );
    const priceAboveMatch = lower.match(
        /(?:above|over|more than|min|starting from|>=?)\s*(?:\$)?\s*(\d+\.?\d*)/i,
    );

    if (priceUnderMatch) maxPrice = Number(priceUnderMatch[1]);
    if (priceAboveMatch) minPrice = Number(priceAboveMatch[1]);

    // Detect brand (match longest brand name first)
    const sortedBrands = [...allBrands].sort((a, b) => b.length - a.length);
    for (const b of sortedBrands) {
        if (lower.includes(b.toLowerCase())) {
            brand = b;
            break;
        }
    }

    // Detect category
    for (const c of allCategories) {
        if (lower.includes(c.toLowerCase())) {
            category = c;
            break;
        }
    }

    // Detect color
    for (const c of allColors) {
        if (lower.includes(c.toLowerCase())) {
            color = c;
            break;
        }
    }

    return { brand, color, category, maxPrice, minPrice };
}

/**
 * Filter products by active chip filters + natural language parsed query
 */
export function filterProducts(products, query, activeFilters = {}) {
    if (!products || products.length === 0) return [];

    const lower = (query || "").toLowerCase().trim();
    const words = lower ? lower.split(/\s+/) : [];
    const parsed = parseSearchQuery(query, products);

    return products.filter((product) => {
        // 1. Apply active filter chips (explicit narrowing)
        if (
            activeFilters.category &&
            product.category !== activeFilters.category
        ) {
            return false;
        }
        if (activeFilters.brand && product.brand !== activeFilters.brand) {
            return false;
        }
        if (
            activeFilters.color &&
            !(product.color || []).some(
                (c) => c.toLowerCase() === activeFilters.color.toLowerCase(),
            )
        ) {
            return false;
        }

        // 2. Apply parsed natural language filters
        // Skip parsed brand if active brand chip is set (avoid conflict)
        if (
            parsed.brand &&
            !activeFilters.brand &&
            product.brand !== parsed.brand
        ) {
            return false;
        }
        // Skip parsed category if active category chip is set
        if (
            parsed.category &&
            !activeFilters.category &&
            product.category !== parsed.category
        ) {
            return false;
        }
        // Skip parsed color if active color chip is set
        if (
            parsed.color &&
            !activeFilters.color &&
            !(product.color || []).some(
                (c) => c.toLowerCase() === parsed.color.toLowerCase(),
            )
        ) {
            return false;
        }
        if (parsed.maxPrice !== null && Number(product.cost) > parsed.maxPrice) {
            return false;
        }
        if (parsed.minPrice !== null && Number(product.cost) < parsed.minPrice) {
            return false;
        }

        // 3. If no structured filter matched from text, do general text search
        const hasTextFilter =
            parsed.brand ||
            parsed.category ||
            parsed.color ||
            parsed.maxPrice !== null ||
            parsed.minPrice !== null;

        if (!hasTextFilter && words.length > 0) {
            return words.some((word) => {
                if (word.length < 1) return false;
                return (
                    product.handbagName.toLowerCase().includes(word) ||
                    product.brand.toLowerCase().includes(word) ||
                    product.category.toLowerCase().includes(word) ||
                    (product.color || []).some((c) => c.toLowerCase().includes(word))
                );
            });
        }

        return true;
    });
}

/**
 * Score and rank products based on search query relevance
 *
 * score = 100 * exactNameMatch + 80 * startsWithName + 60 * brandMatch +
 *         40 * categoryMatch + 20 * colorMatch + averageRating
 */
export function rankProducts(products, query) {
    if (!query || !query.trim()) return products;

    const lower = query.toLowerCase().trim();
    const words = lower.split(/\s+/);

    return [...products]
        .map((product) => {
            const nameLower = product.handbagName.toLowerCase();
            const brandLower = product.brand.toLowerCase();
            const categoryLower = product.category.toLowerCase();
            const colorsLower = (product.color || []).map((c) => c.toLowerCase());
            const avgRating = getAverageRating(product.review);

            let score = 0;

            // Exact product name match
            if (nameLower === lower) {
                score += 100;
            }

            // Name starts with query
            if (nameLower.startsWith(lower)) {
                score += 80;
            }

            // Brand match
            if (
                brandLower.includes(lower) ||
                words.some((w) => brandLower.includes(w))
            ) {
                score += 60;
            }

            // Category match
            if (
                categoryLower.includes(lower) ||
                words.some((w) => categoryLower.includes(w))
            ) {
                score += 40;
            }

            // Color match
            if (
                colorsLower.some(
                    (c) => c.includes(lower) || words.some((w) => c.includes(w)),
                )
            ) {
                score += 20;
            }

            // General name contains query
            if (
                nameLower.includes(lower) ||
                words.some((w) => nameLower.includes(w))
            ) {
                score += 10;
            }

            score += avgRating;

            return { ...product, _score: score };
        })
        .filter((p) => p._score > 0)
        .sort((a, b) => b._score - a._score);
}

/**
 * Generate trending searches from dataset
 * Returns top brands, categories, and colors
 */
export function getTrendingSearches(products) {
    if (!products || products.length === 0) return [];

    const trends = [];

    // Top brands
    const brandCounts = {};
    products.forEach((p) => {
        brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });
    const topBrands = Object.entries(brandCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([brand]) => brand);
    trends.push(...topBrands);

    // Top categories
    const categoryCounts = {};
    products.forEach((p) => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);
    trends.push(...topCategories);

    // Top colors (as "Color Bags")
    const colorCounts = {};
    products.forEach((p) => {
        (p.color || []).forEach((c) => {
            colorCounts[c] = (colorCounts[c] || 0) + 1;
        });
    });
    const topColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([color]) => `${color} Bags`);
    trends.push(...topColors);

    // Deduplicate and limit
    return [...new Set(trends)].slice(0, 8);
}

/**
 * Get smart suggestions grouped by type as user types
 */
export function getSmartSuggestions(products, text) {
    if (!text || text.trim().length < 1) {
        return { brands: [], categories: [], products: [] };
    }

    const lower = text.toLowerCase().trim();

    // Match brands
    const brands = getAllBrands(products).filter((b) =>
        b.toLowerCase().includes(lower),
    );

    // Match categories
    const categories = getAllCategories(products).filter((c) =>
        c.toLowerCase().includes(lower),
    );

    // Match product names (top 5)
    const matchedProducts = products
        .filter((p) => p.handbagName.toLowerCase().includes(lower))
        .slice(0, 5);

    return { brands, categories, products: matchedProducts };
}

/**
 * Get recommendation cards for popular brands
 * Returns brand name, product count, and average rating
 */
export function getRecommendationCards(products) {
    if (!products || products.length === 0) return [];

    const brandMap = {};
    products.forEach((p) => {
        if (!brandMap[p.brand]) {
            brandMap[p.brand] = { products: [], ratings: [] };
        }
        brandMap[p.brand].products.push(p);
        (p.review || []).forEach((r) => brandMap[p.brand].ratings.push(r.rating));
    });

    return Object.entries(brandMap)
        .map(([brand, data]) => {
            const avgRating =
                data.ratings.length > 0
                    ? data.ratings.reduce((s, r) => s + r, 0) / data.ratings.length
                    : 0;
            return {
                brand,
                productCount: data.products.length,
                avgRating: Number(avgRating.toFixed(1)),
            };
        })
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, 6);
}

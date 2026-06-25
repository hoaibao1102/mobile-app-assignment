import { useState, useEffect, useCallback } from "react";
import { getHandbags } from "../api/handbagApi";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getHandbags();
      if (!data || data.length === 0) {
        throw new Error("No handbags found");
      }
      setProducts(data);
    } catch (err) {
      setError("Failed to load products. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchProducts(true);
  }, []);

  const refetch = useCallback(() => {
    fetchProducts(false);
  }, []);

  return { products, loading, error, refreshing, handleRefresh, refetch };
}

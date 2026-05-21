import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export function BrandFilter({ brands, selectedBrand, onSelectBrand }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {brands.map((brand) => {
        const active = selectedBrand === brand;

        return (
          <Pressable
            key={brand}
            onPress={() => onSelectBrand(brand)}
            style={[styles.item, active && styles.activeItem]}
          >
            <Text style={[styles.text, active && styles.activeText]}>
              {brand}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    height: 50,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeItem: {
    backgroundColor: colors.primary,
  },
  text: {
    color: colors.text,
    fontWeight: "600",
  },
  activeText: {
    color: colors.white,
  },
});

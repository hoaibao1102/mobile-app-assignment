import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export function BrandFilter({ brands, selectedBrand, onSelectBrand }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
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
    marginBottom: 8,
    height: 48,
  },
  content: {
    paddingRight: 20,
    alignItems: "center",
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: colors.white,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.text,
    fontWeight: "500",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  activeText: {
    color: colors.white,
    fontWeight: "600",
  },
});

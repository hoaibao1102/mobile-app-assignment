import { ScrollView, Pressable, Text, StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";

export function BrandFilter({ brands, selectedBrand, onSelectBrand }) {
  return (
    <View style={styles.outerContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {brands.map((brand) => {
          const active = selectedBrand === brand;

          return (
            <Pressable
              key={brand}
              onPress={() => onSelectBrand(brand)}
              style={({ pressed }) => [
                styles.item,
                active && styles.activeItem,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.text, active && styles.activeText]}>
                {brand}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingLeft: 2,
    paddingRight: 16,
    paddingVertical: 4, // Allow room for dropshadow
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  activeItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  text: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
  },
  activeText: {
    color: colors.white,
  },
});

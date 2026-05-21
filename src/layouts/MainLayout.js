import { SafeAreaView, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export function MainLayout({ children }) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getHandbags() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
   

    return data;
  } catch (error) {
    console.log("Get handbags error:", error);
    return [];
  }
}

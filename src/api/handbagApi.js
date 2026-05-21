const API_URL = "https://6910152245e65ab24ac584e0.mockapi.io/se181860";

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

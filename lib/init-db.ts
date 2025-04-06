import dbConnect from "@/lib/mongodb";

export async function initializeDatabase() {
  try {
    await dbConnect();
    console.log("Database connected successfully");
    return true;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return false;
  }
}

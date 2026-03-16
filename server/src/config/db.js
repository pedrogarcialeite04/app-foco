/**
 * FOCO — Conexão MongoDB
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/foco";

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("[DB] MongoDB conectado");
  } catch (err) {
    console.error("[DB] Erro ao conectar:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.log("[DB] MongoDB desconectado");
});

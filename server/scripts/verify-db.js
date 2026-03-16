/**
 * FOCO — Verificação do MongoDB (contagem e amostra).
 * Executar a partir da pasta server: node scripts/verify-db.js
 * Usa o mesmo MONGODB_URI do .env; não exibe senhas.
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Rotina from "../src/models/Rotina.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/foco";

async function verify() {
  console.log("[verify-db] Conectando ao MongoDB...");
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.error("[verify-db] Erro ao conectar:", err.message);
    process.exit(1);
  }

  try {
    const userCount = await User.countDocuments();
    const rotinaCount = await Rotina.countDocuments();

    console.log("\n--- FOCO — Estado do banco (coleção foco) ---\n");
    console.log("  Usuários (users):  ", userCount);
    console.log("  Rotinas (rotinas): ", rotinaCount);
    console.log("");

    if (userCount > 0) {
      const sampleUser = await User.findOne().select("name email createdAt").lean();
      console.log("  Amostra usuário (sem senha):", JSON.stringify(sampleUser, null, 2));
      console.log("");
    }

    if (rotinaCount > 0) {
      const sampleRotina = await Rotina.findOne()
        .select("userId checks customTasks removedTaskIds updatedAt")
        .lean();
      if (sampleRotina) {
        sampleRotina.userId = sampleRotina.userId?.toString();
        console.log("  Amostra rotina:", JSON.stringify(sampleRotina, null, 2));
      }
      console.log("");
    }

    console.log("--- Verificação concluída. MongoDB está persistindo dados. ---\n");
  } catch (err) {
    console.error("[verify-db] Erro ao ler dados:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("[verify-db] Desconectado.");
  }
}

verify();

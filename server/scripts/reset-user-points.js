/**
 * FOCO — Reset de pontos/rotina para um usuário específico.
 * Uso (na pasta server):
 *   node scripts/reset-user-points.js email@exemplo.com
 */
import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import Rotina from "../src/models/Rotina.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/foco";

async function main() {
  const emailArg = (process.argv[2] || "").toLowerCase().trim();
  if (!emailArg) {
    console.error("Informe o email: node scripts/reset-user-points.js email@exemplo.com");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.error("[reset-user-points] Erro ao conectar ao MongoDB:", err.message);
    process.exit(1);
  }

  try {
    const user = await User.findOne({ email: emailArg }).lean();
    if (!user) {
      console.error("[reset-user-points] Usuário não encontrado:", emailArg);
      process.exit(1);
    }

    await Rotina.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          checks: {},
          customTasks: [],
          removedTaskIds: [],
          metaBonusPoints: 0,
        },
      },
      { upsert: true, runValidators: true }
    );

    console.log("[reset-user-points] Rotina e pontos zerados para:", emailArg);
  } catch (err) {
    console.error("[reset-user-points] Erro ao resetar usuário:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


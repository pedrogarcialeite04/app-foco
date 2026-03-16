/**
 * FOCO — Dados da rotina por usuário (checks, customTasks, removedTaskIds)
 * Espelha o formato do frontend (storage.js).
 */
import mongoose from "mongoose";

const customTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const rotinaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    checks: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      validate: {
        validator: (v) => typeof v === "object" && v !== null && !Array.isArray(v),
        message: "checks deve ser um objeto",
      },
    },
    customTasks: {
      type: [customTaskSchema],
      default: [],
    },
    removedTaskIds: {
      type: [String],
      default: [],
    },
    metaBonusPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Rotina", rotinaSchema);

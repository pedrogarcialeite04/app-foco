/**
 * FOCO — Metas por usuário (lista de metas concluídas/abertas).
 * Espelha o formato usado no frontend (metas-page.js).
 */
import mongoose from "mongoose";

const metaItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    done: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const metasSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: {
      type: [metaItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Metas", metasSchema);


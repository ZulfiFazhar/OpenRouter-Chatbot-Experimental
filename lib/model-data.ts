// Define the Model interface
interface Model {
  id: string;
  name: string;
  iconName: string;
  plan: string;
  subModels: SubModel[];
}

// Define the SubModel interface
interface SubModel {
  id: string;
  name: string;
  description: string;
}

// Define the modelData array
const modelData: Model[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    iconName: "command",
    plan: "Free",
    subModels: [
      {
        id: "deepseek-v3-base",
        name: "DeepSeek V3 Base",
        description: "anjay",
      },
      {
        id: "deepseek-r1-zero",
        name: "DeepSeek R1 Zero",
        description: "anjay",
      },
      {
        id: "deepseek-r1-qwen",
        name: "DeepSeek R1 Distill Qwen",
        description: "anjay",
      },
    ],
  },
  {
    id: "dall-e-3",
    name: "DALL·E 3",
    iconName: "gallery-vertical-end",
    plan: "Paid",
    subModels: [
      { id: "dall-e-3-standard", name: "Standard", description: "anjay" },
    ],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    iconName: "audio-waveform",
    plan: "Paid",
    subModels: [
      { id: "elevenlabs-standard", name: "Standard", description: "anjay" },
    ],
  },
];

// Fungsi helper untuk mendapatkan nama model berdasarkan ID
export function getModelNameById(modelId: string): string {
  if (!modelId) return "Unknown Model";

  // Cari di semua model dan sub-model
  for (const model of modelData) {
    // Cek apakah ID adalah model utama
    if (model.id === modelId) {
      return model.name;
    }

    // Cek di sub-model
    const subModel = model.subModels.find((sub) => sub.id === modelId);
    if (subModel) {
      return subModel.name;
    }
  }

  // Fallback jika tidak ditemukan
  return "Unknown Model";
}

// Fungsi untuk mendapatkan model utama berdasarkan ID sub-model
export function getParentModelById(subModelId: string): Model | null {
  if (!subModelId) return null;

  for (const model of modelData) {
    if (model.id === subModelId) {
      return model; // Jika ID adalah model utama
    }

    if (model.subModels.some((sub) => sub.id === subModelId)) {
      return model;
    }
  }

  // Fallback jika tidak ditemukan
  return null;
}

export { modelData };

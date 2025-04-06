"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { modelData } from "@/lib/model-data";

interface ModelContextType {
  activeModelId: string;
  setActiveModelId: (modelId: string) => void;
  activeSubModelId: string;
  setActiveSubModelId: (subModelId: string) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({
  children,
  initialModelId = modelData[0].id,
  initialSubModelId = modelData[0].subModels[0].id,
}: {
  children: ReactNode;
  initialModelId?: string;
  initialSubModelId?: string;
}) {
  const [activeModelId, setActiveModelId] = useState<string>(initialModelId);
  const [activeSubModelId, setActiveSubModelId] =
    useState<string>(initialSubModelId);

  // Ketika model utama berubah, atur sub-model aktif ke sub-model pertama dari model utama tersebut
  const handleSetActiveModelId = (modelId: string) => {
    setActiveModelId(modelId);
    const model = modelData.find((m) => m.id === modelId);
    if (model && model.subModels.length > 0) {
      setActiveSubModelId(model.subModels[0].id);
    }
  };

  return (
    <ModelContext.Provider
      value={{
        activeModelId,
        setActiveModelId: handleSetActiveModelId,
        activeSubModelId,
        setActiveSubModelId,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }

  // Temukan model aktif dan sub-model aktif
  const activeModel =
    modelData.find((model) => model.id === context.activeModelId) ||
    modelData[0];
  const activeSubModel =
    activeModel.subModels.find(
      (subModel) => subModel.id === context.activeSubModelId
    ) || activeModel.subModels[0];

  return {
    ...context,
    activeModel,
    activeSubModel,
    models: modelData,
  };
}

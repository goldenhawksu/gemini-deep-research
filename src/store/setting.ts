import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingStore {
  provider: string;
  mode: string;
  apiKey: string;
  apiProxy: string;
  googleVertexProject: string;
  googleVertexLocation: string;
  googleClientEmail: string;
  googlePrivateKey: string;
  googlePrivateKeyId: string;
  googleVertexThinkingModel: string;
  googleVertexNetworkingModel: string;
  openRouterApiKey: string;
  openRouterApiProxy: string;
  openRouterThinkingModel: string;
  openRouterNetworkingModel: string;
  openAIApiKey: string;
  openAIApiProxy: string;
  openAIThinkingModel: string;
  openAINetworkingModel: string;
  anthropicApiKey: string;
  anthropicApiProxy: string;
  anthropicThinkingModel: string;
  anthropicNetworkingModel: string;
  deepseekApiKey: string;
  deepseekApiProxy: string;
  deepseekThinkingModel: string;
  deepseekNetworkingModel: string;
  xAIApiKey: string;
  xAIApiProxy: string;
  xAIThinkingModel: string;
  xAINetworkingModel: string;
  mistralApiKey: string;
  mistralApiProxy: string;
  mistralThinkingModel: string;
  mistralNetworkingModel: string;
  azureApiKey: string;
  azureResourceName: string;
  azureApiVersion: string;
  azureThinkingModel: string;
  azureNetworkingModel: string;
  openAICompatibleApiKey: string;
  openAICompatibleApiProxy: string;
  openAICompatibleThinkingModel: string;
  openAICompatibleNetworkingModel: string;
  pollinationsApiProxy: string;
  pollinationsThinkingModel: string;
  pollinationsNetworkingModel: string;
  ollamaApiProxy: string;
  ollamaThinkingModel: string;
  ollamaNetworkingModel: string;
  accessPassword: string;
  thinkingModel: string;
  networkingModel: string;
  enableSearch: string;
  searchProvider: string;
  tavilyApiKey: string;
  tavilyApiProxy: string;
  tavilyScope: string;
  firecrawlApiKey: string;
  firecrawlApiProxy: string;
  exaApiKey: string;
  exaApiProxy: string;
  exaScope: string;
  bochaApiKey: string;
  bochaApiProxy: string;
  braveApiKey: string;
  braveApiProxy: string;
  searxngApiProxy: string;
  searxngScope: string;
  parallelSearch: number;
  searchMaxResult: number;
  crawler: string;
  language: string;
  theme: string;
  debug: "enable" | "disable";
  references: "enable" | "disable";
  citationImage: "enable" | "disable";
  smoothTextStreamType: "character" | "word" | "line";
  onlyUseLocalResource: "enable" | "disable";
  useFileFormatResource: "enable" | "disable";
}

interface SettingActions {
  update: (values: Partial<SettingStore>) => void;
  reset: () => void;
}

export const defaultValues: SettingStore = {
  provider: "openaicompatible",
  mode: "proxy",
  apiKey: "",
  apiProxy: "",
  thinkingModel: "gemini-2.5-flash",
  networkingModel: "gemini-2.5-flash",
  googleVertexProject: "",
  googleVertexLocation: "",
  googleClientEmail: "",
  googlePrivateKey: "",
  googlePrivateKeyId: "",
  googleVertexThinkingModel: "",
  googleVertexNetworkingModel: "",
  openRouterApiKey: "",
  openRouterApiProxy: "",
  openRouterThinkingModel: "",
  openRouterNetworkingModel: "",
  openAIApiKey: "",
  openAIApiProxy: "",
  openAIThinkingModel: "gpt-5",
  openAINetworkingModel: "gpt-5-mini",
  anthropicApiKey: "",
  anthropicApiProxy: "",
  anthropicThinkingModel: "",
  anthropicNetworkingModel: "",
  deepseekApiKey: "",
  deepseekApiProxy: "",
  deepseekThinkingModel: "deepseek-reasoner",
  deepseekNetworkingModel: "deepseek-chat",
  xAIApiKey: "",
  xAIApiProxy: "",
  xAIThinkingModel: "",
  xAINetworkingModel: "",
  mistralApiKey: "",
  mistralApiProxy: "",
  mistralThinkingModel: "mistral-large-latest",
  mistralNetworkingModel: "mistral-medium-latest",
  azureApiKey: "",
  azureResourceName: "",
  azureApiVersion: "",
  azureThinkingModel: "",
  azureNetworkingModel: "",
  openAICompatibleApiKey: "",
  openAICompatibleApiProxy: "",
  openAICompatibleThinkingModel: "gpt-6.1-sol",
  openAICompatibleNetworkingModel: "gpt-6.1-sol",
  pollinationsApiProxy: "",
  pollinationsThinkingModel: "",
  pollinationsNetworkingModel: "",
  ollamaApiProxy: "",
  ollamaThinkingModel: "",
  ollamaNetworkingModel: "",
  accessPassword: "",
  enableSearch: "1",
  searchProvider: "searxng",
  tavilyApiKey: "",
  tavilyApiProxy: "",
  tavilyScope: "general",
  firecrawlApiKey: "",
  firecrawlApiProxy: "",
  exaApiKey: "",
  exaApiProxy: "",
  exaScope: "research paper",
  bochaApiKey: "",
  bochaApiProxy: "",
  braveApiKey: "",
  braveApiProxy: "",
  searxngApiProxy: "",
  searxngScope: "all",
  parallelSearch: 1,
  searchMaxResult: 5,
  crawler: "jina",
  language: "",
  theme: "system",
  debug: "disable",
  references: "enable",
  citationImage: "enable",
  smoothTextStreamType: "word",
  onlyUseLocalResource: "disable",
  useFileFormatResource: "disable",
};

// Cookie-authenticated server proxy needs no browser password or API key.
// Only infer local mode from credentials for the active provider.
export function resolveRequestMode(settings: Partial<SettingStore>): string {
  if (settings.mode) return settings.mode;
  if (settings.provider === "google-vertex" &&
      (settings.googleVertexProject?.trim() || settings.googleVertexLocation?.trim())) return "local";
  const keyFields: Record<string, keyof SettingStore> = {
    google: "apiKey", "google-vertex": "googlePrivateKey", openrouter: "openRouterApiKey",
    openai: "openAIApiKey", anthropic: "anthropicApiKey", deepseek: "deepseekApiKey",
    xai: "xAIApiKey", mistral: "mistralApiKey", azure: "azureApiKey",
    openaicompatible: "openAICompatibleApiKey", ollama: "ollamaApiProxy",
    pollinations: "pollinationsApiProxy",
  };
  const field = keyFields[settings.provider || defaultValues.provider];
  return field && String(settings[field] || "").trim() ? "local" : "proxy";
}

export function migrateSettings(saved: Partial<SettingStore>): Partial<SettingStore> {
  const untouched = saved.provider === "google" && !saved.mode && !saved.apiKey &&
    saved.thinkingModel === "gemini-2.5-flash" && saved.networkingModel === "gemini-2.5-flash" && saved.searchProvider === "model";
  const migrated = untouched
    ? { ...saved, provider: "openaicompatible", mode: "proxy", searchProvider: "searxng", openAICompatibleThinkingModel: defaultValues.openAICompatibleThinkingModel, openAICompatibleNetworkingModel: defaultValues.openAICompatibleNetworkingModel }
    : { ...saved, mode: resolveRequestMode(saved) };
  if (migrated.provider === "openaicompatible" && migrated.mode === "proxy") {
    if (migrated.openAICompatibleThinkingModel === "gpt-6.1-terra") {
      migrated.openAICompatibleThinkingModel = defaultValues.openAICompatibleThinkingModel;
    }
    if (migrated.openAICompatibleNetworkingModel === "gpt-6.1-terra") {
      migrated.openAICompatibleNetworkingModel = defaultValues.openAICompatibleNetworkingModel;
    }
  }
  return migrated;
}

export const useSettingStore = create(
  persist<SettingStore & SettingActions>(
    (set) => ({
      ...defaultValues,
      update: (values) => set(values),
      reset: () => set(defaultValues),
    }),
    { name: "setting", version: 3, migrate: (saved) => migrateSettings(saved as Partial<SettingStore>) as SettingStore & SettingActions },
  ),
);

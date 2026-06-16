export const PROVIDERS = {
  nim: {
    name: "NVIDIA NIM",
    target: "https://integrate.api.nvidia.com",
    pathPrefix: "/nim",
    schema: "openai",
    stripPrefix: "/nim"
  },
  openai: {
    name: "OpenAI",
    target: "https://api.openai.com",
    pathPrefix: "/openai",
    schema: "openai",
    stripPrefix: "/openai"
  },
  anthropic: {
    name: "Anthropic",
    target: "https://api.anthropic.com",
    pathPrefix: "/anthropic",
    schema: "anthropic",
    stripPrefix: "/anthropic"
  }
};

export function detectProvider(path) {
  for (const [key, provider] of Object.entries(PROVIDERS)) {
    if (path.startsWith(provider.pathPrefix)) {
      return { key, ...provider };
    }
  }
  return null;
}
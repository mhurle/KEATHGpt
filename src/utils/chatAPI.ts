// src/utils/chatAPI.ts
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { config } from "./config";

function remapModel(model: string): string {
  // Remap internal names to valid API model IDs.
  if (model === "gpt o3 mini") {
    return "gpt-3.5-turbo";
  }
  return model;
}

export async function sendStreamChatMessage(
  model: string,
  messages: ChatCompletionRequestMessage[],
  onContent: (content: string, isFinal: boolean) => void
): Promise<void> {
  const modelConfig = config.modelConfigs[model];
  if (!modelConfig) {
    throw new Error("No configuration found for model: " + model);
  }
  const realModel = remapModel(model);
  switch (modelConfig.type) {
    case "openai":
    case "custom": {
      const client = new OpenAIApi(
        new Configuration({
          apiKey: modelConfig.apiKey,
          basePath: modelConfig.base || undefined
        })
      );
      try {
        const response = await client.createChatCompletion({
          model: realModel,
          messages,
          stream: false // Change to true if you later implement genuine streaming support.
        });
        const content = response.data.choices[0].message?.content || "";
        onContent(content, true);
      } catch (error: any) {
        throw error;
      }
      return;
    }
    case "anthropic": {
      throw new Error("Anthropic streaming integration not implemented yet – please provide the API documentation.");
    }
    case "deepseek": {
      throw new Error("Deepseek streaming integration not implemented yet – please provide the API documentation.");
    }
    default:
      throw new Error("Unsupported model type: " + modelConfig.type);
  }
}

export async function sendChatMessage(
  model: string,
  messages: ChatCompletionRequestMessage[]
): Promise<any> {
  const modelConfig = config.modelConfigs[model];
  if (!modelConfig) {
    throw new Error("No configuration found for model: " + model);
  }
  const realModel = remapModel(model);
  switch (modelConfig.type) {
    case "openai":
    case "custom": {
      const client = new OpenAIApi(
        new Configuration({
          apiKey: modelConfig.apiKey,
          basePath: modelConfig.base || undefined
        })
      );
      return client.createChatCompletion({
        model: realModel,
        messages,
        stream: false
      });
    }
    case "anthropic": {
      throw new Error("Anthropic integration not implemented yet – please provide the API documentation.");
    }
    case "deepseek": {
      throw new Error("Deepseek integration not implemented yet – please provide the API documentation.");
    }
    default:
      throw new Error("Unsupported model type: " + modelConfig.type);
  }
}
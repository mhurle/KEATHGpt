import { encode } from "gpt-token-utils";
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi
} from "openai";
import { OpenAIExt } from "openai-ext";
import { config } from "./config";

function getClient(apiKey: string, apiType: string, apiAuth: string, basePath: string) {
  const configuration = new Configuration({
    ...((apiType === "openai" || (apiType === "custom" && apiAuth === "bearer-token")) && {
      apiKey: apiKey
    }),
    ...(apiType === "custom" && { basePath: basePath })
  });
  return new OpenAIApi(configuration);
}

export async function createStreamChatCompletion(
  apiKey: string,
  messages: ChatCompletionRequestMessage[],
  chatId: string,
  messageId: string,
  modelOverride?: string
) {
  const model = modelOverride || config.defaultModel;
  return OpenAIExt.streamClientChatCompletion(
    {
      model,
      messages
    },
    {
      apiKey: apiKey,
      handler: {
        onContent(content, isFinal, stream) {
          setStreamContent(messageId, content, isFinal);
          if (isFinal) {
            setTotalTokens(chatId, content);
          }
        },
        onDone(stream) {},
        onError(error, stream) {
          console.error(error);
        }
      }
    }
  );
}

function setStreamContent(messageId: string, content: string, isFinal: boolean) {
  content = isFinal ? content : content + "█";
  // Update the message content in the database (assumes db.messages exists)
  // In your implementation, ensure you import and use your db accordingly.
}

function setTotalTokens(chatId: string, content: string) {
  let total_tokens = encode(content).length;
  // Update the chat totalTokens in the database.
}

export async function createChatCompletion(
  apiKey: string,
  messages: ChatCompletionRequestMessage[],
  modelOverride?: string
) {
  const model = modelOverride || config.defaultModel;
  const type = config.defaultType;
  const auth = config.defaultAuth;
  const base = config.defaultBase;
  const version = config.defaultVersion;

  const client = getClient(apiKey, type, auth, base);
  return client.createChatCompletion(
    {
      model,
      stream: false,
      messages
    },
    {
      headers: {
        "Content-Type": "application/json",
        ...(type === "custom" && auth === "api-key" && { "api-key": apiKey })
      },
      params: {
        ...(type === "custom" && { "api-version": version })
      }
    }
  );
}
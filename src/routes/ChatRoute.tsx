// src/routes/ChatRoute.tsx
import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import {
  Container,
  Stack,
  Box,
  Textarea,
  MediaQuery,
  Button,
  Flex,
  Card,
  SegmentedControl
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { nanoid } from "nanoid";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { useChatId } from "../hooks/useChatId";
import { config } from "../utils/config";
import { sendStreamChatMessage, sendChatMessage } from "../utils/chatAPI";

export function ChatRoute() {
  const chatId = useChatId();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [model, setModel] = useState(config.defaultModel);

  const messages = useLiveQuery(() => {
    if (!chatId) return [];
    return db.messages.where("chatId").equals(chatId).sortBy("createdAt");
  }, [chatId]);

  const chat = useLiveQuery(async () => {
    if (!chatId) return null;
    return db.chats.get(chatId);
  }, [chatId]);

  // Helper to update streamed message content in the database.
  function updateMessageContent(messageId: string, content: string, isFinal: boolean) {
    const newContent = isFinal ? content : content + "█";
    db.messages.update(messageId, { content: newContent });
  }

  // Fixed system message.
  const getSystemMessage = () =>
    "You are KEATHGPT – an internal company LLM interface.";

  const submit = async () => {
    if (submitting) return;
    if (!chatId) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "chatId is not defined. Please create a chat to get started."
      });
      return;
    }
    try {
      setSubmitting(true);

      // Add user message.
      await db.messages.add({
        id: nanoid(),
        chatId,
        content,
        role: "user",
        createdAt: new Date()
      });
      setContent("");

      const messageId = nanoid();
      // Add assistant placeholder.
      await db.messages.add({
        id: messageId,
        chatId,
        content: "█",
        role: "assistant",
        createdAt: new Date()
      });

      await sendStreamChatMessage(
        model,
        [
          { role: "system", content: getSystemMessage() },
          ...(messages ?? []).map((message) => ({
            role: message.role,
            content: message.content
          })),
          { role: "user", content }
        ],
        (streamContent, isFinal) => {
          updateMessageContent(messageId, streamContent, isFinal);
        }
      );

      // If this is a new chat, update the title.
      if (chat?.description === "New Chat") {
        const msgs = await db.messages.where({ chatId }).sortBy("createdAt");
        const createChatDescription = await sendChatMessage(model, [
          { role: "system", content: getSystemMessage() },
          ...(msgs ?? []).map((message) => ({
            role: message.role,
            content: message.content
          })),
          {
            role: "user",
            content:
              "Provide a short and relevant title for this chat. Answer with only the title."
          }
        ]);
        const chatDescription = createChatDescription.data.choices[0].message?.content;
        if (createChatDescription.data.usage) {
          await db.chats.where({ id: chatId }).modify((chat) => {
            chat.description = chatDescription ?? "New Chat";
            chat.totalTokens = (chat.totalTokens || 0) + createChatDescription.data.usage!.total_tokens;
          });
        }
      }
    } catch (error: any) {
      console.error("Chat submission error:", error);
      // Instead of assuming a network error, display the actual error message.
      const errMsg = error?.response?.data?.error?.message || error?.message || "An error occurred";
      notifications.show({
        title: "Error",
        color: "red",
        message: errMsg
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container pt="xl" pb={100}>
      <Stack spacing="xs">
        {messages?.map((message) => (
          <Card key={message.id} withBorder>
            <Box>
              <strong>{message.role === "user" ? "User: " : "Assistant: "}</strong>
              {message.content}
            </Box>
          </Card>
        ))}
      </Stack>

      {/* Display model selection (typically when starting a new chat) */}
      {messages && messages.length === 0 && (
        <Box my={40}>
          <SegmentedControl
            fullWidth
            value={model}
            size="md"
            data={[
              { label: "gpt4o", value: "gpt4o" },
              { label: "gpt o3 mini", value: "gpt o3 mini" },
              { label: "claude 3.5 sonnet", value: "claude 3.5 sonnet" },
              { label: "deepseek R1", value: "deepseek R1" }
            ]}
            onChange={(value) => setModel(value)}
          />
        </Box>
      )}

      {/* Chat input area fixed at the bottom */}
      <Box
        py="lg"
        sx={(theme) => ({
          position: "fixed",
          bottom: 0,
          // Adjust left position on larger screens to leave space for the Navbar.
          left: 0,
          right: 0,
          [`@media (min-width: ${theme.breakpoints.md})`]: { left: 300 },
          backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.white
        })}
      >
        <Container>
          <Flex gap="sm">
            <Textarea
              key={chatId}
              sx={{ flex: 1 }}
              placeholder="Your message here..."
              autosize
              autoFocus
              disabled={submitting}
              minRows={1}
              maxRows={5}
              value={content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setContent(e.currentTarget.value)
              }
              onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
                if (event.code === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Button onClick={submit}>Send</Button>
            </MediaQuery>
          </Flex>
        </Container>
      </Box>
    </Container>
  );
}
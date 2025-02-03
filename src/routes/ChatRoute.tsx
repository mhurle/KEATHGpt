import {
    Box,
    Button,
    Card,
    Container,
    Flex,
    MediaQuery,
    SegmentedControl,
    Skeleton,
    Stack,
    Textarea
  } from "@mantine/core";
  import { notifications } from "@mantine/notifications";
  import { useLiveQuery } from "dexie-react-hooks";
  import { nanoid } from "nanoid";
  import { KeyboardEvent, useState, ChangeEvent, useEffect } from "react";
  import { AiOutlineSend } from "react-icons/ai";
  import { MessageItem } from "../components/MessageItem";
  import { db } from "../db";
  import { useChatId } from "../hooks/useChatId";
  import { config } from "../utils/config";
  import {
    createChatCompletion,
    createStreamChatCompletion
  } from "../utils/openai";
  
  export function ChatRoute() {
    const chatId = useChatId();
    // Use the company API key from config
    const apiKey = config.defaultKey;
    const messages = useLiveQuery(() => {
      if (!chatId) return [];
      return db.messages.where("chatId").equals(chatId).sortBy("createdAt");
    }, [chatId]);
    const userMessages =
      messages
        ?.filter((message) => message.role === "user")
        .map((message) => message.content) || [];
    const [userMsgIndex, setUserMsgIndex] = useState(0);
    const [content, setContent] = useState("");
    const [contentDraft, setContentDraft] = useState("");
    const [submitting, setSubmitting] = useState(false);
  
    const chat = useLiveQuery(async () => {
      if (!chatId) return null;
      return db.chats.get(chatId);
    }, [chatId]);
  
    // Remove writingCharacter, writingTone, etc.
    // Define a fixed system message.
    const getSystemMessage = () =>
      "You are KEATHGPT – an internal company LLM interface.";
  
    // Model selection state (allowed models only)
    const [model, setModel] = useState(config.defaultModel);
  
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
      if (!apiKey) {
        notifications.show({
          title: "Error",
          color: "red",
          message: "Company API Key is not defined."
        });
        return;
      }
      try {
        setSubmitting(true);
        await db.messages.add({
          id: nanoid(),
          chatId,
          content,
          role: "user",
          createdAt: new Date()
        });
        setContent("");
  
        const messageId = nanoid();
        await db.messages.add({
          id: messageId,
          chatId,
          content: "█",
          role: "assistant",
          createdAt: new Date()
        });
  
        await createStreamChatCompletion(
          apiKey,
          [
            {
              role: "system",
              content: getSystemMessage()
            },
            ...(messages ?? []).map((message) => ({
              role: message.role,
              content: message.content
            })),
            { role: "user", content }
          ],
          chatId,
          messageId,
          model
        );
  
        setSubmitting(false);
  
        if (chat?.description === "New Chat") {
          const msgs = await db.messages.where({ chatId }).sortBy("createdAt");
          const createChatDescription = await createChatCompletion(
            apiKey,
            [
              {
                role: "system",
                content: getSystemMessage()
              },
              ...(msgs ?? []).map((message) => ({
                role: message.role,
                content: message.content
              })),
              {
                role: "user",
                content:
                  "Provide a short and relevant title for this chat. Answer with only the title."
              }
            ],
            model
          );
          const chatDescription = createChatDescription.data.choices[0].message?.content;
          if (createChatDescription.data.usage) {
            await db.chats.where({ id: chatId }).modify((chat) => {
              chat.description = chatDescription ?? "New Chat";
              if (chat.totalTokens) {
                chat.totalTokens += createChatDescription.data.usage!.total_tokens;
              } else {
                chat.totalTokens = createChatDescription.data.usage!.total_tokens;
              }
            });
          }
        }
      } catch (error: any) {
        if (error.toJSON().message === "Network Error") {
          notifications.show({
            title: "Error",
            color: "red",
            message: "No internet connection."
          });
        }
        const message = error.response?.data?.error?.message;
        if (message) {
          notifications.show({
            title: "Error",
            color: "red",
            message
          });
        }
      } finally {
        setSubmitting(false);
      }
    };
  
    const onUserMsgToggle = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      const { selectionStart, selectionEnd } = event.currentTarget;
      if (
        !["ArrowUp", "ArrowDown"].includes(event.code) ||
        selectionStart !== selectionEnd ||
        (event.code === "ArrowUp" && selectionStart !== 0) ||
        (event.code === "ArrowDown" &&
          selectionStart !== event.currentTarget.value.length)
      ) {
        return;
      }
      event.preventDefault();
      const newMsgIndex = userMsgIndex + (event.code === "ArrowUp" ? 1 : -1);
      const allMessages = [contentDraft, ...Array.from(userMessages).reverse()];
      if (newMsgIndex < 0 || newMsgIndex >= allMessages.length) return;
      setContent(allMessages.at(newMsgIndex) || "");
      setUserMsgIndex(newMsgIndex);
    };
  
    const onContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;
      setContent(value);
      setContentDraft(value);
      setUserMsgIndex(0);
    };
  
    if (!chatId) return null;
  
    return (
      <>
        <Container pt="xl" pb={100}>
          <Stack spacing="xs">
            {messages?.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
          </Stack>
          {submitting && (
            <Card withBorder mt="xs">
              <Skeleton height={8} radius="xl" />
              <Skeleton height={8} mt={6} radius="xl" />
              <Skeleton height={8} mt={6} radius="xl" />
              <Skeleton height={8} mt={6} radius="xl" />
              <Skeleton height={8} mt={6} width="70%" radius="xl" />
            </Card>
          )}
        </Container>
        <Box
          py="lg"
          sx={(theme) => ({
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            [`@media (min-width: ${theme.breakpoints.md})`]: { left: 300 },
            backgroundColor:
              theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.white
          })}
        >
          {messages?.length === 0 && (
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
                onChange={onContentChange}
                onKeyDown={(event) => {
                  if (event.code === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submit();
                    setUserMsgIndex(0);
                  }
                  if (event.code === "ArrowUp") onUserMsgToggle(event);
                  if (event.code === "ArrowDown") onUserMsgToggle(event);
                }}
              />
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Button onClick={submit}>
                  <AiOutlineSend />
                </Button>
              </MediaQuery>
            </Flex>
          </Container>
        </Box>
      </>
    );
  }
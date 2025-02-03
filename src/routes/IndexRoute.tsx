import {
    Badge,
    Button,
    Center,
    Container,
    Group,
    SimpleGrid,
    Text,
    ThemeIcon
  } from "@mantine/core";
  import {
    IconCloudDownload,
    IconCurrencyDollar,
    IconLock,
    IconNorthStar
  } from "@tabler/icons-react";
  import { useLiveQuery } from "dexie-react-hooks";
  import { LogoText } from "../components/Logo";
  import { db } from "../db";
  import { config } from "../utils/config";
  
  export function IndexRoute() {
    return (
      <Center py="xl" sx={{ height: "100%" }}>
        <Container size="sm">
          <Badge mb="lg">Internal LLM Interface</Badge>
          <Text>
            <LogoText style={{ maxWidth: 240 }} />
          </Text>
          <Text mt={4} size="xl">
            Not just another LLM interface!
          </Text>
          <SimpleGrid
            mt={50}
            cols={3}
            spacing={30}
            breakpoints={[{ maxWidth: "md", cols: 1 }]}
          >
            {features.map((feature) => (
              <div key={feature.title}>
                <ThemeIcon variant="outline" size={50} radius={50}>
                  <feature.icon size={26} stroke={1.5} />
                </ThemeIcon>
                <Text mt="sm" mb={7}>
                  {feature.title}
                </Text>
                <Text size="sm" color="dimmed" sx={{ lineHeight: 1.6 }}>
                  {feature.description}
                </Text>
              </div>
            ))}
          </SimpleGrid>
          {/* For an internal tool, any download or external links have been removed */}
        </Container>
      </Center>
    );
  }
  
  const features = [
    {
      icon: IconCurrencyDollar,
      title: "Free and Open Source",
      description: "This tool is provided free and its source code is maintained internally."
    },
    {
      icon: IconLock,
      title: "Privacy Focused",
      description: "No tracking, no cookies – all data is stored locally."
    },
    {
      icon: IconNorthStar,
      title: "Best Experience",
      description: "Crafted with care to provide an optimised user interface."
    }
  ];
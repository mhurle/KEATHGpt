import {
    ColorScheme,
    ColorSchemeProvider,
    MantineProvider
  } from "@mantine/core";
  import { useHotkeys, useLocalStorage } from "@mantine/hooks";
  import { Notifications } from "@mantine/notifications";
  import {
    createHashHistory,
    ReactLocation,
    Router
  } from "@tanstack/react-location";
  import { ChatRoute } from "../routes/ChatRoute";
  import { IndexRoute } from "../routes/IndexRoute";
  import { Layout } from "./Layout";
  
  const history = createHashHistory();
  const location = new ReactLocation({ history });
  
  export function App() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
      key: "mantine-color-scheme",
      defaultValue: prefersDark ? "dark" : "light",
      getInitialValueInEffect: true
    });
  
    const toggleColorScheme = (value?: ColorScheme) =>
      setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  
    useHotkeys([["mod+J", () => toggleColorScheme()]]);
  
    return (
      <Router
        location={location}
        routes={[
          { path: "/", element: <IndexRoute /> },
          { path: "/chats/:chatId", element: <ChatRoute /> }
        ]}
      >
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            withCSSVariables
            theme={{
              colorScheme,
              primaryColor: "orange",
              globalStyles: (theme) => ({
                body: {
                  backgroundColor:
                    theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white
                }
              })
            }}
          >
            <Layout />
            <Notifications />
          </MantineProvider>
        </ColorSchemeProvider>
      </Router>
    );
  }
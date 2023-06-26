import { Cloudinary } from "@cloudinary/url-gen";
import { StatusBar } from "expo-status-bar";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { View, useColorScheme } from "react-native";
import axios from "axios";

import {
  Button,
  PaperProvider,
  TextInput,
  Switch,
  Card,
} from "react-native-paper";
import {
  MD3LightTheme,
  MD3DarkTheme,
  Searchbar,
  ActivityIndicator,
} from "react-native-paper";
import { useMemo, useState } from "react";
import { HfInference } from "@huggingface/inference";

export default function App() {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();
  const [prompt, setPrompt] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(
    "https://images.pexels.com/photos/6152103/pexels-photo-6152103.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  );

  const paperTheme = useMemo(
    () =>
      isDarkMode
        ? { ...MD3DarkTheme, colors: theme.dark }
        : { ...MD3LightTheme, colors: theme.light },
    [isDarkMode, theme]
  );

  const cld = new Cloudinary({
    cloud: {
      cloudName: "dqwkje1he",
      apiKey: "411695687488237",
      apiSecret: "bwATqLKS4kaSt7RceLnlmk1vG-M",
    },
  });
  const hf = new HfInference("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");

  //// CLOUDINARY UPLOAD
  const uploadToCloudinary = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", "uploadtoCloudinary");
    let data = "";
    await axios
      .post(
        `https://api.cloudinary.com/v1_1/${
          cld.getConfig().cloud.cloudName
        }/image/upload`,
        formData
      )
      .then((res, err) => {
        try {
          data = res.data["secure_url"];
        } catch {
          console.error(err);
        }
      });
    // console.log(data);
    return data;
  };

  const render = async () => {
    console.log("render started");
    if (prompt === "") alert("enter a propmt please");
    else {
      let response = await hf
        .textToImage({
          model: "prompthero/openjourney-v4",
          inputs: prompt,
          parameters: {
            width: 512,
            height: 512,
            negative_prompt:
              "worst quality, low quality, anime, cartoon, mutilated, out of frame, extra fingers, mutated hands, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, bad face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, deformed tongue, children preteen kids jpeg artifacts, text, dark skin, nsfw, nude, naked",
          },
        })
        .then(async (blob) => {
          try {
            const cloudinaryURL = await uploadToCloudinary(blob);
            // console.log(cloudinaryURL);
            return cloudinaryURL;
          } catch (error) {
            console.error(error);
          }
          // const image = new Image();
          // image.src = URL.createObjectURL(blob);
        });
      setUrl(response);
      setLoading(false);
    }
    console.log("render ended");
  };

  return (
    <PaperProvider theme={paperTheme}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: paperTheme.colors.background,
        }}
      >
        <Switch
          value={isDarkMode}
          onValueChange={(value) => {
            setIsDarkMode(value);
          }}
          color={paperTheme.colors.primary}
        />

        <Card style={{ width: "90%", alignContent: "center" }}>
          <Card.Cover
            style={{ width: "95%", alignSelf: "center" }}
            source={{ uri: url }}
          />
          <Card.Actions style={{ display: "flex", flexDirection: "column" }}>
            <TextInput
              style={{ width: "95%", color: paperTheme.colors.primary }}
              placeholder="Prompt"
              value={prompt}
              onChangeText={(prompt) => setPrompt(prompt)}
            />
            <Button
              style={{
                width: "95%",
              }}
              mode="contained"
              onPress={() => {
                render();
              }}
            >
              Generate Image
            </Button>
          </Card.Actions>
        </Card>

        <StatusBar style={{ backgroundColor: paperTheme.colors.background }} />
      </View>
    </PaperProvider>
  );
}

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    breakpoints: {
      iphoneSE: "667px",
    },
  },
});

export default createSystem(defaultConfig, config);

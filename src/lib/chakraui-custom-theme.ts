import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    breakpoints: {
      iphoneSE: "667px",
    },
    tokens: {
      fonts: {
        heading: { value: "Noto Sans JP, sans-serif" },
        body: { value: "Noto Sans JP, sans-serif" },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          muted: {
            value: { _light: "{colors.blue.100}", _dark: "{colors.blue.950}" },
          },
          panel: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.blue.800}" },
          },
          card: {
            value: { _light: "{colors.white}", _dark: "#0a2240" },
          },
        },
        fg: {
          default: {
            value: { _light: "{colors.gray.900}", _dark: "{colors.gray.100}" },
          },
          muted: {
            value: { _light: "{colors.gray.600}", _dark: "{colors.gray.300}" },
          },
        },
      },
    },
    recipes: {
      input: {
        variants: {
          variant: {
            outline: {
              bg: { _light: "white", _dark: "#0f2d52" },
              borderColor: { _light: "gray.300", _dark: "gray.600" },
              color: { _light: "gray.900", _dark: "gray.100" },
              _placeholder: {
                color: { _light: "gray.400", _dark: "blue.300" },
              },
              _focus: {
                borderColor: { _light: "blue.500", _dark: "blue.700" },
                boxShadow: {
                  _light: "0 0 0 1px var(--chakra-colors-blue-500)",
                  _dark: "0 0 0 1px var(--chakra-colors-blue-700)",
                },
              },
            },
          },
        },
      },
      textarea: {
        variants: {
          variant: {
            outline: {
              bg: { _light: "white", _dark: "#0f2d52" },
              borderColor: { _light: "gray.300", _dark: "gray.600" },
              color: { _light: "gray.900", _dark: "gray.100" },
              _placeholder: {
                color: { _light: "gray.400", _dark: "blue.300" },
              },
              _focus: {
                borderColor: { _light: "blue.500", _dark: "blue.700" },
                boxShadow: {
                  _light: "0 0 0 1px var(--chakra-colors-blue-500)",
                  _dark: "0 0 0 1px var(--chakra-colors-blue-700)",
                },
              },
            },
          },
        },
      },
      separator: {
        base: {
          borderColor: { _light: "gray.300", _dark: "gray.700" },
        },
      },
    },
    slotRecipes: {
      combobox: {
        slots: [
          "root",
          "label",
          "control",
          "input",
          "trigger",
          "indicator",
          "clearTrigger",
          "content",
          "itemGroup",
          "itemGroupLabel",
          "item",
          "itemText",
          "itemIndicator",
        ],
        variants: {
          variant: {
            outline: {
              input: {
                bg: { _light: "white", _dark: "#0f2d52" },
                borderColor: {
                  _light: "gray.300",
                  _dark: "gray.600",
                },
                color: {
                  _light: "gray.900",
                  _dark: "gray.100",
                },
                _focus: {
                  borderColor: {
                    _light: "blue.500",
                    _dark: "blue.700",
                  },
                  boxShadow: {
                    _light: "0 0 0 1px var(--chakra-colors-blue-500)",
                    _dark: "0 0 0 1px var(--chakra-colors-blue-700)",
                  },
                },
                _placeholder: {
                  color: {
                    _light: "gray.400",
                    _dark: "blue.300",
                  },
                },
              },
              content: {
                bg: { _light: "white", _dark: "blue.900" },
                borderColor: {
                  _light: "blue.200",
                  _dark: "blue.700",
                },
              },
              item: {
                color: {
                  _light: "gray.800",
                  _dark: "gray.100",
                },
                _hover: {
                  bg: {
                    _light: "blue.50",
                    _dark: "blue.800",
                  },
                },
                _highlighted: {
                  bg: {
                    _light: "blue.50",
                    _dark: "blue.800",
                  },
                },
                _selected: {
                  bg: {
                    _light: "blue.100",
                    _dark: "blue.800",
                  },
                },
              },
            },
          },
        },
      },
      select: {
        slots: [
          "root",
          "label",
          "control",
          "trigger",
          "indicator",
          "clearTrigger",
          "content",
          "itemGroup",
          "itemGroupLabel",
          "item",
          "itemText",
          "itemIndicator",
          "valueText",
        ],
        variants: {
          variant: {
            outline: {
              trigger: {
                bg: { _light: "white", _dark: "#0f2d52" },
                borderColor: {
                  _light: "gray.300",
                  _dark: "gray.600",
                },
                color: {
                  _light: "gray.900",
                  _dark: "gray.100",
                },
                _focus: {
                  borderColor: {
                    _light: "blue.500",
                    _dark: "blue.700",
                  },
                },
              },
              content: {
                bg: { _light: "white", _dark: "#0f2d52" },
                borderColor: {
                  _light: "blue.200",
                  _dark: "blue.700",
                },
              },
              item: {
                color: {
                  _light: "gray.800",
                  _dark: "gray.100",
                },
                _hover: {
                  bg: {
                    _light: "blue.50",
                    _dark: "blue.800",
                  },
                },
                _highlighted: {
                  bg: {
                    _light: "blue.50",
                    _dark: "blue.800",
                  },
                },
                _selected: {
                  bg: {
                    _light: "blue.100",
                    _dark: "blue.700",
                  },
                  color: {
                    _light: "blue.900",
                    _dark: "blue.50",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default createSystem(defaultConfig, config);

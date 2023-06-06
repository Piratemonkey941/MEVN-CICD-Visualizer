import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      quasar(),
    ],
    optimizeDeps: {
      exclude: ['vue-demi']
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/quasar-variables.sass";`,
        },
      },
    },
  };
});

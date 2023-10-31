
import dtsPlugin from "vite-plugin-dts";
import { defineConfig } from "vite";
import { join } from "path";

export default defineConfig({
    plugins: [ dtsPlugin({ rollupTypes: true }) ],
    build: {
        minify: false,
        target: "ESNext",
        rollupOptions: {
            external: [ "vite", "@babel/core", "@babel/types" ],
        },
        lib: {
            entry: join(__dirname, "src/index.ts"),
            formats: [ "cjs" ],
            fileName: "index"
        }
    }
});
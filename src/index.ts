
import { transformAsync, TransformOptions } from "@babel/core";
import { BABEL_PLUGIN } from "./babel";
import { Plugin } from "vite";

/** Configurazione di babel */
const BABEL_CONFIG: TransformOptions = { plugins: [ BABEL_PLUGIN ] };

/** Wrappa in una factory ogni file javascript */
const FACTORY_PLUGIN: Plugin = {
    name: "vite-plugin-factory",
    enforce: "post",
    
    async generateBundle(_, bundle) {
        for (const file of Object.values(bundle))
            if (file.type === "chunk")
                file.code = await transformFile(file.code);
    }
};

/** Trasforma un singolo file */
async function transformFile(code: string) {
    const res = await transformAsync(code, BABEL_CONFIG);
    return res!.code!.replace(/;\s*$/, ""); // Rimuove il punto e virgola che mette babel
}

export default FACTORY_PLUGIN;

import { PluginObj } from "@babel/core";

import {
    arrowFunctionExpression,
    assignmentExpression,
    blockStatement,
    expressionStatement,
    identifier,
    memberExpression,
    objectExpression,
    objectPattern,
    objectProperty,
    stringLiteral,
    variableDeclaration,
    variableDeclarator,

    isImportDefaultSpecifier,
    isImportNamespaceSpecifier,

    ExportSpecifier,
    Identifier,
    ImportSpecifier,
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ObjectProperty
} from "@babel/types";

const DEFAULT_INSTRUCTION = "default", CONST_INSTRUCTION = "const", ASSIGN_INSTRUCTION = "=";

/** Parametro della funzione factory */
export const STDLIB_VARIABLE = "__STDLIB";

/** Ingloba un file in una funzione factory */
export const BABEL_PLUGIN: PluginObj = {
    visitor: {
        /** Mette intorno al programma una lambda che prende {@link STDLIB_VARIABLE} come parametro */
        Program(path) {
            const { node, node: { body, directives } } = path;
            const arg = identifier(STDLIB_VARIABLE);
            const lambda = arrowFunctionExpression([ arg ], blockStatement(body, directives));
            const stmt = expressionStatement(lambda);
            node.directives.length = 0; // Toglie dal file le direttive (Tipo "use strict") perchè ci deve essere solo una espressione
            node.body = [ stmt ];       // Non rimpiazza il nodo intero per non farci passare nuovamente il visitor
        },

        /** Trasforma gli `import` in accessi a proprietà di {@link STDLIB_VARIABLE} */
        ImportDeclaration(path) {
            const { specifiers, source } = path.node;
            const target = getLValFromSpecifier(specifiers);
            if (!target) return path.remove(); // Gli "import" che eseguono e basta non sono possibili
            const lib = identifier(STDLIB_VARIABLE);
            const module = memberExpression(lib, source, true);
            const init = variableDeclarator(target, module);
            const declaration = variableDeclaration(CONST_INSTRUCTION, [ init ]);
            path.replaceWith(declaration);
        },

        /** Trasforma gli `export` in assegnazioni a proprietà di {@link STDLIB_VARIABLE} */
        ExportNamedDeclaration(path) {
            const lib = identifier(STDLIB_VARIABLE);
            const module = stringLiteral(process.env.npm_package_name);
            const target = memberExpression(lib, module, true);
            const exports = path.node.specifiers as ExportSpecifier[];
            const props = exports.map(x => objectProperty(x.exported, x.local, undefined, (x.exported as Identifier).name === x.local.name));
            const obj = objectExpression(props);
            const assign = assignmentExpression(ASSIGN_INSTRUCTION, target, obj);
            path.replaceWith(assign);
        }
    }
};

/**
 * Capisce il tipo di variabile da dichiarare partendo da una lista di cose importate da un'istruzione
 * @param specifier Lista di dichiarazioni effettuate dall'importazione
 */
function getLValFromSpecifier(specifier: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[]) {
    var target: ObjectProperty[] | undefined;
    for (const elm of specifier)
        if (isImportNamespaceSpecifier(elm))
            return elm.local;
        else if (isImportDefaultSpecifier(elm))
            (target ??= []).push(objectProperty(identifier(DEFAULT_INSTRUCTION), elm.local));
        else
            (target ??= []).push(objectProperty(elm.imported, elm.local, undefined, (elm.imported as Identifier).name === elm.local.name));
    return target && objectPattern(target!);
}

/** Definisce la variabile d'ambiente che su node comunica il nome del pacchetto corrente */
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            npm_package_name: string;
        }
    }
}
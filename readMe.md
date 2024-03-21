
# vite-plugin-factory
Wraps the content of a file in a factory function

## Usage
The plugin is a raw object
```ts
import factoryPlugin from "vite-plugin-factory";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [ factoryPlugin ]
    // ...
});
```

## Result
The factory takes one function named `__import` that will be responsible for resolving other imports.
For example this:
```ts
import { $TRACK } from "solid-js"; // (Random example)

export const UNDEFINED = console.log($TRACK);

export default UNDEFINED;
```
Becomes this:
```js
export default (async __import => {
  const {
    $TRACK
  } = await __import("solid-js");
  const UNDEFINED = console.log($TRACK);
  return {
    UNDEFINED,
    default: UNDEFINED
  };
});
```

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
The factory takes one parameter named `__STDLIB` in which your exports will be inserted under the name of your package, and from which your imports will be unpacked.
For example this:
```ts
import { $TRACK } from "solid-js"; // (Random example)

export const UNDEFINED = console.log($TRACK);

export default UNDEFINED;
```
Becomes this:
```js
__STDLIB => {
  const {
    $TRACK
  } = __STDLIB["solid-js"];
  const UNDEFINED = console.log($TRACK);
  __STDLIB["3"] = {
    UNDEFINED,
    default: UNDEFINED
  };
}
```
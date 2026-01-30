Plugin API
The plugin API enables developers to share extensions to Puck.

Plugins can display dedicated UI in the Plugin Rail on the left-hand side of the screen (bottom on mobile), configure their own overrides, or apply field transforms.

Official plugins
Core plugins
These plugins are included in the core package:

blocks: show the component drawer for dragging components onto the canvas
fields: render the fields for the currently selected component
outline: display an outline of the current page structure
legacy-side-bar: disable the plugin rail in favor of stacked “Components” / “Outline” sections
Enhancements
Puck provides official plugins that can be installed for common use-cases:

ai: Use AI to generate pages using your own components.
emotion-cache: Inject emotion cache into the Puck iframe.
heading-analyzer: Analyze the heading outline of your page and be warned when you’re not respecting WCAG 2 accessibility standards.
Please see the awesome-puck repo for a full list of community plugins.

Loading a Plugin
To load a plugin, provide it to the plugins prop on the <Puck> component.

import { Puck } from "@puckeditor/core";
import myPlugin from "my-puck-plugin";
 
export function Editor() {
  return (
    <Puck
      // ...
      plugins={[myPlugin]}
    />
  );
}
Developing a Plugin
If you’re familiar with Puck, you can likely already build a Puck plugin. See the Plugin API reference for a full breakdown of available APIs.

Rendering UI in the Plugin Rail
Plugins can render dedicated UI in a panel shown by the Plugin Rail. To add a plugin to the rail, create a new plugin and provide some parameters:

import { Coffee } from "lucide-react";
 
const myPlugin = {
  name: "my-plugin", // Globally unique name
  label: "My Plugin", // Human-readable name shown in the rail
  icon: <Coffee />, // Icon shown in the rail (use lucide to match Puck)
  render: () => <div>My plugin UI</div>, // Component rendered in plugin panel
};
You can leverage the internal Puck API to integrate Puck behavior with your plugin:

import { Coffee } from "lucide-react";
import { createUsePuck } from "@puckeditor/core";
 
const usePuck = createUsePuck();
 
const myPlugin = {
  name: "my-plugin",
  label: "My Plugin",
  icon: <Coffee />,
  render: () => {
    const type = usePuck((s) => s.selectedItem?.type || "Nothing");
 
    return <h2>{type} selected</h2>;
  },
};
Transforming fields
Plugins support Field Transforms, enabling you to modify prop data before it’s rendered in the <Puck> preview.

const plugin = {
  fieldTransforms: {
    // Make all props powered by "text" field pink in the canvas
    text: ({ value }) => <span style={{ color: "hotpink" }}>{value}</span>,
  },
};
Overriding the UI
Plugins support UI Overrides, enabling you to override discrete section of the Puck interface.

const plugin = {
  overrides: {
    // Make all drawer items pink
    drawerItem: ({ name }) => <div style={{ color: "hotpink" }}>{name}</div>,
  },
};
Override currying
Plugin overrides are rendered in the order they are defined. Unless otherwise specified, all overrides are curried, meaning that the return node of one plugin will be passed as children to the next plugin.

This may result in some incompatible plugin combinations. To improve your chance of building a widely compatible plugin, consider:

Implementing as few override methods as you need
Always rendering children if possible
Introducing new field types
Both the field transforms and overrides let you introduce entirely new field types. Plugins can combine this functionality to bundle up new field behavior in a convenient package.

This example uses Overlay Portals to create an interactive rich text field that can modified directly in the editor preview.

import { registerOverlayPortal } from "@puckeditor/core";
 
const plugin = {
  overrides: {
    // Add a richText field type
    fieldTypes: {
      richText: ({ name, value }) => <input name={name} value={value} />,
    },
  },
  fieldTransforms: {
    // Wrap the value in a span, create an overlay portal, and make it editable
    richText: ({ value }) => {
      const handleInput = useCallback(() => {}, []); // Implement your input behavior
 
      return (
        <span ref={registerOverlayPortal} contentEditable onInput={handleInput}>
          {value}
        </span>
      );
    },
  },
};

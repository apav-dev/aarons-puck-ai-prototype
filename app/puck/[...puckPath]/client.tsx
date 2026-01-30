"use client";

import { Data, Puck } from "@puckeditor/core";
import config from "../../../puck.config";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import headingAnalyzer from "@puckeditor/plugin-heading-analyzer";
import "@puckeditor/plugin-ai/styles.css";
import "@puckeditor/plugin-heading-analyzer/dist/index.css";
import themePlugin from "../../../theme-plugin/ThemePlugin";

const aiPlugin = createAiPlugin();

export function Client({ path, data }: { path: string; data: Partial<Data> }) {
  return (
    <Puck
      config={config}
      data={data}
      plugins={[aiPlugin, headingAnalyzer, themePlugin]}
      onPublish={async (data) => {
        await fetch("/puck/api", {
          method: "post",
          body: JSON.stringify({ data, path }),
        });
      }}
    />
  );
}

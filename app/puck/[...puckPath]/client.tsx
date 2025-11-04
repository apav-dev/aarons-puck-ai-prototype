"use client";

import type { Data } from "@measured/puck";
import { Puck } from "@measured/puck";
import config from "../../../puck.config";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import "@puckeditor/plugin-ai/styles.css";

const aiPlugin = createAiPlugin();

export function Client({ path, data }: { path: string; data: Partial<Data> }) {
  return (
    <Puck
      config={config}
      data={data}
      plugins={[aiPlugin]}
      onPublish={async (data) => {
        await fetch("/puck/api", {
          method: "post",
          body: JSON.stringify({ data, path }),
        });
      }}
    />
  );
}

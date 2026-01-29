"use client";

import { Data, Render } from "@puckeditor/core";
import config from "../../puck.config";

export function Client({ data }: { data: Data }) {
  return <Render config={config} data={data} />;
}

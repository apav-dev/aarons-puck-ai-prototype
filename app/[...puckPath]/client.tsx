"use client";

import { Data, Render } from "@puckeditor/core";
import config from "../../puck.config";

export function Client({
  data,
  metadata,
}: {
  data: Data;
  metadata?: Record<string, unknown>;
}) {
  return <Render config={config} data={data} metadata={metadata} />;
}

import React from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import { Section } from "../../components/Section";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("DirectorySection", styles);

type DirectoryLocation = {
  name: string;
  address: {
    region: string;
    city: string;
    line1: string;
  };
};

export type DirectorySectionProps = {
  title: string;
  description: string;
  emptyMessage: string;
};

export const DirectorySection: PuckComponent<DirectorySectionProps> = ({
  title,
  description,
  emptyMessage,
  puck,
}) => {
  const metadata = (puck?.metadata ?? {}) as {
    city?: { city?: string; region?: string };
    locations?: DirectoryLocation[];
  };
  const locations = metadata.locations ?? [];
  const cityLabel = metadata.city?.city || "";
  const heading = title?.trim() || cityLabel || "Directory";

  return (
    <Section className={getClassName()}>
      <div className={getClassName("header")}>
        <h2 className={getClassName("title")}>{heading}</h2>
        {description && (
          <p className={getClassName("description")}>{description}</p>
        )}
      </div>
      {locations.length === 0 ? (
        <div className={getClassName("empty")}>{emptyMessage}</div>
      ) : (
        <div className={getClassName("grid")}>
          {locations.map((location, index) => (
            <article key={`${location.name}-${index}`} className={getClassName("card")}>
              <h3 className={getClassName("cardTitle")}>{location.name}</h3>
              <div className={getClassName("cardBody")}>
                <div>{location.address.line1}</div>
                <div>
                  {location.address.city} {location.address.region}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
};

export const DirectorySectionConfig: ComponentConfig<DirectorySectionProps> = {
  label: "Directory",
  fields: {
    title: {
      type: "text",
      label: "Title",
    },
    description: {
      type: "textarea",
      label: "Description",
    },
    emptyMessage: {
      type: "text",
      label: "Empty message",
    },
  },
  defaultProps: {
    title: "",
    description: "",
    emptyMessage: "No locations are available for this city yet.",
  },
  render: DirectorySection,
};

export default DirectorySection;

/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@measured/puck";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@measured/puck";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("CoreInfoSection", styles);

export type CoreInfoSectionProps = {
  information: {
    address: string;
    directionsLink: string;
    phone: string;
    tollFree?: string;
    email: string;
  };
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    specialNote?: string;
  };
  services: Array<string | { value: string }>;
  padding: string;
};

export const CoreInfoSection: PuckComponent<CoreInfoSectionProps> = ({
  information,
  hours,
  services,
  padding,
  puck,
}) => {
  return (
    <Section
      className={getClassName()}
      style={{ paddingTop: padding, paddingBottom: padding }}
    >
      <div className={getClassName("inner")}>
        <div className={getClassName("column")}>
          <h2 className={getClassName("heading")}>Information</h2>
          <div className={getClassName("address")}>{information.address}</div>
          <a
            href={information.directionsLink}
            className={getClassName("link")}
            tabIndex={puck.isEditing ? -1 : undefined}
          >
            Get Directions &gt;
          </a>
          <div className={getClassName("contactItem")}>
            <svg
              className={getClassName("icon")}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Phone {information.phone}</span>
          </div>
          {information.tollFree && (
            <div className={getClassName("contactItem")}>
              <svg
                className={getClassName("icon")}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Toll-free {information.tollFree}</span>
            </div>
          )}
          <div className={getClassName("contactItem")}>
            <svg
              className={getClassName("icon")}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <a
              href={`mailto:${information.email}`}
              className={getClassName("link")}
              tabIndex={puck.isEditing ? -1 : undefined}
            >
              {information.email}
            </a>
          </div>
        </div>

        <div className={getClassName("column")}>
          <h2 className={getClassName("heading")}>Hours</h2>
          <div className={getClassName("hoursList")}>
            <div className={getClassName("hoursItem")}>
              <span className={getClassName("day")}>Monday:</span>
              <span>{hours.monday}</span>
            </div>
            <div className={getClassName("hoursItem")}>
              <span className={getClassName("day")}>Tuesday:</span>
              <span>{hours.tuesday}</span>
            </div>
            <div className={getClassName("hoursItem")}>
              <span className={getClassName("day")}>Wednesday:</span>
              <span>{hours.wednesday}</span>
            </div>
            <div className={getClassName("hoursItem")}>
              <span className={getClassName("day")}>Thursday:</span>
              <span>{hours.thursday}</span>
            </div>
            <div className={getClassName("hoursItem")}>
              <span className={getClassName("day")}>Friday:</span>
              <span>{hours.friday}</span>
            </div>
            <div className={getClassName("hoursItem")}>
              <span className={getClassName("day")}>Saturday:</span>
              <span>{hours.saturday}</span>
            </div>
            <div className={getClassName("hoursItem")}>
              <span className={getClassName("day")}>Sunday:</span>
              <span>{hours.sunday}</span>
            </div>
          </div>
          {hours.specialNote && (
            <div className={getClassName("specialNote")}>{hours.specialNote}</div>
          )}
        </div>

        <div className={getClassName("column")}>
          <h2 className={getClassName("heading")}>Services</h2>
          <ul className={getClassName("servicesList")}>
            {services.map((service, index) => (
              <li key={index} className={getClassName("serviceItem")}>
                {typeof service === "string" ? service : service.value || ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
};

export const CoreInfoSectionConfig: ComponentConfig<CoreInfoSectionProps> = {
  fields: {
    information: {
      type: "object",
      label: "Information",
      objectFields: {
        address: { type: "textarea", label: "Address" },
        directionsLink: { type: "text", label: "Directions Link" },
        phone: { type: "text", label: "Phone" },
        tollFree: { type: "text", label: "Toll-free (optional)" },
        email: { type: "text", label: "Email" },
      },
    },
    hours: {
      type: "object",
      label: "Hours",
      objectFields: {
        monday: { type: "text", label: "Monday" },
        tuesday: { type: "text", label: "Tuesday" },
        wednesday: { type: "text", label: "Wednesday" },
        thursday: { type: "text", label: "Thursday" },
        friday: { type: "text", label: "Friday" },
        saturday: { type: "text", label: "Saturday" },
        sunday: { type: "text", label: "Sunday" },
        specialNote: { type: "text", label: "Special Note (optional)" },
      },
    },
    services: {
      type: "array",
      label: "Services",
      getItemSummary: (item) => (typeof item === "string" ? item : item?.value) || "Service",
      arrayFields: {
        value: { type: "text", label: "Service" },
      },
      defaultItemProps: {
        value: "",
      },
    },
    padding: {
      type: "text",
      label: "Padding",
    },
  },
  defaultProps: {
    information: {
      address: "2145 Pennsylvania Avenue West, Suite 998, Washington, DC 20002",
      directionsLink: "#",
      phone: "(339) 291-5039",
      tollFree: "(800) 291-5039",
      email: "email@gmail.com",
    },
    hours: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "9:00 AM - 5:00 PM",
      wednesday: "9:00 AM - 5:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 5:00 PM",
      saturday: "Closed",
      sunday: "Closed",
      specialNote: "No pickup on Christmas Eve.",
    },
    services: [
      { value: "Augue interdum velit euismod" },
      { value: "Euismod lacinia at quis" },
      { value: "Viverra ipsum nunc aliquet bib" },
      { value: "Ultrices dui sapien" },
      { value: "Deserunt mollit anim id est" },
    ],
    padding: "64px",
  },
  render: CoreInfoSection,
};

export default CoreInfoSection;


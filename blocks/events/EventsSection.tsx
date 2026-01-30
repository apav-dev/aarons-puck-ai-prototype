/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@puckeditor/core";
import { Section } from "../../components/Section/index";
import { PuckComponent } from "@puckeditor/core";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("EventsSection", styles);

export type EventItem = {
  imageUrl: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventDescription: string;
  learnMoreLink: string;
  learnMoreText: string;
};

export type EventsSectionProps = {
  title: string;
  events: EventItem[];
};

export const EventsSection: PuckComponent<EventsSectionProps> = ({
  title,
  events,
  puck,
}) => {
  return (
    <Section className={getClassName()}>
      <div className={getClassName("inner")}>
        <h2 className={getClassName("title")}>{title}</h2>
        <div className={getClassName("eventsList")}>
          {events.map((event, index) => (
            <article
              key={index}
              className={getClassName("eventCard")}
              itemScope
              itemType="https://schema.org/Event"
            >
              <div className={getClassName("imageWrapper")}>
                <img
                  src={event.imageUrl}
                  alt={event.eventTitle}
                  className={getClassName("image")}
                  itemProp="image"
                />
              </div>
              <div className={getClassName("eventContent")}>
                <h3 className={getClassName("eventTitle")} itemProp="name">
                  {event.eventTitle}
                </h3>
                <div className={getClassName("eventDateTime")}>
                  <time itemProp="startDate" dateTime={event.eventDate}>
                    {event.eventDate}
                  </time>
                  <span className={getClassName("separator")}>|</span>
                  <span itemProp="startTime">{event.eventTime}</span>
                </div>
                <p
                  className={getClassName("eventDescription")}
                  itemProp="description"
                >
                  {event.eventDescription}
                </p>
                <a
                  href={event.learnMoreLink}
                  className={getClassName("learnMoreLink")}
                  tabIndex={puck.isEditing ? -1 : undefined}
                  itemProp="url"
                >
                  {event.learnMoreText}
                  <svg
                    className={getClassName("arrowIcon")}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
};

export const EventsSectionConfig: ComponentConfig<EventsSectionProps> = {
  fields: {
    title: {
      type: "text",
      label: "Title",
      ai: {
        instructions:
          "The main heading for the events section. For brick-and-mortar location landing pages, use SEO-friendly titles like 'Upcoming Events at [Business Name]' or 'Events & Activities at [Location]'. Include the business name and location when available to improve local SEO.",
      },
    },
    events: {
      type: "array",
      label: "Events",
      min: 1,
      getItemSummary: (item) => item.eventTitle || "Event",
      arrayFields: {
        imageUrl: {
          type: "text",
          label: "Image URL",
          ai: {
            instructions:
              "Always use an image URL provided by the getImage tool. Use the business name as the brand, 'EventsSection' as the component, and the event title as additional context. Images should be relevant to the event type and location.",
            stream: false,
          },
        },
        eventTitle: {
          type: "text",
          label: "Event Title",
          ai: {
            instructions:
              "Create SEO-optimized event titles that include the event name, location when relevant, and event type. Examples: 'Wine Tasting Event at [Business Name]', 'Community Yoga Session', '[Business Name] Grand Opening Celebration'. Include the business name when appropriate for local SEO.",
          },
        },
        eventDate: {
          type: "text",
          label: "Event Date",
          ai: {
            instructions:
              "The date of the event in a readable format (e.g., '12.12.2022', 'December 12, 2022', '12/12/2022'). For SEO purposes, ensure dates are in a consistent, clear format. Also consider including the day of the week when available.",
          },
        },
        eventTime: {
          type: "text",
          label: "Event Time",
          ai: {
            instructions:
              "The time range for the event (e.g., '2 PM - 3 PM', '10:00 AM - 12:00 PM', '6:00 PM - 8:00 PM'). Use a consistent time format throughout the section.",
          },
        },
        eventDescription: {
          type: "textarea",
          label: "Event Description",
          ai: {
            instructions:
              "Provide comprehensive, SEO-optimized event descriptions that include location-specific details, what attendees can expect, benefits of attending, and relevant keywords. Include the business name and location naturally. Describe the event in detail to help potential attendees understand what the event offers. Mention any special features, guest speakers, activities, or benefits. Keep descriptions informative and engaging while incorporating local SEO keywords naturally.",
          },
        },
        learnMoreLink: {
          type: "text",
          label: "Learn More Link",
          ai: {
            instructions:
              "The URL where users can learn more about the event. This could be an event registration page, event details page, or external event page. Use full URLs including https:// when linking to external sites.",
          },
        },
        learnMoreText: {
          type: "text",
          label: "Learn More Text",
        },
      },
      defaultItemProps: {
        imageUrl:
          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop",
        eventTitle: "Event Title",
        eventDate: "12.12.2022",
        eventTime: "2 PM - 3 PM",
        eventDescription:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        learnMoreLink: "#",
        learnMoreText: "Learn More",
      },
    },
  },
  defaultProps: {
    title: "Upcoming Events",
    events: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop",
        eventTitle: "Event Title",
        eventDate: "12.12.2022",
        eventTime: "2 PM - 3 PM",
        eventDescription:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        learnMoreLink: "#",
        learnMoreText: "Learn More",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop",
        eventTitle: "Event Title",
        eventDate: "12.12.2022",
        eventTime: "2 PM - 3 PM",
        eventDescription:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        learnMoreLink: "#",
        learnMoreText: "Learn More",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=450&fit=crop",
        eventTitle: "Event Title",
        eventDate: "12.12.2022",
        eventTime: "2 PM - 3 PM",
        eventDescription:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        learnMoreLink: "#",
        learnMoreText: "Learn More",
      },
    ],
  },
  ai: {
    instructions:
      "Create a comprehensive events section for a brick-and-mortar location landing page. This section highlights upcoming events hosted at the location. Each event should include detailed information optimized for local SEO, including the business name, location-specific details, and event descriptions that help potential attendees understand what to expect. Events should be relevant to the location's business type and community. Include Schema.org Event structured data markup for enhanced SEO.",
  },
  render: EventsSection,
};

export default EventsSection;

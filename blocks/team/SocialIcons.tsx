import React from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { SocialLinks } from "./types";

const getClassName = getClassNameFactory("TeamSection", styles);

type SocialIconsProps = {
  socialLinks?: SocialLinks;
  isEditing: boolean;
};

export const SocialIcons = ({ socialLinks, isEditing }: SocialIconsProps) => {
  if (!socialLinks) return null;

  return (
    <div className={getClassName("socialLinks")}>
      {socialLinks.twitter && (
        <a
          href={socialLinks.twitter}
          className={getClassName("socialIcon")}
          tabIndex={isEditing ? -1 : undefined}
          aria-label="Twitter"
        >
          <svg fill="currentColor" viewBox="0 0 48 48">
            <g clipPath="url(#clip0_17_80)">
              <path d="M15.1 43.5c18.11 0 28.017-15.006 28.017-28.016 0-.422-.01-.853-.029-1.275A19.998 19.998 0 0048 9.11c-1.795.798-3.7 1.32-5.652 1.546a9.9 9.9 0 004.33-5.445 19.794 19.794 0 01-6.251 2.39 9.86 9.86 0 00-16.788 8.979A27.97 27.97 0 013.346 6.299 9.859 9.859 0 006.393 19.44a9.86 9.86 0 01-4.462-1.228v.122a9.844 9.844 0 007.901 9.656 9.788 9.788 0 01-4.442.169 9.867 9.867 0 009.195 6.843A19.75 19.75 0 010 39.078 27.937 27.937 0 0015.1 43.5z" />
            </g>
          </svg>
        </a>
      )}
      {socialLinks.linkedin && (
        <a
          href={socialLinks.linkedin}
          className={getClassName("socialIcon")}
          tabIndex={isEditing ? -1 : undefined}
          aria-label="LinkedIn"
        >
          <svg fill="currentColor" viewBox="0 0 48 48">
            <g clipPath="url(#clip0_17_68)">
              <path d="M44.447 0H3.544C1.584 0 0 1.547 0 3.46V44.53C0 46.444 1.584 48 3.544 48h40.903C46.407 48 48 46.444 48 44.54V3.46C48 1.546 46.406 0 44.447 0zM14.24 40.903H7.116V17.991h7.125v22.912zM10.678 14.87a4.127 4.127 0 01-4.134-4.125 4.127 4.127 0 014.134-4.125 4.125 4.125 0 010 8.25zm30.225 26.034h-7.115V29.766c0-2.653-.047-6.075-3.704-6.075-3.703 0-4.265 2.896-4.265 5.887v11.325h-7.107V17.991h6.826v3.13h.093c.947-1.8 3.272-3.702 6.731-3.702 7.21 0 8.541 4.744 8.541 10.912v12.572z" />
            </g>
          </svg>
        </a>
      )}
      {socialLinks.github && (
        <a
          href={socialLinks.github}
          className={getClassName("socialIcon")}
          tabIndex={isEditing ? -1 : undefined}
          aria-label="GitHub"
        >
          <svg fill="currentColor" viewBox="0 0 48 48">
            <g clipPath="url(#clip0_910_44)">
              <path
                fillRule="evenodd"
                d="M24 1A24.086 24.086 0 008.454 6.693 23.834 23.834 0 00.319 21.044a23.754 23.754 0 003.153 16.172 23.98 23.98 0 0012.938 10.29c1.192.221 1.641-.518 1.641-1.146 0-.628-.024-2.45-.032-4.442-6.676 1.443-8.087-2.817-8.087-2.817-1.089-2.766-2.663-3.493-2.663-3.493-2.178-1.478.163-1.45.163-1.45 2.413.17 3.68 2.461 3.68 2.461 2.138 3.648 5.616 2.593 6.983 1.976.215-1.545.838-2.596 1.526-3.193-5.333-.6-10.937-2.647-10.937-11.791a9.213 9.213 0 012.472-6.406c-.246-.6-1.069-3.026.234-6.322 0 0 2.015-.64 6.602 2.446a22.904 22.904 0 0112.017 0c4.583-3.086 6.594-2.446 6.594-2.446 1.307 3.288.484 5.714.238 6.322a9.194 9.194 0 012.476 6.414c0 9.163-5.615 11.183-10.957 11.772.859.742 1.626 2.193 1.626 4.421 0 3.193-.028 5.762-.028 6.548 0 .636.433 1.38 1.65 1.146a23.98 23.98 0 0012.938-10.291 23.754 23.754 0 003.151-16.175A23.834 23.834 0 0039.56 6.69 24.086 24.086 0 0024.009 1H24z"
                clipRule="evenodd"
              />
            </g>
          </svg>
        </a>
      )}
    </div>
  );
};

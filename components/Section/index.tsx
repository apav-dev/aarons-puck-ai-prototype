import { CSSProperties, forwardRef, ReactNode } from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";

const getClassName = getClassNameFactory("Section", styles);

export type SectionProps = {
  className?: string;
  children: ReactNode;
  maxWidth?: string;
  style?: CSSProperties;
  /** Renders in outer div, full-bleed; content stays in constrained inner. */
  background?: ReactNode;
};

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  (
    { children, className, maxWidth = "1280px", style = {}, background },
    ref,
  ) => {
    const hasFullBleed = !!background;
    const rootClass = `${getClassName()}${hasFullBleed ? ` ${getClassName("fullBleed")}` : ""}${className ? ` ${className}` : ""}`;
    return (
      <div className={rootClass} style={style} ref={ref}>
        {hasFullBleed && (
          <div className={getClassName("backgroundLayer")} aria-hidden="true">
            {background}
          </div>
        )}
        <div className={getClassName("inner")} style={{ maxWidth }}>
          {children}
        </div>
      </div>
    );
  },
);

Section.displayName = "Section";

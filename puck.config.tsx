import type { Config } from "@measured/puck";
import { Hero, HeroProps } from "./blocks/example/Hero";

type Props = {
  HeadingBlock: { title: string };
  Hero: HeroProps;
};

export const config: Config<Props> = {
  components: {
    Hero: Hero,
    HeadingBlock: {
      fields: {
        title: { type: "text" },
      },
      defaultProps: {
        title: "Heading",
      },
      render: ({ title }) => (
        <div style={{ padding: 64 }}>
          <h1>{title}</h1>
        </div>
      ),
    },
  },
};

export default config;

import React from 'react';
import { JBCalendar } from 'jb-calendar/react';
import type { Meta, StoryObj } from '@storybook/react';
import '../../../docs/styles/ant-design.css';
import '../../../docs/styles/aurora.css';
import '../../../docs/styles/bootstrap.css';
import '../../../docs/styles/candy.css';
import '../../../docs/styles/carbon.css';
import '../../../docs/styles/cupertino.css';
import '../../../docs/styles/fluent.css';
import '../../../docs/styles/forest.css';
import '../../../docs/styles/material.css';
import '../../../docs/styles/porcelain.css';
import '../../../docs/styles/sunset.css';
import '../../../docs/styles/terminal.css';
import './styles/style-ant-design.css';
import './styles/style-aurora.css';
import './styles/style-bootstrap.css';
import './styles/style-candy.css';
import './styles/style-carbon.css';
import './styles/style-cupertino.css';
import './styles/style-fluent.css';
import './styles/style-forest.css';
import './styles/style-material.css';
import './styles/style-porcelain.css';
import './styles/style-sunset.css';
import './styles/style-terminal.css';

const meta = {
  title: "Components/JBCalendar/Style",
  component: JBCalendar,
} satisfies Meta<typeof JBCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

const styleSamples = [
  { name: "Carbon", className: "carbon-style carbon-calendar" },
  { name: "Aurora", className: "aurora-style aurora-calendar" },
  { name: "Forest", className: "forest-style forest-calendar" },
  { name: "Sunset", className: "sunset-style sunset-calendar" },
  { name: "Porcelain", className: "porcelain-style porcelain-calendar" },
  { name: "Candy", className: "candy-style candy-calendar" },
  { name: "Terminal", className: "terminal-style terminal-calendar" },
  { name: "Material", className: "material-style material-calendar" },
  { name: "Fluent", className: "fluent-style fluent-calendar" },
  { name: "Bootstrap", className: "bootstrap-style bootstrap-calendar" },
  { name: "Cupertino", className: "cupertino-style cupertino-calendar" },
  { name: "Ant Design", className: "ant-design-style ant-calendar" },
];

export const Gallery: Story = {
  name: "Gallery",
  render: () => (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(19.5rem, 1fr))",
      gap: "1.25rem",
      alignItems: "start",
      width: "min(100%, 76rem)",
    }}>
      {styleSamples.map((sample) => (
        <section
          key={sample.className}
          style={{
            display: "grid",
            gap: "0.5rem",
            justifyItems: "center",
            minWidth: 0,
          }}
        >
          <div style={{
            width: "100%",
            maxWidth: "19.5rem",
            color: "#334155",
            fontSize: "0.875rem",
            fontWeight: 700,
            lineHeight: 1.4,
            textAlign: "center",
          }}>
            {sample.name}
          </div>
          <JBCalendar className={sample.className}></JBCalendar>
        </section>
      ))}
    </div>
  ),
};

export const Carbon: Story = {
  name: "Carbon",
  render: () => <JBCalendar className="carbon-style carbon-calendar"></JBCalendar>,
};

export const Aurora: Story = {
  name: "Aurora",
  render: () => <JBCalendar className="aurora-style aurora-calendar"></JBCalendar>,
};

export const Forest: Story = {
  name: "Forest",
  render: () => <JBCalendar className="forest-style forest-calendar"></JBCalendar>,
};

export const Sunset: Story = {
  name: "Sunset",
  render: () => <JBCalendar className="sunset-style sunset-calendar"></JBCalendar>,
};

export const Porcelain: Story = {
  name: "Porcelain",
  render: () => <JBCalendar className="porcelain-style porcelain-calendar"></JBCalendar>,
};

export const Candy: Story = {
  name: "Candy",
  render: () => <JBCalendar className="candy-style candy-calendar"></JBCalendar>,
};

export const Terminal: Story = {
  name: "Terminal",
  render: () => <JBCalendar className="terminal-style terminal-calendar"></JBCalendar>,
};

export const Material: Story = {
  name: "Material",
  render: () => <JBCalendar className="material-style material-calendar"></JBCalendar>,
};

export const Fluent: Story = {
  name: "Fluent",
  render: () => <JBCalendar className="fluent-style fluent-calendar"></JBCalendar>,
};

export const Bootstrap: Story = {
  name: "Bootstrap",
  render: () => <JBCalendar className="bootstrap-style bootstrap-calendar"></JBCalendar>,
};

export const Cupertino: Story = {
  name: "Cupertino",
  render: () => <JBCalendar className="cupertino-style cupertino-calendar"></JBCalendar>,
};

export const AntDesign: Story = {
  name: "Ant Design",
  render: () => <JBCalendar className="ant-design-style ant-calendar"></JBCalendar>,
};

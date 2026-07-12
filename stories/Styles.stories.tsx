import React from 'react';
import { JBCalendar } from 'jb-calendar/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
  { name: "Carbon", className: "carbon-style" },
  { name: "Aurora", className: "aurora-style" },
  { name: "Forest", className: "forest-style" },
  { name: "Sunset", className: "sunset-style" },
  { name: "Porcelain", className: "porcelain-style" },
  { name: "Candy", className: "candy-style" },
  { name: "Terminal", className: "terminal-style" },
  { name: "Material", className: "material-style" },
  { name: "Fluent", className: "fluent-style" },
  { name: "Bootstrap", className: "bootstrap-style" },
  { name: "Cupertino", className: "cupertino-style" },
  { name: "Ant Design", className: "ant-design-style" },
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
  render: () => <JBCalendar className="carbon-style"></JBCalendar>,
};

export const Aurora: Story = {
  name: "Aurora",
  render: () => <JBCalendar className="aurora-style"></JBCalendar>,
};

export const Forest: Story = {
  name: "Forest",
  render: () => <JBCalendar className="forest-style"></JBCalendar>,
};

export const Sunset: Story = {
  name: "Sunset",
  render: () => <JBCalendar className="sunset-style"></JBCalendar>,
};

export const Porcelain: Story = {
  name: "Porcelain",
  render: () => <JBCalendar className="porcelain-style"></JBCalendar>,
};

export const Candy: Story = {
  name: "Candy",
  render: () => <JBCalendar className="candy-style"></JBCalendar>,
};

export const Terminal: Story = {
  name: "Terminal",
  render: () => <JBCalendar className="terminal-style"></JBCalendar>,
};

export const Material: Story = {
  name: "Material",
  render: () => <JBCalendar className="material-style"></JBCalendar>,
};

export const Fluent: Story = {
  name: "Fluent",
  render: () => <JBCalendar className="fluent-style"></JBCalendar>,
};

export const Bootstrap: Story = {
  name: "Bootstrap",
  render: () => <JBCalendar className="bootstrap-style"></JBCalendar>,
};

export const Cupertino: Story = {
  name: "Cupertino",
  render: () => <JBCalendar className="cupertino-style"></JBCalendar>,
};

export const AntDesign: Story = {
  name: "Ant Design",
  render: () => <JBCalendar className="ant-design-style"></JBCalendar>,
};

import type { PanelManifest } from "../../panel-manifest";
import type { ProceduralSuiteParams } from "./types";
import ControlPanel from "./ControlPanel";
import BouncingBallsPanel from "./BouncingBallsPanel";
import FountainPanel from "./FountainPanel";
import RecursiveSubdivisionPanel from "./RecursiveSubdivisionPanel";
import TopologicalSurfacesPanel from "./TopologicalSurfacesPanel";

export const controlManifest: PanelManifest<ProceduralSuiteParams> = {
  id: "procedural-visuals-control",
  title: "Procedural Suite Control",
  component: ControlPanel,
  category: "instrument",
  accentColor: "#f5a623",
  glyph: "🎛️",
  capabilities: ["persistence"],
  paramsDefault: {
    documentId: "default",
  },
  osc: {
    emits: [
      { address: "/procedural-suite/{doc}/*/control/*", args: ["int"], description: "Emits control changes to visualizations" },
      { address: "/procedural-suite/{doc}/ping", args: [], description: "Pings visualizations for availability" }
    ],
    listens: [
      { address: "/procedural-suite/{doc}/*/available", args: ["bool"], description: "Listens for available visualizations" }
    ]
  }
};

export const bouncingBallsManifest: PanelManifest<ProceduralSuiteParams> = {
  id: "procedural-visuals-balls",
  title: "Bouncing Balls",
  component: BouncingBallsPanel,
  category: "viewer",
  accentColor: "#7c6af5",
  glyph: "⚽",
  capabilities: ["persistence"],
  paramsDefault: { documentId: "default" },
  osc: {
    emits: [{ address: "/procedural-suite/{doc}/bouncing-balls/available", args: ["bool"], description: "Reports availability" }],
    listens: [{ address: "/procedural-suite/{doc}/bouncing-balls/control/*", args: ["float"], description: "Receives control updates" }]
  }
};

export const fountainManifest: PanelManifest<ProceduralSuiteParams> = {
  id: "procedural-visuals-fountain",
  title: "Configurable Fountain",
  component: FountainPanel,
  category: "viewer",
  accentColor: "#4ecca3",
  glyph: "⛲",
  capabilities: ["persistence"],
  paramsDefault: { documentId: "default" },
  osc: {
    emits: [{ address: "/procedural-suite/{doc}/fountain/available", args: ["bool"], description: "Reports availability" }],
    listens: [{ address: "/procedural-suite/{doc}/fountain/control/*", args: ["float"], description: "Receives control updates" }]
  }
};

export const recursiveManifest: PanelManifest<ProceduralSuiteParams> = {
  id: "procedural-visuals-recursive",
  title: "Recursive Subdivision",
  component: RecursiveSubdivisionPanel,
  category: "viewer",
  accentColor: "#f26d85",
  glyph: "🖼️",
  capabilities: ["persistence"],
  paramsDefault: { documentId: "default" },
  osc: {
    emits: [{ address: "/procedural-suite/{doc}/recursive-subdivision/available", args: ["bool"], description: "Reports availability" }],
    listens: [{ address: "/procedural-suite/{doc}/recursive-subdivision/control/*", args: ["int"], description: "Receives control updates" }]
  }
};

export const topologicalManifest: PanelManifest<ProceduralSuiteParams> = {
  id: "procedural-visuals-topological",
  title: "Topological Surfaces",
  component: TopologicalSurfacesPanel,
  category: "viewer",
  accentColor: "#61c0ff",
  glyph: "🍩",
  capabilities: ["persistence"],
  paramsDefault: { documentId: "default" },
  osc: {
    emits: [{ address: "/procedural-suite/{doc}/topological-surfaces/available", args: ["bool"], description: "Reports availability" }],
    listens: [{ address: "/procedural-suite/{doc}/topological-surfaces/control/*", args: ["float"], description: "Receives control updates" }]
  }
};

import React, { useEffect, useState } from "react";
import type { IDockviewPanelProps } from "dockview";
import { onOsc, sendOsc } from "./channels";
import type { ProceduralSuiteParams, VizType } from "./types";
import { VIZ_PANELS, getAvailableAddress, getControlAddress, getPingAddress } from "./channels";
import "./Panel.css";

export default function ControlPanel(props: IDockviewPanelProps<ProceduralSuiteParams>) {
  const docId = props.params?.documentId || "default";

  // State to track which visualization panels are open
  const [activePanels, setActivePanels] = useState<Record<string, boolean>>({});

  // State for controls for each visualization
  const [bouncingBallsState, setBouncingBallsState] = useState({
    count: 20, gravity: 10, restitution: 85
  });

  const [fountainState, setFountainState] = useState({
    trailFade: 0.2, sources: 1, particleSize: 4, animSpeed: 1.0, colorScheme: 'viridis'
  });

  const [recursiveState, setRecursiveState] = useState({
    depth: 5, variation: 60, hue: '#7c6af5'
  });

  const [topologicalState, setTopologicalState] = useState({
    surface: 'klein', shaderMode: 0, colorPalette: 0, speed: 1.0, frequency: 5.5,
    intensity: 1.0, roughness: 26.0, fresnel: 2.3, wireframe: false, wireframeOpacity: 0.15,
    autoRotate: true, autoRotateSpeed: 0.8
  });

  useEffect(() => {
    // Listen for available visualizations
    const cleanupFns: Array<() => void> = [];

    Object.keys(VIZ_PANELS).forEach(viz => {
      const address = getAvailableAddress(docId, viz);
      const unsub = onOsc(address, (addr, args) => {
        const isAvailable = args[0]?.value === true;
        setActivePanels(prev => ({ ...prev, [viz]: isAvailable }));
      });
      cleanupFns.push(unsub);
    });

    // Ping existing panels so they re-report availability
    sendOsc(getPingAddress(docId), []);

    return () => cleanupFns.forEach(fn => fn());
  }, [docId]);

  // Generic value change sender
  const handleControlChange = (viz: string, param: string, value: any, type: string = 'float') => {
    sendOsc(getControlAddress(docId, viz, param), [{ type, value }]);

    // Update local state for immediate feedback
    if (viz === 'bouncing-balls') setBouncingBallsState(prev => ({ ...prev, [param]: value }));
    else if (viz === 'fountain') setFountainState(prev => ({ ...prev, [param]: value }));
    else if (viz === 'recursive-subdivision') setRecursiveState(prev => ({ ...prev, [param]: value }));
    else if (viz === 'topological-surfaces') setTopologicalState(prev => ({ ...prev, [param]: value }));
  };

  const handleTrigger = (viz: string, action: string) => {
    sendOsc(getControlAddress(docId, viz, action), [{ type: 'bang', value: 1 }]);
  };

  return (
    <div className="procedural-suite-control-root">
      <div className="control-header">
        <h2>Procedural Suite Controller</h2>
        <div className="panel-status-indicators">
          {Object.entries(VIZ_PANELS).map(([key, label]) => (
            <div key={key} className={`status-pill ${activePanels[key] ? 'active' : ''}`}>
              <span className="dot"></span>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="instrument-rack">
        {/* Bouncing Balls Controls */}
        <div className={`instrument-module ${activePanels['bouncing-balls'] ? 'active' : 'inactive'}`}>
          <div className="module-header">Bouncing Balls</div>
          <div className="module-controls">
            <div className="control-group">
              <label>Count</label>
              <input type="range" min="1" max="80" value={bouncingBallsState.count} onChange={e => handleControlChange('bouncing-balls', 'count', parseInt(e.target.value), 'int')} />
            </div>
            <div className="control-group">
              <label>Gravity</label>
              <input type="range" min="0" max="40" value={bouncingBallsState.gravity} onChange={e => handleControlChange('bouncing-balls', 'gravity', parseFloat(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Restitution</label>
              <input type="range" min="0" max="100" value={bouncingBallsState.restitution} onChange={e => handleControlChange('bouncing-balls', 'restitution', parseFloat(e.target.value))} />
            </div>
            <button className="bang-btn" onClick={() => handleTrigger('bouncing-balls', 'reset')}>Reset</button>
          </div>
        </div>

        {/* Fountain Controls */}
        <div className={`instrument-module ${activePanels['fountain'] ? 'active' : 'inactive'}`}>
          <div className="module-header">Fountain</div>
          <div className="module-controls">
             <div className="control-group">
              <label>Trail Fade</label>
              <input type="range" min="0.05" max="1.0" step="0.05" value={fountainState.trailFade} onChange={e => handleControlChange('fountain', 'trailFade', parseFloat(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Sources</label>
              <input type="range" min="1" max="5" step="1" value={fountainState.sources} onChange={e => handleControlChange('fountain', 'sources', parseInt(e.target.value), 'int')} />
            </div>
            <div className="control-group">
              <label>Speed</label>
              <input type="range" min="0.2" max="2.0" step="0.1" value={fountainState.animSpeed} onChange={e => handleControlChange('fountain', 'animSpeed', parseFloat(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Palette</label>
              <select value={fountainState.colorScheme} onChange={e => handleControlChange('fountain', 'colorScheme', e.target.value, 'string')}>
                <option value="viridis">Viridis</option>
                <option value="turbo">Turbo</option>
                <option value="magma">Magma</option>
                <option value="rainbow">Rainbow</option>
                <option value="cool">Cool</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recursive Subdivision Controls */}
        <div className={`instrument-module ${activePanels['recursive-subdivision'] ? 'active' : 'inactive'}`}>
          <div className="module-header">Recursive Subdivision</div>
          <div className="module-controls">
            <div className="control-group">
              <label>Depth</label>
              <input type="range" min="1" max="7" value={recursiveState.depth} onChange={e => handleControlChange('recursive-subdivision', 'depth', parseInt(e.target.value), 'int')} />
            </div>
            <div className="control-group">
              <label>Variation</label>
              <input type="range" min="0" max="100" value={recursiveState.variation} onChange={e => handleControlChange('recursive-subdivision', 'variation', parseInt(e.target.value), 'int')} />
            </div>
            <div className="control-group color-picker-group">
              <label>Hue</label>
              <input type="color" value={recursiveState.hue} onChange={e => handleControlChange('recursive-subdivision', 'hue', e.target.value, 'string')} />
            </div>
            <button className="bang-btn" onClick={() => handleTrigger('recursive-subdivision', 'new-seed')}>Generate New</button>
          </div>
        </div>

        {/* Topological Surfaces Controls */}
        <div className={`instrument-module ${activePanels['topological-surfaces'] ? 'active' : 'inactive'}`}>
          <div className="module-header">Topological Surfaces</div>
          <div className="module-controls two-col">
            <div className="control-group">
              <label>Surface</label>
              <select value={topologicalState.surface} onChange={e => handleControlChange('topological-surfaces', 'surface', e.target.value, 'string')}>
                <option value="sphere">Sphere</option>
                <option value="torus">Torus</option>
                <option value="mobius">Möbius</option>
                <option value="klein">Klein</option>
                <option value="trefoil">Trefoil</option>
              </select>
            </div>
            <div className="control-group">
              <label>Shader</label>
              <select value={topologicalState.shaderMode} onChange={e => handleControlChange('topological-surfaces', 'shaderMode', parseInt(e.target.value), 'int')}>
                <option value="0">Wave Ripple</option>
                <option value="1">UV Conformal</option>
                <option value="2">Cellular Voronoi</option>
                <option value="3">Vector Flow</option>
              </select>
            </div>
            <div className="control-group">
              <label>Palette</label>
              <select value={topologicalState.colorPalette} onChange={e => handleControlChange('topological-surfaces', 'colorPalette', parseInt(e.target.value), 'int')}>
                <option value="0">Neon</option>
                <option value="1">Ocean</option>
                <option value="2">Magma</option>
                <option value="3">Prismatic</option>
                <option value="4">Monolith</option>
              </select>
            </div>
            <div className="control-group">
              <label>Speed</label>
              <input type="range" min="0" max="3" step="0.05" value={topologicalState.speed} onChange={e => handleControlChange('topological-surfaces', 'speed', parseFloat(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Wireframe</label>
              <input type="checkbox" checked={topologicalState.wireframe} onChange={e => handleControlChange('topological-surfaces', 'wireframe', e.target.checked, 'boolean')} />
            </div>
            <button className="bang-btn" onClick={() => handleTrigger('topological-surfaces', 'resetCamera')}>Reset Cam</button>
          </div>
        </div>

      </div>
    </div>
  );
}

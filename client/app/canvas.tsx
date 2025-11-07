"use client";

import { Canvas } from "@react-three/fiber";
import { forceSimulation } from "d3-force-3d";

const CanvasComponent = () => {
  const nodes = [{ id: "Alice" }, { id: "Bob" }, { id: "Carol" }];
  const simulation = forceSimulation(nodes);
  simulation.stop(); // Stop the simulation as we only need initial positions

  return <Canvas style={{ maxWidth: "10vw" }} />;
};

export default CanvasComponent;

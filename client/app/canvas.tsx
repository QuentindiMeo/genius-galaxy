"use client";

import { Canvas } from "@react-three/fiber";
import { forceSimulation } from "d3-force-3d";

type ggNode = Readonly<{
  id: string;
  site_role: "master" | "admin" | "operator" | "mentor" | "mentee" | "guest";
  region: string;
  mentor_id: string | null;
  date_joined: string; // ISO date string
  region_rel: {
    coordinates: [number, number, number];
  };
}>;
const nodeQ: ggNode = {
  id: "Quentin:019a5e02-3d4a-7d37-b42b-5a1bd879ba9f",
  site_role: "master",
  region: "France:019a5e03-96c4-7afe-87c9-522e4f7052c5",
  mentor_id: null,
  date_joined: "2023-01-01T00:00:00Z",
  region_rel: {
    coordinates: [-1, 2, 3],
  }
};
const nodeT: ggNode = {
  id: "Thomas:019a5e04-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  site_role: "mentee",
  region: "France:019a5e03-96c4-7afe-87c9-522e4f7052c5",
  mentor_id: "Quentin:019a5e02-3d4a-7d37-b42b-5a1bd879ba9f",
  date_joined: "2023-06-15T00:00:00Z",
  region_rel: {
    coordinates: [4, -5, 6],
  }
};

const CanvasComponent = () => {
  const nodes: Array<ggNode> = [nodeQ, nodeT];
  const simulation = forceSimulation(nodes);
  simulation.stop(); // Stop the simulation as we only need initial positions

  return <Canvas style={{ maxWidth: "33vw" }} />;
};

export default CanvasComponent;

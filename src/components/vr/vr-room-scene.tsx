"use client";

import { Canvas } from "@react-three/fiber";
import { Float, Grid, Text } from "@react-three/drei";
import type { ReactNode } from "react";
import type { WebGLRenderer } from "three";
import type { GeneratedChallenge } from "@/lib/game/types";

type VRRoomSceneProps = {
  challenge?: GeneratedChallenge;
  xrSupported: boolean;
  roomState: string;
  answerPreview: string;
  score?: number;
  rank: string;
  level: number;
  levelProgress: number;
  streak: number;
  voiceCommand: string;
  onRenderer: (renderer: WebGLRenderer) => void;
};

const difficultyColors: Record<string, string> = {
  EASY: "#8bff9f",
  MEDIUM: "#60f3ff",
  HARD: "#ffd166",
  EXTREME: "#ff8fb7",
  INSANE: "#c084fc"
};

function Panel({
  position,
  size,
  color,
  emissive,
  children
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  emissive: string;
  children: ReactNode;
}) {
  return (
    <Float speed={1.15} floatIntensity={0.28}>
      <mesh position={position}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.48} metalness={0.28} roughness={0.38} transparent opacity={0.92} />
      </mesh>
      {children}
    </Float>
  );
}

function PortalDoors({ activeDifficulty }: { activeDifficulty?: string }) {
  const difficulties = ["EASY", "MEDIUM", "HARD", "EXTREME", "INSANE"];

  return (
    <group position={[0, -0.58, -3.15]}>
      {difficulties.map((difficulty, index) => {
        const active = difficulty === activeDifficulty;
        const x = -3.4 + index * 1.7;
        const color = difficultyColors[difficulty] ?? "#60f3ff";
        return (
          <Float key={difficulty} speed={0.7 + index * 0.08} floatIntensity={active ? 0.35 : 0.12}>
            <mesh position={[x, 0.25, 0]}>
              <boxGeometry args={[1.05, active ? 1.72 : 1.42, 0.1]} />
              <meshStandardMaterial color="#020617" emissive={color} emissiveIntensity={active ? 0.88 : 0.32} metalness={0.45} roughness={0.3} />
            </mesh>
            <Text position={[x, 0.98, 0.08]} fontSize={0.105} color={color} anchorX="center">
              {difficulty}
            </Text>
            <Text position={[x, 0.18, 0.08]} fontSize={0.07} color="#e2e8f0" anchorX="center">
              PORTAL
            </Text>
          </Float>
        );
      })}
    </group>
  );
}

function ArenaRoom({
  challenge,
  xrSupported,
  roomState,
  answerPreview,
  score,
  rank,
  level,
  levelProgress,
  streak,
  voiceCommand
}: Omit<VRRoomSceneProps, "onRenderer">) {
  const title = challenge?.title ?? "Select a challenge";
  const typeLabel = challenge?.type === "SQL" ? "SQL PANEL" : challenge?.type === "LINUX" || challenge?.type === "BASH_SCRIPTING" ? "TERMINAL PANEL" : "EDITOR PANEL";
  const answer = answerPreview.trim() ? answerPreview.trim().slice(0, 94) : challenge?.starterCode?.slice(0, 94) ?? "Write or speak your answer stream here.";
  const progressWidth = Math.max(0.12, Math.min(1, levelProgress / 100));

  return (
    <>
      <ambientLight intensity={0.68} />
      <directionalLight position={[4, 7, 5]} intensity={2.2} />
      <pointLight position={[-3.8, 1.8, 1.4]} color="#60f3ff" intensity={2.1} />
      <pointLight position={[3.8, 1.6, 0.8]} color="#ffd166" intensity={1.6} />
      <Grid
        position={[0, -1.55, 0]}
        args={[24, 24]}
        cellSize={0.8}
        cellColor="#164e63"
        sectionSize={3.2}
        sectionColor="#60f3ff"
        fadeDistance={18}
        fadeStrength={1.25}
        infiniteGrid
      />

      <mesh position={[0, 2.35, -3.4]}>
        <boxGeometry args={[8.8, 0.06, 0.08]} />
        <meshStandardMaterial color="#60f3ff" emissive="#60f3ff" emissiveIntensity={1.2} />
      </mesh>

      <Panel position={[-2.9, 0.8, 0]} size={[3.05, 1.72, 0.12]} color="#0f172a" emissive="#082f49">
        <Text position={[-2.9, 1.38, 0.09]} fontSize={0.14} color="#67e8f9" anchorX="center">
          CHALLENGE BOARD
        </Text>
        <Text position={[-2.9, 1.02, 0.09]} fontSize={0.095} color="#f8fafc" anchorX="center" maxWidth={2.62}>
          {title}
        </Text>
        <Text position={[-2.9, 0.62, 0.09]} fontSize={0.074} color="#cbd5e1" anchorX="center" maxWidth={2.52}>
          {challenge?.learningObjective ?? "Load a mission to begin focused immersive training."}
        </Text>
        <Text position={[-2.9, 0.22, 0.09]} fontSize={0.078} color={difficultyColors[challenge?.difficulty ?? "MEDIUM"]} anchorX="center">
          {challenge?.difficulty ?? "READY"} / {challenge?.xpReward ?? 0} XP
        </Text>
      </Panel>

      <Panel position={[0.55, 0.44, -0.38]} size={[3.35, 1.95, 0.12]} color="#020617" emissive="#0e7490">
        <Text position={[0.55, 1.12, -0.29]} fontSize={0.13} color="#bbf7d0" anchorX="center">
          {typeLabel}
        </Text>
        <Text position={[0.55, 0.72, -0.29]} fontSize={0.082} color="#f8fafc" anchorX="center" maxWidth={2.85}>
          {answer}
        </Text>
        <Text position={[0.55, 0.22, -0.29]} fontSize={0.082} color={score === undefined ? "#94a3b8" : score >= 100 ? "#bef264" : "#fde68a"} anchorX="center">
          {score === undefined ? "checks waiting" : `latest score ${score}%`}
        </Text>
      </Panel>

      <Float speed={1.45} floatIntensity={0.45}>
        <mesh position={[3.35, 1.0, 0.18]}>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial color="#111827" emissive="#ffd166" emissiveIntensity={0.8} metalness={0.45} roughness={0.22} />
        </mesh>
        <mesh position={[3.35, 1.0, 0.18]}>
          <torusGeometry args={[0.55, 0.014, 16, 64]} />
          <meshStandardMaterial color="#60f3ff" emissive="#60f3ff" emissiveIntensity={1.1} />
        </mesh>
        <Text position={[3.35, 1.58, 0.25]} fontSize={0.13} color="#fde68a" anchorX="center">
          GENIE ORB
        </Text>
        <Text position={[3.35, 0.46, 0.25]} fontSize={0.075} color="#f8fafc" anchorX="center" maxWidth={1.95}>
          {roomState}
        </Text>
      </Float>

      <Panel position={[0, 2.05, 0.05]} size={[4.1, 0.72, 0.1]} color="#111827" emissive="#14532d">
        <Text position={[-1.65, 2.17, 0.13]} fontSize={0.1} color="#f8fafc" anchorX="left">
          LV {level} / {rank}
        </Text>
        <Text position={[1.65, 2.17, 0.13]} fontSize={0.1} color="#fef3c7" anchorX="right">
          {streak} day streak
        </Text>
        <mesh position={[-0.55 + progressWidth, 1.91, 0.14]}>
          <boxGeometry args={[2.2 * progressWidth, 0.05, 0.025]} />
          <meshStandardMaterial color="#bef264" emissive="#bef264" emissiveIntensity={0.9} />
        </mesh>
      </Panel>

      <Panel position={[0, -1.05, 1.05]} size={[4.5, 0.58, 0.08]} color="#020617" emissive="#581c87">
        <Text position={[0, -0.92, 1.11]} fontSize={0.075} color="#ddd6fe" anchorX="center" maxWidth={4.0}>
          Voice: {voiceCommand}
        </Text>
        <Text position={[0, -1.16, 1.11]} fontSize={0.067} color={xrSupported ? "#bef264" : "#fde68a"} anchorX="center">
          {xrSupported ? "WebXR headset entry ready" : "Browser immersive room active"}
        </Text>
      </Panel>

      <PortalDoors activeDifficulty={challenge?.difficulty} />
    </>
  );
}

export function VRRoomScene(props: VRRoomSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.55, 6.9], fov: 52 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.xr.enabled = true;
        props.onRenderer(gl);
      }}
    >
      <ArenaRoom {...props} />
    </Canvas>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import {
  BackSide,
  RepeatWrapping,
  LinearFilter,
  TextureLoader,
  Texture,
} from "three";

const MESH_CONSTANTS = {
  SPHERE_RADIUS: 5,
  HORIZONTAL_SEGMENTS: 60,
  VERTICAL_SEGMENTS: 40,
};

interface ThreeSixtyImageMeshProps {
  imageUrl: string;
}

export default function ThreeSixtyImageMesh({ imageUrl }: ThreeSixtyImageMeshProps) {
  const { gl, invalidate } = useThree();
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.load(
      imageUrl,
      (loadedTexture) => {
        loadedTexture.repeat.set(-1, 1);
        loadedTexture.wrapS = RepeatWrapping;
        loadedTexture.minFilter = LinearFilter;
        loadedTexture.magFilter = LinearFilter;
        loadedTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
        invalidate();
      },
      undefined,
      (error) => {
        console.error("Error loading texture:", error);
      }
    );

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [imageUrl, gl.capabilities, invalidate]);

  if (!texture) {
    return null;
  }

  return (
    <mesh>
      <sphereGeometry
        args={[
          MESH_CONSTANTS.SPHERE_RADIUS,
          MESH_CONSTANTS.HORIZONTAL_SEGMENTS,
          MESH_CONSTANTS.VERTICAL_SEGMENTS,
        ]}
      />
      <meshBasicMaterial
        map={texture}
        side={BackSide}
        toneMapped={false}
      />
    </mesh>
  );
}

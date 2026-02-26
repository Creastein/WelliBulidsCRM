import React, { Suspense } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function GradientBackground() {
    return (
        <div className="fixed inset-0 z-0">
            <ShaderGradientCanvas
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                }}
                fov={45}
            >
                <Suspense fallback={null}>
                    <ShaderGradient
                        animate="on"
                        brightness={1.2}
                        cAzimuthAngle={180}
                        cDistance={2.9}
                        cPolarAngle={120}
                        cameraZoom={1}
                        color1="#1a0a2e"
                        color2="#16213e"
                        color3="#0f3460"
                        envPreset="city"
                        grain="off"
                        lightType="3d"
                        positionX={0}
                        positionY={1.8}
                        positionZ={0}
                        reflection={0.1}
                        rotationX={0}
                        rotationY={0}
                        rotationZ={-90}
                        shader="defaults"
                        type="waterPlane"
                        uAmplitude={0}
                        uDensity={1}
                        uFrequency={5.5}
                        uSpeed={0.3}
                        uStrength={3}
                        uTime={0.2}
                        wireframe={false}
                    />
                </Suspense>
            </ShaderGradientCanvas>
        </div>
    );
}

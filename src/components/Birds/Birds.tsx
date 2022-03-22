import { GPUComputationRenderer } from "three-stdlib";
import * as THREE from "three";
import { BufferGeometry, ShaderMaterial, Vector2 } from "three";
import { useMemo, useRef } from "react";
import BirdGeometry from "./BirdsGeometry";
import { useFrame, useThree } from "@react-three/fiber";
import fragmentSimulation from "../../shaders/fragmentSimulation.glsl";
import fragment from "../../shaders/fragment.glsl";
import vert from "../../shaders/vertexParticles.glsl";

interface BirdProps {}
interface TestObjProps {}

const WIDTH = 32;
const BOUNDS = 800;
const BOUNDS_HALF = BOUNDS / 2;

let gpuCompute: any;
let positionVariable: any;
let velocityUniforms;
let birdUniforms;

const TestObj = (props: TestObjProps) => {
    const pointsGeoRef = useRef<BufferGeometry>();
    const matRef = useRef<ShaderMaterial>();

    const size = useThree(({ size }) => size);
    const dpr = useThree(({ viewport }) => viewport.dpr);

    const uniforms = useMemo(() => {
        return {
            uTime: { value: 0 },
            delta: { value: 0 },
            uResolution: {
                value: new Vector2(size.width * dpr, size.height * dpr),
            },
            positionTexture: { value: 0 },
        };
    }, [dpr, size.height, size.width]);

    const positionArray = useMemo(() => {
        const posArray = new Float32Array(WIDTH * WIDTH * 3);
        return posArray;
    }, []);

    const uvArray = useMemo(() => {
        const uvs = new Float32Array(WIDTH * WIDTH * 2);
        return uvs;
    }, []);

    for (let i = 0; i < WIDTH * WIDTH; i++) {
        let x = Math.random();
        let y = Math.random();
        let z = Math.random();
        let xx = (i % WIDTH) / WIDTH;
        let yy = ~~(i / WIDTH) / WIDTH;
        positionArray.set([x, y, z], i * 3);
        uvArray.set([xx, yy], i * 2);
    }

    // add attribute to points geometry
    const pointsPosAttribute = useMemo(() => {
        const pointsPosAttribute = new THREE.BufferAttribute(positionArray, 3);
        return pointsPosAttribute;
    }, [positionArray]);

    const pointsUVAttribute = useMemo(() => {
        const pointsUVAttribute = new THREE.BufferAttribute(uvArray, 2);
        return pointsUVAttribute;
    }, [uvArray]);

    if (pointsGeoRef) {
        pointsGeoRef.current?.setAttribute("position", pointsPosAttribute);
        pointsGeoRef.current?.setAttribute("reference", pointsUVAttribute);
    }

    useFrame((_) => {
        let time = _.clock.getElapsedTime();
        uniforms.uTime.value = time * 2.0;

        if (matRef) {
            matRef.current?.uniforms.positionTexture.value =
                gpuCompute.getCurrentRenderTarget(positionVariable).texture;
        }
    });

    console.log(positionVariable.material.uniforms["time"].value);

    return (
        <points>
            <bufferGeometry ref={pointsGeoRef} />
            <shaderMaterial
                fragmentShader={fragment}
                vertexShader={vert}
                uniforms={uniforms}
                ref={matRef}
            />
        </points>
    );
};

const Birds = (props: BirdProps) => {
    const geometry = new BirdGeometry();

    const { gl } = useThree();

    // gl: (canvas: any) => {
    //     const gl: any = new GPUComputationRenderer(WIDTH, WIDTH, gl);
    //     canvas.append(gl);
    // };

    // INITIALIZE GPUCOMPUTE
    gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, gl);

    if (gl.capabilities.isWebGL2 === false) {
        gpuCompute.setDataType(THREE.HalfFloatType);
    }

    const dtPosition = gpuCompute.createTexture();
    const dtVelocity = gpuCompute.createTexture();

    fillPosition(dtPosition);

    positionVariable = gpuCompute.addVariable(
        "texturePosition",
        fragmentSimulation,
        dtPosition
    );

    positionVariable.material.uniforms["time"] = { value: 0 };

    positionVariable.wrapS = THREE.RepeatWrapping;
    positionVariable.wrapT = THREE.RepeatWrapping;

    gpuCompute.init();

    useFrame((_) => {
        let time = _.clock.getElapsedTime();
        positionVariable.material.uniforms["time"] = time;
    });

    return <TestObj />;
};

function fillPosition(texture: THREE.DataTexture) {
    let arr = texture.image.data;
    for (let i = 0; i < arr.length; i = i + 4) {
        let x = Math.random();
        let y = Math.random();
        let z = Math.random();

        arr[i] = x;
        arr[i + 1] = y;
        arr[i + 2] = z;
        arr[i + 3] = 1;
    }
}

export default Birds;

import create, { State } from "zustand";
import * as THREE from 'three';

const BNDSDEFAULT = 800;

// let gpuCompute;
// let velocityVariable;
// let positionVariable;
// let positionUniforms;
// let velocityUniforms;
// let birdUniforms;

interface LinkState extends State {
    WIDTH: number;
    BOUNDS: number;
    BOUNDS_HALF: number;
    gpuCompute: THREE.WebGLRenderer; 

    setWIDTH: (w: number) => void;
    setBOUNDS: (bnds: number) => void;
    setBOUNDSHALF: (bndshlf: number) => void;
    setGLRenderer: (r: THREE.WebGLRenderer) => void;
}

const useStore = create<LinkState>((set, get) => ({
    WIDTH: 32,
    BOUNDS: BNDSDEFAULT,
    BOUNDS_HALF: BNDSDEFAULT / 2,
    gpuCompute: new THREE.WebGLRenderer,

    setWIDTH: (w) => set((state) => ({ WIDTH: w })),
    setBOUNDS: (bnds) => set((state) => ({ BOUNDS: bnds })),
    setBOUNDSHALF: (bndshlf) => set((state) => ({ BOUNDS_HALF: bndshlf })),
    setGLRenderer: (r) => set((state) => ({gpuCompute: r})),
}));

export default useStore;

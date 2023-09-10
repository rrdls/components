import * as THREE from "three";
import { Component, Disposable } from "../../base-types";
import { Components } from "../Components";
/**
 * A basic 3D [scene](https://threejs.org/docs/#api/en/scenes/Scene) to add
 * objects hierarchically, and easily dispose them when you are finished with it.
 * @noInheritDoc
 */
export declare class SimpleScene extends Component<THREE.Scene> implements Disposable {
    /** {@link Component.enabled} */
    enabled: boolean;
    /** {@link Component.name} */
    name: string;
    private readonly _scene;
    private readonly _disposer;
    constructor(_components: Components);
    /** {@link Component.get} */
    get(): THREE.Scene;
    /** {@link Disposable.dispose} */
    dispose(): void;
}

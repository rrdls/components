import * as THREE from "three";
import { Component } from "./component";
import { Disposable } from "./base-types";
/**
 * A base component for other components whose main mission is to cast rays,
 * generally to pick objects with the mouse.
 */
export declare abstract class BaseRaycaster extends Component<THREE.Raycaster> implements Disposable {
    /** {@link Component.name} */
    abstract name: string;
    /** Whether this component is able to cast rays. */
    abstract castRay(items?: THREE.Mesh[]): THREE.Intersection | null;
    /** {@link Component.enabled} */
    abstract enabled: boolean;
    /** {@link Component.get} */
    abstract get(): THREE.Raycaster;
    abstract dispose(): void;
}

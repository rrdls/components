import * as THREE from "three";
import { Components } from "../../../core";
import { PlanView } from "./types";
import { Button } from "../../../ui";
import { UI, Event } from "../../../base-types";
export declare class PlanObjects implements UI {
    offsetFactor: number;
    uiElement: {
        main: Button;
    };
    planClicked: Event<{
        id: string;
    }>;
    private _scale;
    private _min;
    private _max;
    private _components;
    private _objects;
    private _visible;
    private _planeGeometry;
    private _linesGeometry;
    private lineMaterial;
    private _material;
    get visible(): boolean;
    set visible(active: boolean);
    constructor(components: Components);
    dispose(): void;
    add(config: PlanView): void;
    setBounds(points: THREE.Vector3[], override?: boolean): void;
    private resetBounds;
    private newScaleMatrix;
    private createPlaneOutlineGeometry;
}

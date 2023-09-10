import * as THREE from "three";
import { SimpleUIComponent } from "../SimpleUIComponent";
import { Components } from "../../core";
import { Resizeable } from "../../base-types";
export declare class Canvas extends SimpleUIComponent<HTMLCanvasElement> implements Resizeable {
    name: string;
    private _size;
    constructor(components: Components);
    getSize(): THREE.Vector2;
    resize(size?: THREE.Vector2): void;
}

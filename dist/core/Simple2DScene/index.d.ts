import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls";
import { Component, Updateable, UI, Disposable, Event } from "../../base-types";
import { Button, FloatingWindow, SimpleUIComponent } from "../../ui";
import { Components } from "../Components";
import { SimpleGrid } from "../SimpleGrid";
export declare class Simple2DScene extends Component<void> implements UI, Updateable, Disposable {
    uiElement: {
        main: Button;
        mainWindow: FloatingWindow;
        container: SimpleUIComponent;
    };
    enabled: boolean;
    afterUpdate: Event<unknown>;
    beforeUpdate: Event<unknown>;
    name: string;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    grid: SimpleGrid;
    controls: MapControls;
    constructor(components: Components);
    get(): void;
    dispose(): void;
    update(): void;
}

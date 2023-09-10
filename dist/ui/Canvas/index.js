import * as THREE from "three";
import { SimpleUIComponent } from "../SimpleUIComponent";
export class Canvas extends SimpleUIComponent {
    constructor(components) {
        const template = `
        <canvas class="absolute w-80 h-40 right-8 bottom-4 bg-ifcjs-120 
        border-transparent border border-solid rounded-lg"></canvas> 
    `;
        super(components, template);
        this.name = "Canvas";
        this._size = new THREE.Vector2(320, 160);
    }
    getSize() {
        return this._size;
    }
    resize(size) {
        if (size) {
            this._size = size;
            this.domElement.style.width = `${size.x}px`;
            this.domElement.style.height = `${size.y}px`;
        }
    }
}
//# sourceMappingURL=index.js.map
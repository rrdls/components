import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { Component } from "../../base-types/component";
export class Simple2DMarker extends Component {
    set visible(value) {
        this._visible = value;
        this._marker.visible = value;
    }
    get visible() {
        return this._visible;
    }
    constructor(components, marker) {
        super();
        this.name = "Simple2DMarker";
        this.enabled = true;
        this._visible = true;
        this._components = components;
        let _marker;
        if (marker) {
            _marker = marker;
        }
        else {
            _marker = document.createElement("div");
            _marker.className =
                "w-[15px] h-[15px] border-3 border-solid border-red-600";
        }
        this._marker = new CSS2DObject(_marker);
        this._components.scene.get().add(this._marker);
        this.visible = true;
    }
    toggleVisibility() {
        this.visible = !this.visible;
    }
    dispose() {
        this._marker.removeFromParent();
        this._marker.element.remove();
        this._components = null;
    }
    get() {
        return this._marker;
    }
}
//# sourceMappingURL=index.js.map
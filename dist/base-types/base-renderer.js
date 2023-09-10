import { Component } from "./component";
import { Event } from "./base-types";
/**
 * A base component for other components whose main mission is to render a
 * [scene](https://threejs.org/docs/#api/en/scenes/Scene).
 * @noInheritDoc
 */
export class BaseRenderer extends Component {
    constructor() {
        super(...arguments);
        this.onClippingPlanesUpdated = new Event();
        /**
         * The list of [clipping planes](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.clippingPlanes) used by this
         * instance of the renderer.
         */
        this.clippingPlanes = [];
    }
    updateClippingPlanes() {
        this.onClippingPlanesUpdated.trigger();
    }
    /**
     * Adds or removes a
     * [clipping plane](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.clippingPlanes)
     * to the renderer.
     */
    togglePlane(active, plane, isLocal) {
        plane.isLocal = isLocal;
        const index = this.clippingPlanes.indexOf(plane);
        if (active && index === -1) {
            this.clippingPlanes.push(plane);
        }
        else if (!active && index > -1) {
            this.clippingPlanes.splice(index, 1);
        }
        const renderer = this.get();
        renderer.clippingPlanes = this.clippingPlanes.filter((plane) => !plane.isLocal);
    }
}
//# sourceMappingURL=base-renderer.js.map
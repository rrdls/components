import { SimplePlane } from "../../../core";
import { ClippingEdges } from "./clipping-edges";
/**
 * A more advanced version of {@link SimpleClipper} that also includes
 * {@link ClippingEdges} with customizable lines.
 */
export class EdgesPlane extends SimplePlane {
    constructor(components, origin, normal, material, styles) {
        super(components, origin, normal, material, 5, false);
        /**
         * The max rate in milliseconds at which edges can be regenerated.
         * To disable this behaviour set this to 0.
         */
        this.edgesMaxUpdateRate = 50;
        this.lastUpdate = -1;
        this.updateTimeout = -1;
        this.updateFill = () => {
            this.edges.fillNeedsUpdate = true;
            this.edges.update();
            if (this._visible) {
                this.edges.fillVisible = true;
            }
        };
        /** {@link Updateable.update} */
        this.update = () => {
            if (!this.enabled)
                return;
            this._plane.setFromNormalAndCoplanarPoint(this._normal, this._helper.position);
            // Rate limited edges update
            const now = Date.now();
            if (this.lastUpdate + this.edgesMaxUpdateRate < now) {
                this.lastUpdate = now;
                this.edges.update();
            }
            else if (this.updateTimeout === -1) {
                this.updateTimeout = window.setTimeout(() => {
                    this.update();
                    this.updateTimeout = -1;
                }, this.edgesMaxUpdateRate);
            }
        };
        this.hideFills = () => {
            this.edges.fillVisible = false;
        };
        this.edges = new ClippingEdges(components, this._plane, styles);
        this.toggleControls(true);
        this.edges.visible = true;
        this.draggingEnded.on(this.updateFill);
        this.draggingStarted.on(this.hideFills);
    }
    /** {@link Hideable.visible} */
    set visible(state) {
        super.visible = state;
        this.toggleControls(state);
        this.edges.visible = state;
    }
    /** {@link Component.enabled} */
    get enabled() {
        return super.enabled;
    }
    /** {@link Component.enabled} */
    set enabled(state) {
        super.enabled = state;
        if (state) {
            this.update();
        }
    }
    /** {@link Disposable.dispose} */
    dispose() {
        super.dispose();
        this.edges.dispose();
    }
}
//# sourceMappingURL=edges-plane.js.map
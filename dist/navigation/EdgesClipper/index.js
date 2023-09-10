import { SimpleClipper } from "../../core";
import { EdgesStyles } from "./src/edges-styles";
export * from "./src/edges-plane";
/**
 * A more advanced version of {@link SimpleClipper} that also supports
 * {@link ClippingEdges} with customizable lines.
 */
export class EdgesClipper extends SimpleClipper {
    constructor(components, PlaneType) {
        super(components, PlaneType);
        /** {@link Component.name} */
        this.name = "EdgesClipper";
        this.styles = new EdgesStyles(components);
    }
    /** {@link Component.get} */
    dispose() {
        super.dispose();
        this.styles.dispose();
    }
    /**
     * Updates all the lines of the {@link ClippingEdges}.
     */
    updateEdges(updateFills = false) {
        if (!this.enabled)
            return;
        for (const plane of this._planes) {
            if (updateFills) {
                plane.updateFill();
            }
            else {
                plane.update();
            }
        }
    }
    newPlaneInstance(point, normal) {
        return new this.PlaneType(this.components, point, normal, this._material, this.styles);
    }
}
//# sourceMappingURL=index.js.map
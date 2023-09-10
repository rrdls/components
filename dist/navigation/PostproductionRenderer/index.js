import { SimpleRenderer } from "../../core/SimpleRenderer";
import { Postproduction } from "./src/postproduction";
/**
 * Renderer that uses efficient postproduction effects (e.g. Ambient Occlusion).
 */
export class PostproductionRenderer extends SimpleRenderer {
    constructor(components, container) {
        super(components, container);
        this.postproduction = new Postproduction(components, this._renderer);
        this.setPostproductionSize();
        this.resized.on(() => this.resizePostproduction());
    }
    /** {@link Updateable.update} */
    update(_delta) {
        var _a, _b;
        if (!this.enabled)
            return;
        this.beforeUpdate.trigger(this);
        const scene = (_a = this.components.scene) === null || _a === void 0 ? void 0 : _a.get();
        const camera = (_b = this.components.camera) === null || _b === void 0 ? void 0 : _b.get();
        if (!scene || !camera)
            return;
        if (this.postproduction.enabled) {
            this.postproduction.composer.render();
        }
        else {
            this._renderer.render(scene, camera);
        }
        this._renderer2D.render(scene, camera);
        this.afterUpdate.trigger(this);
    }
    /** {@link Disposable.dispose}. */
    dispose() {
        super.dispose();
        this.postproduction.dispose();
    }
    /** {@link Resizeable.resize}. */
    resizePostproduction() {
        if (this.postproduction) {
            this.setPostproductionSize();
        }
    }
    setPostproductionSize() {
        const { clientWidth, clientHeight } = this.container;
        this.postproduction.setSize(clientWidth, clientHeight);
    }
}
//# sourceMappingURL=index.js.map
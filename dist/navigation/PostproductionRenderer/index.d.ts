import { SimpleRenderer } from "../../core/SimpleRenderer";
import { Components } from "../../core/Components";
import { Postproduction } from "./src/postproduction";
/**
 * Renderer that uses efficient postproduction effects (e.g. Ambient Occlusion).
 */
export declare class PostproductionRenderer extends SimpleRenderer {
    /** Helper object to handle the postproduction effects applied. */
    postproduction: Postproduction;
    constructor(components: Components, container: HTMLElement);
    /** {@link Updateable.update} */
    update(_delta: number): void;
    /** {@link Disposable.dispose}. */
    dispose(): void;
    /** {@link Resizeable.resize}. */
    private resizePostproduction;
    private setPostproductionSize;
}

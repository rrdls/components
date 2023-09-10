import * as THREE from "three";
import ToolBufferReader from "top-tool-package-reader";
import { Component, Event } from "../../base-types";
/**
 * An object to easily handle all the tools used (e.g. updating them, retrieving
 * them, performing batch operations, etc). A tool is a feature that achieves
 * something through user interaction (e.g. clipping planes, dimensions, etc).
 */
export class ToolComponent extends Component {
    constructor() {
        super(...arguments);
        this.list = new Map();
        this.onToolAdded = new Event();
        this.onToolRemoved = new Event();
        this._reader = new ToolBufferReader();
        /** {@link Component.name} */
        this.name = "ToolComponent";
        /** {@link Component.enabled} */
        this.enabled = true;
        this._urls = {
            base: "https://dev.api.dev.platform.thatopen.com/v1/tools/",
            path: "/download?accessToken=",
        };
    }
    /**
     * Registers a new tool component in the application instance.
     * @param id - Unique ID to register the tool in the application.
     * @param tool - The tool to register.
     */
    add(id, tool) {
        const existingTool = this.list.get(id);
        if (existingTool) {
            console.warn(`A tool with the id: ${String(id)} already exists`);
            return;
        }
        this.list.set(id, tool);
    }
    /**
     * Deletes a previously registered tool component.
     * @param id - The registered ID of the tool to be delete.
     */
    remove(id) {
        this.list.delete(id);
        this.onToolRemoved.trigger();
    }
    /**
     * Retrieves a tool component by its registered id.
     * @param id - The id of the registered tool.
     */
    get(id) {
        if (!this.list.has(id)) {
            throw new Error("The requested component does not exist!");
        }
        return this.list.get(id);
    }
    /**
     * Gets one of your tools of That Open Platform. You can pass the type of
     * component as the generic parameter T to get the types and intellisense
     * for the component.
     * @param token The authentication token to authorise this request.
     * @param id The ID of the tool you want to get
     * @param OBC The whole components library (import * as OBC from "openbim-components")
     */
    async use(token, id, OBC) {
        const { base, path } = this._urls;
        const url = base + id + path + token;
        const fetched = await fetch(url);
        const rawBuffer = await fetched.arrayBuffer();
        const buffer = new Uint8Array(rawBuffer);
        const code = this._reader.read(buffer);
        const script = document.createElement("script");
        script.textContent = code.js;
        document.body.appendChild(script);
        const win = window;
        const toolClass = win.ThatOpenTool(OBC, THREE);
        win.ThatOpenTool = undefined;
        script.remove();
        return toolClass;
    }
    /**
     * Updates all the registered tool components. Only the components where the
     * property {@link Component.enabled} is true will be updated.
     * @param delta - The
     * [delta time](https://threejs.org/docs/#api/en/core/Clock) of the loop.
     */
    update(delta) {
        const tools = this.list.values();
        for (const tool of tools) {
            if (tool.enabled && tool.isUpdateable()) {
                tool.update(delta);
            }
        }
    }
    /**
     * Disposes all the memory used by all the tools.
     */
    dispose() {
        this.onToolAdded.reset();
        this.onToolRemoved.reset();
        const tools = this.list.values();
        for (const tool of tools) {
            tool.enabled = false;
            if (tool.isDisposeable()) {
                tool.dispose();
            }
        }
    }
}
//# sourceMappingURL=index.js.map
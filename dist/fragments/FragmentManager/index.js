import { Serializer } from "bim-fragment";
import { Component, Event } from "../../base-types";
import { Button, FloatingWindow, SimpleUICard, Toolbar } from "../../ui";
/**
 * Object that can efficiently load binary files that contain
 * [fragment geometry](https://github.com/ifcjs/fragment).
 */
export class FragmentManager extends Component {
    /** The list of meshes of the created fragments. */
    get meshes() {
        const allMeshes = [];
        for (const fragID in this.list) {
            allMeshes.push(this.list[fragID].mesh);
        }
        return allMeshes;
    }
    constructor(components) {
        super();
        /** {@link Component.name} */
        this.name = "FragmentManager";
        /** {@link Component.enabled} */
        this.enabled = true;
        /** All the created [fragments](https://github.com/ifcjs/fragment). */
        this.list = {};
        this.groups = [];
        this.baseCoordinationModel = "";
        this.onFragmentsLoaded = new Event();
        this.commands = [];
        this._loader = new Serializer();
        this._cards = [];
        this._components = components;
        const window = new FloatingWindow(components);
        window.title = "Models";
        window.domElement.style.left = "70px";
        window.domElement.style.top = "100px";
        window.domElement.style.width = "340px";
        window.domElement.style.height = "400px";
        const windowContent = window.slots.content.domElement;
        windowContent.classList.remove("overflow-auto");
        windowContent.classList.add("overflow-x-hidden");
        components.ui.add(window);
        window.visible = false;
        const main = new Button(components);
        main.tooltip = "Models";
        main.materialIcon = "inbox";
        main.onclick = () => {
            window.visible = !window.visible;
        };
        this.uiElement = { main, window };
        this.onFragmentsLoaded.on(() => this.updateWindow());
    }
    /** {@link Component.get} */
    get() {
        return Object.values(this.list);
    }
    /** {@link Component.get} */
    dispose() {
        this.onFragmentsLoaded.reset();
        this.uiElement.main.dispose();
        this.uiElement.window.dispose();
        for (const group of this.groups) {
            group.dispose(true);
        }
        for (const command of this.commands) {
            command.dispose();
        }
        for (const card of this._cards) {
            card.dispose();
        }
        this.groups = [];
        this.list = {};
    }
    disposeGroup(group) {
        for (const fragment of group.items) {
            this.removeFragmentMesh(fragment);
            delete this.list[fragment.id];
        }
        group.dispose(true);
        const index = this.groups.indexOf(group);
        this.groups.splice(index, 1);
        this.updateWindow();
    }
    /** Disposes all existing fragments */
    reset() {
        for (const id in this.list) {
            const fragment = this.list[id];
            fragment.dispose();
        }
        this.list = {};
    }
    /**
     * Loads one or many fragments into the scene.
     * @param data - the bytes containing the data for the fragments to load.
     * @returns the list of IDs of the loaded fragments.
     */
    load(data) {
        const group = this._loader.import(data);
        const scene = this._components.scene.get();
        const ids = [];
        scene.add(group);
        for (const fragment of group.items) {
            fragment.group = group;
            this.list[fragment.id] = fragment;
            ids.push(fragment.id);
            this._components.meshes.push(fragment.mesh);
        }
        this.groups.push(group);
        this.onFragmentsLoaded.trigger(group);
        return group;
    }
    /**
     * Export the specified fragments.
     * @param group - the fragments group to be exported.
     * @returns the exported data as binary buffer.
     */
    export(group) {
        return this._loader.export(group);
    }
    updateWindow() {
        for (const card of this._cards) {
            card.dispose();
        }
        for (const group of this.groups) {
            const card = new SimpleUICard(this._components);
            // TODO: Make all cards like this?
            card.domElement.classList.remove("bg-ifcjs-120");
            card.domElement.classList.remove("border-transparent");
            card.domElement.className += ` min-w-[300px] my-2 border-1 border-solid border-[#3A444E] `;
            const toolbar = new Toolbar(this._components);
            this._components.ui.addToolbar(toolbar);
            card.addChild(toolbar);
            card.title = group.name;
            this.uiElement.window.addChild(card);
            this._cards.push(card);
            // TODO: Use command list just like in fragment plans
            const commandsButton = new Button(this._components);
            commandsButton.materialIcon = "delete";
            commandsButton.tooltip = "Delete model";
            toolbar.addChild(commandsButton);
            commandsButton.onclick = () => this.disposeGroup(group);
        }
    }
    coordinate(models = this.groups) {
        const baseModel = this.groups.find((group) => group.uuid === this.baseCoordinationModel);
        if (!baseModel) {
            console.log("No base model found for coordination!");
            return;
        }
        for (const model of models) {
            if (model === baseModel) {
                continue;
            }
            model.position.set(0, 0, 0);
            model.rotation.set(0, 0, 0);
            model.scale.set(1, 1, 1);
            model.updateMatrix();
            model.applyMatrix4(model.coordinationMatrix.clone().invert());
            model.applyMatrix4(baseModel.coordinationMatrix);
        }
    }
    removeFragmentMesh(fragment) {
        const meshes = this._components.meshes;
        const mesh = fragment.mesh;
        if (meshes.includes(mesh)) {
            meshes.splice(meshes.indexOf(mesh), 1);
        }
    }
}
//# sourceMappingURL=index.js.map
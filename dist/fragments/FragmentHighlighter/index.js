import * as THREE from "three";
import { Component, Event } from "../../base-types";
import { FragmentBoundingBox } from "../FragmentBoundingBox";
import { toCompositeID } from "../../utils";
import { PostproductionRenderer } from "../../navigation";
export class FragmentHighlighter extends Component {
    get fillEnabled() {
        return this._fillEnabled;
    }
    set fillEnabled(value) {
        this._fillEnabled = value;
        if (!value) {
            this.clear();
        }
    }
    get outlineEnabled() {
        return this._outlineEnabled;
    }
    set outlineEnabled(value) {
        this._outlineEnabled = value;
        if (!value) {
            delete this._postproduction.customEffects.outlinedMeshes.fragments;
        }
    }
    get _postproduction() {
        if (!(this._components.renderer instanceof PostproductionRenderer)) {
            throw new Error("Postproduction renderer is needed for outlines!");
        }
        const renderer = this._components.renderer;
        return renderer.postproduction;
    }
    constructor(components, fragments) {
        super();
        this.name = "FragmentHighlighter";
        this.enabled = true;
        this.highlightMats = {};
        this.events = {};
        this.multiple = "ctrlKey";
        this.zoomFactor = 1.5;
        this.zoomToSelection = false;
        this.selection = {};
        this.excludeOutline = new Set();
        this.outlineMaterial = new THREE.MeshBasicMaterial({
            color: "white",
            transparent: true,
            depthTest: false,
            depthWrite: false,
            opacity: 0.4,
        });
        this._eventsActive = false;
        this._fillEnabled = true;
        this._outlineEnabled = true;
        this._outlinedMeshes = {};
        this._invisibleMaterial = new THREE.MeshBasicMaterial({ visible: false });
        this._tempMatrix = new THREE.Matrix4();
        this._bbox = new FragmentBoundingBox();
        this._default = {
            selectName: "select",
            hoverName: "hover",
            mouseDown: false,
            mouseMoved: false,
            selectionMaterial: new THREE.MeshBasicMaterial({
                color: "#BCF124",
                transparent: true,
                opacity: 0.85,
                depthTest: true,
            }),
            highlightMaterial: new THREE.MeshBasicMaterial({
                color: "#6528D7",
                transparent: true,
                opacity: 0.2,
                depthTest: true,
            }),
        };
        this.onMouseDown = () => {
            this._default.mouseDown = true;
        };
        this.onMouseUp = (event) => {
            if (event.target !== this._components.renderer.get().domElement)
                return;
            this._default.mouseDown = false;
            if (this._default.mouseMoved || event.button !== 0) {
                this._default.mouseMoved = false;
                return;
            }
            this._default.mouseMoved = false;
            const mult = this.multiple === "none" ? true : !event[this.multiple];
            this.highlight(this._default.selectName, mult, this.zoomToSelection);
        };
        this.onMouseMove = () => {
            if (this._default.mouseMoved) {
                this.clearFills(this._default.hoverName);
                return;
            }
            this._default.mouseMoved = true;
            if (!this._default.mouseDown) {
                this._default.mouseMoved = false;
            }
            this.highlight(this._default.hoverName, true, false);
        };
        this._components = components;
        this._fragments = fragments;
    }
    get() {
        return this.highlightMats;
    }
    dispose() {
        this.setupEvents(false);
        this._default.highlightMaterial.dispose();
        this._default.selectionMaterial.dispose();
        for (const matID in this.highlightMats) {
            const mats = this.highlightMats[matID] || [];
            for (const mat of mats) {
                mat.dispose();
            }
        }
        for (const id in this._outlinedMeshes) {
            const mesh = this._outlinedMeshes[id];
            mesh.geometry.dispose();
        }
        this.outlineMaterial.dispose();
        this._bbox.dispose();
        this._invisibleMaterial.dispose();
        this.highlightMats = {};
        this.selection = {};
        for (const name in this.events) {
            this.events[name].onClear.reset();
            this.events[name].onHighlight.reset();
        }
        this.events = {};
        this._components = null;
        this._fragments = null;
    }
    add(name, material) {
        if (this.highlightMats[name]) {
            throw new Error("A highlight with this name already exists.");
        }
        this.highlightMats[name] = material;
        this.selection[name] = {};
        this.events[name] = {
            onHighlight: new Event(),
            onClear: new Event(),
        };
        this.update();
    }
    update() {
        if (!this._fillEnabled) {
            return;
        }
        for (const fragmentID in this._fragments.list) {
            const fragment = this._fragments.list[fragmentID];
            this.addHighlightToFragment(fragment);
        }
    }
    highlight(name, removePrevious = true, zoomToSelection = this.zoomToSelection) {
        var _a;
        if (!this.enabled)
            return null;
        this.checkSelection(name);
        const fragments = [];
        const meshes = this._fragments.meshes;
        const result = this._components.raycaster.castRay(meshes);
        if (!result) {
            this.clear(name);
            return null;
        }
        const mesh = result.object;
        const geometry = mesh.geometry;
        const index = (_a = result.face) === null || _a === void 0 ? void 0 : _a.a;
        const instanceID = result.instanceId;
        if (!geometry || index === undefined || instanceID === undefined) {
            return null;
        }
        if (removePrevious) {
            this.clear(name);
        }
        if (!this.selection[name][mesh.uuid]) {
            this.selection[name][mesh.uuid] = new Set();
        }
        fragments.push(mesh.fragment);
        const blockID = mesh.fragment.getVertexBlockID(geometry, index);
        const itemID = mesh.fragment
            .getItemID(instanceID, blockID)
            .replace(/\..*/, "");
        const idNum = parseInt(itemID, 10);
        this.selection[name][mesh.uuid].add(itemID);
        this.addComposites(mesh, idNum, name);
        this.regenerate(name, mesh.uuid);
        const group = mesh.fragment.group;
        if (group) {
            const keys = group.data[idNum][0];
            for (let i = 0; i < keys.length; i++) {
                const fragKey = keys[i];
                const fragID = group.keyFragments[fragKey];
                const fragment = this._fragments.list[fragID];
                fragments.push(fragment);
                if (!this.selection[name][fragID]) {
                    this.selection[name][fragID] = new Set();
                }
                this.selection[name][fragID].add(itemID);
                this.addComposites(fragment.mesh, idNum, name);
                this.regenerate(name, fragID);
            }
        }
        this.events[name].onHighlight.trigger(this.selection[name]);
        if (zoomToSelection) {
            this.zoomSelection(name);
        }
        return { id: itemID, fragments };
    }
    highlightByID(name, ids, removePrevious = true, zoomToSelection = this.zoomToSelection) {
        if (!this.enabled)
            return;
        if (removePrevious) {
            this.clear(name);
        }
        const styles = this.selection[name];
        for (const fragID in ids) {
            if (!styles[fragID]) {
                styles[fragID] = new Set();
            }
            const fragment = this._fragments.list[fragID];
            const idsNum = new Set();
            for (const id of ids[fragID]) {
                styles[fragID].add(id);
                idsNum.add(parseInt(id, 10));
            }
            for (const id of idsNum) {
                this.addComposites(fragment.mesh, id, name);
            }
            this.regenerate(name, fragID);
        }
        this.events[name].onHighlight.trigger(this.selection[name]);
        if (zoomToSelection) {
            this.zoomSelection(name);
        }
    }
    /**
     * Clears any selection previously made by calling {@link highlight}.
     */
    clear(name) {
        this.clearFills(name);
        if (!name || !this.excludeOutline.has(name)) {
            this.clearOutlines();
        }
    }
    setup() {
        this.enabled = true;
        this.outlineMaterial.color.set(0xf0ff7a);
        this.excludeOutline.add(this._default.hoverName);
        this.add(this._default.selectName, [this._default.selectionMaterial]);
        this.add(this._default.hoverName, [this._default.highlightMaterial]);
        this.setupEvents(true);
    }
    regenerate(name, fragID) {
        if (this._fillEnabled) {
            this.updateFragmentFill(name, fragID);
        }
        if (this._outlineEnabled) {
            this.updateFragmentOutline(name, fragID);
        }
    }
    zoomSelection(name) {
        this._bbox.reset();
        const higlight = this.selection[name];
        if (!Object.keys(higlight).length) {
            return;
        }
        for (const fragID in higlight) {
            const fragment = this._fragments.list[fragID];
            const highlight = fragment.fragments[name];
            if (highlight) {
                this._bbox.addFragment(highlight);
            }
        }
        const sphere = this._bbox.getSphere();
        sphere.radius *= this.zoomFactor;
        const camera = this._components.camera;
        camera.controls.fitToSphere(sphere, true);
    }
    addComposites(mesh, itemID, name) {
        const composites = mesh.fragment.composites[itemID];
        if (composites) {
            for (let i = 1; i < composites; i++) {
                const compositeID = toCompositeID(itemID, i);
                this.selection[name][mesh.uuid].add(compositeID);
            }
        }
    }
    clearStyle(name) {
        for (const fragID in this.selection[name]) {
            const fragment = this._fragments.list[fragID];
            if (!fragment)
                continue;
            const selection = fragment.fragments[name];
            if (selection) {
                selection.mesh.removeFromParent();
            }
        }
        this.events[name].onClear.trigger(null);
        this.selection[name] = {};
    }
    updateFragmentFill(name, fragmentID) {
        const ids = this.selection[name][fragmentID];
        const fragment = this._fragments.list[fragmentID];
        if (!fragment)
            return;
        const selection = fragment.fragments[name];
        if (!selection)
            return;
        // #region Old child/parent code
        // const scene = this._components.scene.get();
        // scene.add(selection.mesh); //If we add selection.mesh directly to the scene, it won't be coordinated unless we do so manually.
        // #endregion
        // #region New child/parent code
        const fragmentParent = fragment.mesh.parent;
        if (!fragmentParent)
            return;
        fragmentParent.add(selection.mesh);
        // #endregion
        const isBlockFragment = selection.blocks.count > 1;
        if (isBlockFragment) {
            fragment.getInstance(0, this._tempMatrix);
            selection.setInstance(0, {
                ids: Array.from(fragment.ids),
                transform: this._tempMatrix,
            });
            selection.blocks.setVisibility(true, ids, true);
        }
        else {
            let i = 0;
            for (const id of ids) {
                selection.mesh.count = i + 1;
                const { instanceID } = fragment.getInstanceAndBlockID(id);
                fragment.getInstance(instanceID, this._tempMatrix);
                selection.setInstance(i, { ids: [id], transform: this._tempMatrix });
                i++;
            }
        }
    }
    checkSelection(name) {
        if (!this.selection[name]) {
            throw new Error(`Selection ${name} does not exist.`);
        }
    }
    addHighlightToFragment(fragment) {
        for (const name in this.highlightMats) {
            if (!fragment.fragments[name]) {
                const material = this.highlightMats[name];
                const subFragment = fragment.addFragment(name, material);
                if (fragment.blocks.count > 1) {
                    subFragment.setInstance(0, {
                        ids: Array.from(fragment.ids),
                        transform: this._tempMatrix,
                    });
                    subFragment.blocks.setVisibility(false);
                }
                subFragment.mesh.renderOrder = 2;
                subFragment.mesh.frustumCulled = false;
            }
        }
    }
    clearFills(name) {
        const names = name ? [name] : Object.keys(this.selection);
        for (const name of names) {
            this.clearStyle(name);
        }
    }
    clearOutlines() {
        const effects = this._postproduction.customEffects;
        const fragmentsOutline = effects.outlinedMeshes.fragments;
        if (fragmentsOutline) {
            fragmentsOutline.meshes.clear();
        }
        for (const fragID in this._outlinedMeshes) {
            const fragment = this._fragments.list[fragID];
            const isBlockFragment = fragment.blocks.count > 1;
            const mesh = this._outlinedMeshes[fragID];
            if (isBlockFragment) {
                mesh.geometry.setIndex([]);
            }
            else {
                mesh.count = 0;
            }
        }
    }
    updateFragmentOutline(name, fragmentID) {
        if (!this.selection[name][fragmentID]) {
            return;
        }
        if (this.excludeOutline.has(name)) {
            return;
        }
        const ids = this.selection[name][fragmentID];
        const fragment = this._fragments.list[fragmentID];
        if (!fragment)
            return;
        const geometry = fragment.mesh.geometry;
        const customEffects = this._postproduction.customEffects;
        if (!customEffects.outlinedMeshes.fragments) {
            customEffects.outlinedMeshes.fragments = {
                meshes: new Set(),
                material: this.outlineMaterial,
            };
        }
        const outlineEffect = customEffects.outlinedMeshes.fragments;
        // Create a copy of the original fragment mesh for outline
        if (!this._outlinedMeshes[fragmentID]) {
            const newGeometry = new THREE.BufferGeometry();
            newGeometry.attributes = geometry.attributes;
            const newMesh = new THREE.InstancedMesh(newGeometry, this._invisibleMaterial, fragment.capacity);
            newMesh.frustumCulled = false;
            newMesh.renderOrder = 999;
            this._outlinedMeshes[fragmentID] = newMesh;
            const scene = this._components.scene.get();
            scene.add(newMesh);
        }
        const outlineMesh = this._outlinedMeshes[fragmentID];
        outlineEffect.meshes.add(outlineMesh);
        const isBlockFragment = fragment.blocks.count > 1;
        if (isBlockFragment) {
            const indices = fragment.mesh.geometry.index.array;
            const newIndex = [];
            const idsSet = new Set(ids);
            for (let i = 0; i < indices.length - 2; i += 3) {
                const index = indices[i];
                const blockID = fragment.mesh.geometry.attributes.blockID.array;
                const block = blockID[index];
                const itemID = fragment.mesh.fragment.getItemID(0, block);
                if (idsSet.has(itemID)) {
                    newIndex.push(indices[i], indices[i + 1], indices[i + 2]);
                }
            }
            outlineMesh.geometry.setIndex(newIndex);
        }
        else {
            let counter = 0;
            for (const id of ids) {
                const { instanceID } = fragment.getInstanceAndBlockID(id);
                fragment.mesh.getMatrixAt(instanceID, this._tempMatrix);
                outlineMesh.setMatrixAt(counter++, this._tempMatrix);
            }
            outlineMesh.count = counter;
            outlineMesh.instanceMatrix.needsUpdate = true;
        }
    }
    setupEvents(active) {
        const container = this._components.renderer.get().domElement;
        if (active === this._eventsActive) {
            return;
        }
        this._eventsActive = active;
        if (active) {
            container.addEventListener("mousedown", this.onMouseDown);
            container.addEventListener("mouseup", this.onMouseUp);
            container.addEventListener("mousemove", this.onMouseMove);
        }
        else {
            container.removeEventListener("mousedown", this.onMouseDown);
            container.removeEventListener("mouseup", this.onMouseUp);
            container.removeEventListener("mousemove", this.onMouseMove);
        }
    }
}
//# sourceMappingURL=index.js.map
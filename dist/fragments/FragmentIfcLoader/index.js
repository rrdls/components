import * as WEBIFC from "web-ifc";
import { Event, Component } from "../../base-types";
import { DataConverter, GeometryReader } from "./src";
import { Button, ToastNotification } from "../../ui";
export * from "./src/types";
/**
 * Reads all the geometry of the IFC file and generates a set of
 * [fragments](https://github.com/ifcjs/fragment). It can also return the
 * properties as a JSON file, as well as other sets of information within
 * the IFC file.
 */
export class FragmentIfcLoader extends Component {
    constructor(components, fragments) {
        super();
        this.name = "FragmentIfcLoader";
        this.enabled = true;
        this.ifcLoaded = new Event();
        // For debugging purposes
        // isolatedItems = new Set<number>();
        this.locationsSaved = new Event();
        this._webIfc = new WEBIFC.IfcAPI();
        this._geometry = new GeometryReader();
        this._converter = new DataConverter();
        this._components = components;
        this._fragments = fragments;
        this.uiElement = { main: this.setupOpenButton() };
        this._toast = new ToastNotification(components, {
            message: "IFC model successfully loaded!",
        });
        components.ui.add(this._toast);
        this._toast.visible = false;
    }
    get() {
        return this._webIfc;
    }
    get settings() {
        return this._converter.settings;
    }
    /** {@link Disposable.dispose} */
    dispose() {
        this._geometry.cleanUp();
        this._converter.cleanUp();
        this.ifcLoaded.reset();
        this.locationsSaved.reset();
        this._toast.dispose();
        this.uiElement.main.dispose();
        this._webIfc = null;
        this._geometry = null;
        this._converter = null;
    }
    /** Loads the IFC file and converts it to a set of fragments. */
    async load(data, name) {
        if (this.settings.saveLocations) {
            this._geometry.saveLocations = true;
        }
        const before = performance.now();
        await this.readIfcFile(data);
        await this.readAllGeometries();
        const items = this._geometry.items;
        const model = await this._converter.generate(this._webIfc, items);
        model.name = name;
        if (this.settings.saveLocations) {
            this.locationsSaved.trigger(this._geometry.locations);
        }
        if (this.settings.coordinate) {
            const isFirstModel = this._fragments.groups.length === 0;
            if (isFirstModel) {
                this._fragments.baseCoordinationModel = model.uuid;
            }
            else {
                this._fragments.coordinate([model]);
            }
        }
        this.cleanUp();
        this._fragments.groups.push(model);
        for (const fragment of model.items) {
            fragment.group = model;
            this._fragments.list[fragment.id] = fragment;
            this._components.meshes.push(fragment.mesh);
        }
        this.ifcLoaded.trigger(model);
        console.log(`Loading the IFC took ${performance.now() - before} ms!`);
        return model;
    }
    setupOpenButton() {
        const button = new Button(this._components);
        button.materialIcon = "upload_file";
        button.tooltip = "Load IFC";
        const fileOpener = document.createElement("input");
        fileOpener.type = "file";
        fileOpener.accept = ".ifc";
        fileOpener.style.display = "none";
        document.body.appendChild(fileOpener);
        fileOpener.onchange = async () => {
            if (fileOpener.files === null || fileOpener.files.length === 0)
                return;
            const file = fileOpener.files[0];
            const buffer = await file.arrayBuffer();
            const data = new Uint8Array(buffer);
            const model = await this.load(data, file.name);
            const scene = this._components.scene.get();
            scene.add(model);
            this._toast.visible = true;
            button.onClicked.trigger(model);
            this._fragments.updateWindow();
        };
        button.onclick = () => fileOpener.click();
        return button;
    }
    async readIfcFile(data) {
        const { path, absolute } = this.settings.wasm;
        this._webIfc.SetWasmPath(path, absolute);
        await this._webIfc.Init();
        this._webIfc.OpenModel(data, this.settings.webIfc);
    }
    async readAllGeometries() {
        this._converter.saveIfcCategories(this._webIfc);
        // Some categories (like IfcSpace) need to be created explicitly
        const optionals = this.settings.optionalCategories;
        // Force IFC space to be transparent
        if (optionals.includes(WEBIFC.IFCSPACE)) {
            const index = optionals.indexOf(WEBIFC.IFCSPACE);
            optionals.splice(index, 1);
            this._webIfc.StreamAllMeshesWithTypes(0, [WEBIFC.IFCSPACE], (mesh) => {
                if (this.isExcluded(mesh.expressID)) {
                    return;
                }
                this._geometry.streamMesh(this._webIfc, mesh, true);
            });
        }
        // Load rest of optional categories (if any)
        if (optionals.length) {
            this._webIfc.StreamAllMeshesWithTypes(0, optionals, (mesh) => {
                if (this.isExcluded(mesh.expressID)) {
                    return;
                }
                this._geometry.streamMesh(this._webIfc, mesh);
            });
        }
        // Load common categories
        this._webIfc.StreamAllMeshes(0, (mesh) => {
            if (this.isExcluded(mesh.expressID)) {
                return;
            }
            this._geometry.streamMesh(this._webIfc, mesh);
        });
    }
    cleanUp() {
        this._webIfc = null;
        this._webIfc = new WEBIFC.IfcAPI();
        this._geometry.cleanUp();
        this._converter.cleanUp();
    }
    isExcluded(id) {
        const category = this._converter.categories[id];
        return this.settings.excludedCategories.has(category);
    }
}
//# sourceMappingURL=index.js.map
import { ModelDatabase } from "./db";
import { Component, Event } from "../../base-types";
import { Button, FloatingWindow } from "../../ui";
// TODO: Implement UI elements (this is probably just for 3d scans)
export class LocalCacher extends Component {
    get ids() {
        const serialized = localStorage.getItem(this._storedModels) || "[]";
        return JSON.parse(serialized);
    }
    constructor(components) {
        super();
        this.name = "LocalCacher";
        this.enabled = true;
        this.fileLoaded = new Event();
        this.itemSaved = new Event();
        this._cards = [];
        this._storedModels = "open-bim-components-stored-files";
        this._components = components;
        this._db = new ModelDatabase();
        const main = new Button(components);
        main.materialIcon = "storage";
        main.tooltip = "Local cacher";
        const saveButton = new Button(components);
        saveButton.label = "Save";
        saveButton.materialIcon = "save";
        main.addChild(saveButton);
        const loadButton = new Button(components);
        loadButton.label = "Download";
        loadButton.materialIcon = "download";
        main.addChild(loadButton);
        this.uiElement = { main, loadButton, saveButton };
        const renderer = this._components.renderer.get();
        const viewerContainer = renderer.domElement.parentElement;
        this.floatingMenu = new FloatingWindow(components, "file-list-menu");
        this.floatingMenu.title = "Saved Files";
        this.floatingMenu.visible = false;
        const savedFilesMenuHTML = this.floatingMenu.get();
        savedFilesMenuHTML.style.left = "70px";
        savedFilesMenuHTML.style.top = "100px";
        savedFilesMenuHTML.style.width = "340px";
        savedFilesMenuHTML.style.height = "400px";
        viewerContainer.appendChild(this.floatingMenu.get());
        saveButton.onclick = () => {
            if (this.floatingMenu.visible) {
                this.floatingMenu.visible = false;
            }
        };
    }
    async get(id) {
        if (this.exists(id)) {
            await this._db.open();
            const result = await this.getModelFromLocalCache(id);
            this._db.close();
            return result;
        }
        return null;
    }
    async save(id, url) {
        this.addStoredID(id);
        const rawData = await fetch(url);
        const file = await rawData.blob();
        await this._db.open();
        await this._db.models.add({
            id,
            file,
        });
        this._db.close();
    }
    exists(id) {
        const stored = localStorage.getItem(id);
        return stored !== null;
    }
    async delete(ids) {
        await this._db.open();
        for (const id of ids) {
            if (this.exists(id)) {
                this.removeStoredID(id);
                await this._db.models.where("id").equals(id).delete();
            }
        }
        this._db.close();
    }
    async deleteAll() {
        await this._db.open();
        this.clearStoredIDs();
        await this._db.delete();
        this._db = new ModelDatabase();
        this._db.close();
    }
    dispose() {
        this.fileLoaded.reset();
        this.itemSaved.reset();
        for (const card of this._cards) {
            card.dispose();
        }
        this._cards = [];
        this.uiElement.main.dispose();
        this.uiElement.saveButton.dispose();
        this.uiElement.loadButton.dispose();
        this.floatingMenu.dispose();
        this._db = null;
        this._components = null;
    }
    async getModelFromLocalCache(id) {
        const found = await this._db.models.where("id").equals(id).toArray();
        return found[0].file;
    }
    clearStoredIDs() {
        const ids = this.ids;
        for (const id of ids) {
            this.removeStoredID(id);
        }
    }
    removeStoredID(id) {
        localStorage.removeItem(id);
        const allIDs = this.ids;
        const ids = allIDs.filter((savedId) => savedId !== id);
        this.setStoredIDs(ids);
    }
    addStoredID(id) {
        const time = performance.now().toString();
        localStorage.setItem(id, time);
        const ids = this.ids;
        ids.push(id);
        this.setStoredIDs(ids);
    }
    setStoredIDs(ids) {
        localStorage.setItem(this._storedModels, JSON.stringify(ids));
    }
}
//# sourceMappingURL=index.js.map
import { Component } from "../../base-types";
import { Button, CheckboxInput, FloatingWindow, SimpleUIComponent, TextInput, } from "../../ui";
import { IfcPropertiesFinder } from "../../ifc";
export class FragmentHider extends Component {
    constructor(components, fragments, culler, loadCached = true) {
        super();
        this.name = "FragmentHider";
        this.enabled = true;
        this._localStorageID = "FragmentHiderCache";
        this._updateVisibilityOnFound = true;
        this._filterCards = {};
        this._components = components;
        this._fragments = fragments;
        this._culler = culler;
        const mainWindow = new FloatingWindow(components);
        mainWindow.title = "Filters";
        mainWindow.visible = false;
        components.ui.add(mainWindow);
        mainWindow.domElement.style.width = "530px";
        mainWindow.domElement.style.height = "400px";
        const mainButton = new Button(components, {
            materialIconName: "filter_alt",
            tooltip: "Visibility filters",
        });
        mainButton.onclick = () => {
            this.hideAllFinders();
            mainWindow.visible = !mainWindow.visible;
        };
        const topButtonContainerHtml = `<div class="flex"></div>`;
        const topButtonContainer = new SimpleUIComponent(components, topButtonContainerHtml);
        const createButton = new Button(components, {
            materialIconName: "add",
        });
        createButton.onclick = () => this.createStyleCard();
        topButtonContainer.addChild(createButton);
        mainWindow.addChild(topButtonContainer);
        this.uiElement = { window: mainWindow, main: mainButton };
        if (loadCached) {
            this.loadCached();
        }
    }
    dispose() {
        this.uiElement.main.dispose();
        this.uiElement.window.dispose();
        this._components = null;
        this._fragments = null;
        this._culler = null;
    }
    set(visible, items) {
        if (!items) {
            for (const id in this._fragments.list) {
                const fragment = this._fragments.list[id];
                if (fragment) {
                    fragment.setVisibility(visible);
                    this.updateCulledVisibility(fragment);
                }
            }
            return;
        }
        for (const fragID in items) {
            const ids = items[fragID];
            const fragment = this._fragments.list[fragID];
            fragment.setVisibility(visible, ids);
            this.updateCulledVisibility(fragment);
        }
    }
    isolate(items) {
        this.set(false);
        this.set(true, items);
    }
    get() { }
    update() {
        this._updateVisibilityOnFound = false;
        for (const id in this._filterCards) {
            const { finder } = this._filterCards[id];
            finder.find();
        }
        this._updateVisibilityOnFound = true;
        this.updateQueries();
    }
    updateCulledVisibility(fragment) {
        if (this._culler) {
            const culled = this._culler.colorMeshes.get(fragment.id);
            if (culled) {
                culled.count = fragment.mesh.count;
            }
        }
    }
    createStyleCard(config) {
        const filterCard = new SimpleUIComponent(this._components);
        if (config && config.id.length) {
            filterCard.id = config.id;
        }
        const { id } = filterCard;
        filterCard.domElement.className = `m-4 p-4 border-1 border-solid border-[#3A444E] rounded-md flex flex-col`;
        filterCard.domElement.innerHTML = `
        <div id="top-container-${id}" class="flex">
        </div>
        <div id="bottom-container-${id}" class="flex gap-4 items-center">
        </div>
    `;
        const deleteButton = new Button(this._components, {
            materialIconName: "close",
        });
        deleteButton.domElement.classList.add("self-end");
        deleteButton.onclick = () => this.deleteStyleCard(id);
        const topContainer = filterCard.getInnerElement("top-container");
        if (topContainer) {
            topContainer.appendChild(deleteButton.domElement);
        }
        const bottomContainer = filterCard.getInnerElement("bottom-container");
        if (!bottomContainer) {
            throw new Error("Error creating UI elements!");
        }
        const name = new TextInput(this._components);
        name.label = "Name";
        name.domElement.addEventListener("focusout", () => {
            this.cache();
        });
        if (config) {
            name.value = config.name;
        }
        bottomContainer.append(name.domElement);
        const visible = new CheckboxInput(this._components);
        visible.value = config ? config.visible : true;
        visible.label = "Visible";
        visible.onChange.on(() => this.updateQueries());
        const enabled = new CheckboxInput(this._components);
        enabled.value = config ? config.enabled : true;
        enabled.label = "Enabled";
        enabled.onChange.on(() => this.updateQueries());
        const checkBoxContainer = new SimpleUIComponent(this._components);
        checkBoxContainer.domElement.classList.remove("w-full");
        checkBoxContainer.addChild(visible);
        checkBoxContainer.addChild(enabled);
        bottomContainer.append(checkBoxContainer.domElement);
        const finder = new IfcPropertiesFinder(this._components, this._fragments);
        finder.loadCached(id);
        finder.uiElement.query.findButton.label = "Apply";
        bottomContainer.append(finder.uiElement.main.domElement);
        const window = finder.uiElement.queryWindow;
        window.onVisible.on(() => {
            this.hideAllFinders(window.id);
            const rect = finder.uiElement.main.domElement.getBoundingClientRect();
            window.domElement.style.left = `${rect.x + 90}px`;
            window.domElement.style.top = `${rect.y - 120}px`;
        });
        finder.onFound.on((data) => {
            const { queryWindow, main } = finder.uiElement;
            queryWindow.visible = false;
            main.active = false;
            finder.uiElement.main.active = false;
            this._filterCards[id].fragments = data;
            this.cache();
            if (this._updateVisibilityOnFound) {
                this.updateQueries();
            }
        });
        const fragments = {};
        this._filterCards[id] = {
            styleCard: filterCard,
            fragments,
            name,
            finder,
            deleteButton,
            visible,
            enabled,
        };
        this.uiElement.window.addChild(filterCard);
        // this.cacheStyles();
    }
    updateQueries() {
        this.set(true);
        for (const id in this._filterCards) {
            const { enabled, visible, fragments } = this._filterCards[id];
            if (enabled.value) {
                this.set(visible.value, fragments);
            }
        }
        this.cache();
    }
    deleteStyleCard(id) {
        const found = this._filterCards[id];
        if (found) {
            found.styleCard.dispose();
            found.deleteButton.dispose();
            found.name.dispose();
            found.finder.deleteCache();
            found.finder.dispose();
            found.visible.dispose();
            found.enabled.dispose();
        }
        delete this._filterCards[id];
        this.updateQueries();
    }
    hideAllFinders(excludeID) {
        for (const id in this._filterCards) {
            const { finder } = this._filterCards[id];
            const window = finder.uiElement.queryWindow;
            if (window.id === excludeID) {
                continue;
            }
            if (finder.uiElement.queryWindow.visible) {
                finder.uiElement.main.domElement.click();
            }
        }
    }
    loadCached() {
        const serialized = localStorage.getItem(this._localStorageID);
        if (!serialized)
            return;
        const filters = JSON.parse(serialized);
        for (const filter of filters) {
            this.createStyleCard(filter);
        }
        this.update();
    }
    cache() {
        const filters = [];
        for (const id in this._filterCards) {
            const styleCard = this._filterCards[id];
            const { visible, enabled, name } = styleCard;
            filters.push({
                visible: visible.value,
                enabled: enabled.value,
                name: name.value,
                id,
            });
        }
        const serialized = JSON.stringify(filters);
        localStorage.setItem(this._localStorageID, serialized);
    }
}
//# sourceMappingURL=index.js.map
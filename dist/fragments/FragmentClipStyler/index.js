import * as THREE from "three";
import { Component } from "../../base-types";
import { Button, ColorInput, FloatingWindow, RangeInput, SimpleUIComponent, TextInput, } from "../../ui";
export class FragmentClipStyler extends Component {
    constructor(components, fragments, classifier, clipper) {
        super();
        this.name = "FragmentClipStyler";
        this.enabled = true;
        this._localStorageID = "FragmentClipStyler";
        this._styleCards = {};
        this._defaultStyles = `
     {
        "B0ebxzZQvZ": {
            "name": "thick",
            "lineColor": "#36593e",
            "lineThickness": 0.5,
            "fillColor": "#ccdb9a",
            "categories": "IFCWALLSTANDARDCASE, IFCWALL,IFCSLAB, IFCROOF"
        },
        "kG9B1Ojv08": {
            "name": "thin",
            "lineColor": "#92a59b",
            "lineThickness": 0.25,
            "fillColor": "#e6ffdb",
            "categories": "IFCWINDOW, IFCDOOR"
        }
    }
  `;
        this._components = components;
        this._fragments = fragments;
        this._clipper = clipper;
        this._classifier = classifier;
        const mainWindow = new FloatingWindow(components);
        mainWindow.title = "Clipping styles";
        mainWindow.visible = false;
        components.ui.add(mainWindow);
        mainWindow.domElement.style.width = "530px";
        mainWindow.domElement.style.height = "400px";
        const mainButton = new Button(components, {
            materialIconName: "format_paint",
            tooltip: "Clipping styles",
        });
        mainButton.onclick = () => {
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
        this.uiElement = { mainWindow, mainButton };
        this.loadCachedStyles();
    }
    setup(force = false) {
        const noCards = Object.keys(this._styleCards).length === 0;
        if (force || noCards) {
            localStorage.setItem(this._localStorageID, this._defaultStyles);
            this.loadCachedStyles();
        }
    }
    get() {
        const saved = localStorage.getItem(this._localStorageID);
        if (saved) {
            const parsed = JSON.parse(saved);
            return Object.values(parsed);
        }
        return [];
    }
    dispose() {
        for (const id in this._styleCards) {
            this.deleteStyleCard(id, false);
        }
        this.uiElement.mainWindow.dispose();
        this.uiElement.mainButton.dispose();
        this._clipper = null;
        this._classifier = null;
        this._components = null;
        this._fragments = null;
    }
    update(ids = Object.keys(this._styleCards)) {
        for (const id of ids) {
            const card = this._styleCards[id];
            if (!card)
                return;
            const allStyles = this._clipper.styles.get();
            const style = allStyles[id];
            if (!style)
                return;
            style.meshes.clear();
            const categoryList = card.categories.value.split(",");
            const entities = categoryList.map((item) => item.replace(" ", ""));
            const found = this._classifier.find({ entities });
            for (const fragID in found) {
                const { mesh } = this._fragments.list[fragID];
                style.fragments[fragID] = new Set(found[fragID]);
                style.meshes.add(mesh);
            }
        }
        this._clipper.updateEdges(true);
        this.cacheStyles();
    }
    loadCachedStyles() {
        const savedData = localStorage.getItem(this._localStorageID);
        if (savedData) {
            const savedStyles = JSON.parse(savedData);
            for (const id in savedStyles) {
                const savedStyle = savedStyles[id];
                this.createStyleCard(savedStyle);
            }
        }
    }
    cacheStyles() {
        const styles = {};
        for (const id in this._styleCards) {
            const styleCard = this._styleCards[id];
            styles[id] = {
                name: styleCard.name.value,
                lineColor: styleCard.lineColor.value,
                lineThickness: styleCard.lineThickness.value,
                fillColor: styleCard.fillColor.value,
                categories: styleCard.categories.value,
            };
        }
        const serialized = JSON.stringify(styles);
        localStorage.setItem(this._localStorageID, serialized);
    }
    deleteStyleCard(id, updateCache = true) {
        const found = this._styleCards[id];
        this._clipper.styles.deleteStyle(id, true);
        if (found) {
            found.styleCard.dispose();
            found.deleteButton.dispose();
            found.name.dispose();
            found.categories.dispose();
            found.lineThickness.dispose();
            found.lineColor.dispose();
            found.fillColor.dispose();
        }
        delete this._styleCards[id];
        this._clipper.updateEdges(true);
        if (updateCache) {
            this.cacheStyles();
        }
    }
    createStyleCard(config) {
        const styleCard = new SimpleUIComponent(this._components);
        const { id } = styleCard;
        const styleRowClass = `flex gap-4`;
        styleCard.domElement.className = `m-4 p-4 border-1 border-solid border-[#3A444E] rounded-md flex flex-col gap-4`;
        styleCard.domElement.innerHTML = `
        <div id="first-row-${id}" class="${styleRowClass}">
        </div>
        <div class="${styleRowClass}">
            <div id="name-${id}" class="flex-1">
            </div>
            <div id="line-color-${id}">
            </div>
        </div>
        <div class="${styleRowClass}">
            <div id="range-${id}" class="flex-1">
            </div>
            <div id="fill-color-${id}">
            </div>
        </div>
        <div id="categories-${id}">
        </div>
    `;
        const deleteButton = new Button(this._components, {
            materialIconName: "close",
        });
        deleteButton.onclick = () => this.deleteStyleCard(id);
        const firstRow = styleCard.getInnerElement("first-row");
        if (firstRow) {
            firstRow.insertBefore(deleteButton.domElement, firstRow.firstChild);
        }
        const nameInput = new TextInput(this._components);
        nameInput.label = "Name";
        if (config) {
            nameInput.value = config.name;
        }
        const name = styleCard.getInnerElement(`name`);
        if (name) {
            name.append(nameInput.domElement);
        }
        nameInput.domElement.addEventListener("focusout", () => this.cacheStyles());
        const lineColor = new ColorInput(this._components);
        lineColor.label = "Line color";
        const lineColorContainer = styleCard.getInnerElement("line-color");
        if (lineColorContainer) {
            lineColorContainer.append(lineColor.domElement);
        }
        lineColor.value = config ? config.lineColor : "#808080";
        const fillColor = new ColorInput(this._components);
        fillColor.label = "Fill color";
        if (config) {
            fillColor.value = config.fillColor;
        }
        const fillColorContainer = styleCard.getInnerElement("fill-color");
        if (fillColorContainer) {
            fillColorContainer.append(fillColor.domElement);
        }
        const lineThickness = new RangeInput(this._components);
        lineThickness.label = "Line thickness";
        lineThickness.min = 0;
        lineThickness.max = 1;
        lineThickness.step = 0.05;
        lineThickness.value = config ? config.lineThickness : 0.25;
        const range = styleCard.getInnerElement("range");
        if (range) {
            range.append(lineThickness.domElement);
        }
        const categories = new TextInput(this._components);
        categories.label = "Categories";
        const categoriesContainer = styleCard.getInnerElement("categories");
        if (categoriesContainer) {
            categoriesContainer.append(categories.domElement);
        }
        this._styleCards[id] = {
            styleCard,
            name: nameInput,
            lineThickness,
            categories,
            deleteButton,
            fillColor,
            lineColor,
        };
        this.uiElement.mainWindow.addChild(styleCard);
        // this._clipper.styles.dispose();
        const fillMaterial = new THREE.MeshBasicMaterial({
            color: fillColor.value,
            side: 2,
        });
        let saveTimer;
        const saveStyles = () => {
            if (saveTimer) {
                clearTimeout(saveTimer);
            }
            saveTimer = setTimeout(() => this.cacheStyles(), 2000);
        };
        fillColor.onChange.on(() => {
            fillMaterial.color.set(fillColor.value);
            saveStyles();
        });
        const lineMaterial = new THREE.LineBasicMaterial({
            color: lineColor.value,
        });
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: lineColor.value,
            opacity: lineThickness.value,
            side: 2,
            transparent: true,
        });
        lineThickness.onChange.on(() => {
            outlineMaterial.opacity = lineThickness.value;
            saveStyles();
        });
        lineColor.onChange.on(() => {
            lineMaterial.color.set(lineColor.value);
            outlineMaterial.color.set(lineColor.value);
            saveStyles();
        });
        this._clipper.styles.create(id, new Set(), lineMaterial, fillMaterial, outlineMaterial);
        categories.domElement.addEventListener("focusout", () => this.update([id]));
        if (config) {
            categories.value = config.categories;
        }
        this.cacheStyles();
    }
}
//# sourceMappingURL=index.js.map
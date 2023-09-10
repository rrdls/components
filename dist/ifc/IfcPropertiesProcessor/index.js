import * as WEBIFC from "web-ifc";
import { IfcPropertiesUtils } from "../IfcPropertiesUtils";
import { Button } from "../../ui/ButtonComponent";
import { Event } from "../../base-types";
import { Component } from "../../base-types/component";
import { FloatingWindow, SimpleUIComponent, TreeView } from "../../ui";
import { IfcPropertiesManager } from "../IfcPropertiesManager";
import { IfcCategoryMap } from "../ifc-category-map";
import { AttributeSet, PropertyTag } from "./src";
export class IfcPropertiesProcessor extends Component {
    // private _entityUIPool: UIPool<TreeView>;
    set propertiesManager(manager) {
        if (this._propertiesManager)
            return;
        this._propertiesManager = manager;
        if (manager) {
            manager.onElementToPset.on(({ model, psetID, elementID }) => {
                const modelIndexMap = this._indexMap[model.uuid];
                if (!modelIndexMap)
                    return;
                this.setEntityIndex(model, elementID).add(psetID);
                if (this._currentUI[elementID]) {
                    const ui = this.newPsetUI(model, psetID);
                    this._currentUI[elementID].addChild(...ui);
                }
            });
            manager.onPsetRemoved.on(({ psetID }) => {
                const psetUI = this._currentUI[psetID];
                if (psetUI)
                    psetUI.dispose();
            });
            manager.onPropToPset.on(({ model, psetID, propID }) => {
                const psetUI = this._currentUI[psetID];
                if (!psetUI)
                    return;
                const tag = this.newPropertyTag(model, psetID, propID, "NominalValue");
                if (tag)
                    psetUI.addChild(tag);
            });
            this.onPropertiesManagerSet.trigger(manager);
        }
    }
    get propertiesManager() {
        return this._propertiesManager;
    }
    constructor(components) {
        super();
        this.name = "PropertiesParser";
        this.enabled = true;
        this.relationsToProcess = [
            WEBIFC.IFCRELDEFINESBYPROPERTIES,
            WEBIFC.IFCRELDEFINESBYTYPE,
            WEBIFC.IFCRELASSOCIATESMATERIAL,
            WEBIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE,
            WEBIFC.IFCRELASSOCIATESCLASSIFICATION,
            WEBIFC.IFCRELASSIGNSTOGROUP,
        ];
        this.entitiesToIgnore = [WEBIFC.IFCOWNERHISTORY, WEBIFC.IFCMATERIALLAYERSETUSAGE];
        this.attributesToIgnore = [
            "CompositionType",
            "Representation",
            "ObjectPlacement",
            "OwnerHistory",
        ];
        this._indexMap = {};
        this._renderFunctions = {};
        this._propertiesManager = null;
        this._currentUI = {};
        this.onPropertiesManagerSet = new Event();
        this._components = components;
        // this._entityUIPool = new UIPool(this._components, TreeView);
        this._topToolbar = new SimpleUIComponent(this._components);
        this._propsList = new SimpleUIComponent(this._components, `<div class="flex flex-col"></div>`);
        this.uiElement = {
            main: new Button(components, {
                materialIconName: "list",
            }),
            propertiesWindow: new FloatingWindow(components),
        };
        this.setUI();
        this._renderFunctions = {
            0: (model, expressID) => this.newEntityUI(model, expressID),
            [WEBIFC.IFCPROPERTYSET]: (model, expressID) => this.newPsetUI(model, expressID),
            [WEBIFC.IFCELEMENTQUANTITY]: (model, expressID) => this.newQsetUI(model, expressID),
        };
    }
    dispose() {
        this.uiElement.main.dispose();
        this.uiElement.propertiesWindow.dispose();
        this._components = null;
        this._topToolbar.dispose();
        this._propsList.dispose();
        this._indexMap = {};
        this.propertiesManager = null;
        this._components = null;
        for (const id in this._currentUI) {
            this._currentUI[id].dispose();
        }
        this._currentUI = {};
        this.onPropertiesManagerSet.reset();
    }
    getProperties(model, id) {
        if (!model.properties)
            return null;
        const map = this._indexMap[model.uuid];
        if (!map)
            return null;
        const indices = map[id];
        const idNumber = parseInt(id, 10);
        const properties = [model.properties[idNumber]];
        if (indices) {
            for (const index of indices) {
                const pset = model.properties[index];
                if (!pset)
                    continue;
                this.getPsetProperties(pset, model.properties);
                this.getNestedPsets(pset, model.properties);
                properties.push(pset);
            }
        }
        return properties;
    }
    getNestedPsets(pset, props) {
        if (pset.HasPropertySets) {
            for (const subPSet of pset.HasPropertySets) {
                const psetID = subPSet.value;
                subPSet.value = props[psetID];
                this.getPsetProperties(subPSet.value, props);
            }
        }
    }
    getPsetProperties(pset, props) {
        if (pset.HasProperties) {
            for (const property of pset.HasProperties) {
                const psetID = property.value;
                property.value = props[psetID];
            }
        }
    }
    setUI() {
        this._components.ui.add(this.uiElement.propertiesWindow);
        this.uiElement.propertiesWindow.title = "Element Properties";
        this.uiElement.propertiesWindow.addChild(this._topToolbar, this._propsList);
        this.uiElement.main.tooltip = "Properties";
        this.uiElement.main.onclick = () => {
            this.uiElement.propertiesWindow.visible =
                !this.uiElement.propertiesWindow.visible;
        };
        this.uiElement.propertiesWindow.onHidden.on(() => (this.uiElement.main.active = false));
        this.uiElement.propertiesWindow.onVisible.on(() => (this.uiElement.main.active = true));
        this.uiElement.propertiesWindow.visible = false;
    }
    cleanPropertiesList() {
        if (this._propertiesManager) {
            this._propertiesManager.uiElement.exportButton.removeFromParent();
        }
        this._propsList.dispose(true);
        // for (const child of this._propsList.children) {
        //   if (child instanceof TreeView) {
        //     this._entityUIPool.return(child);
        //     continue;
        //   }
        //   child.dispose();
        // }
        this.uiElement.propertiesWindow.description = null;
        this._propsList.children = [];
        this._currentUI = {};
    }
    get() {
        return this._indexMap;
    }
    process(model) {
        const properties = model.properties;
        if (!properties)
            throw new Error("FragmentsGroup properties not found");
        this._indexMap[model.uuid] = {};
        // const relations: number[] = [];
        // for (const typeID in IfcCategoryMap) {
        //   const name = IfcCategoryMap[typeID];
        //   if (name.startsWith("IFCREL")) relations.push(Number(typeID));
        // }
        const setEntities = [WEBIFC.IFCPROPERTYSET, WEBIFC.IFCELEMENTQUANTITY];
        for (const relation of this.relationsToProcess) {
            IfcPropertiesUtils.getRelationMap(properties, relation, (relationID, relatedIDs) => {
                const relationEntity = properties[relationID];
                if (!setEntities.includes(relationEntity.type))
                    this.setEntityIndex(model, relationID);
                for (const expressID of relatedIDs) {
                    this.setEntityIndex(model, expressID).add(relationID);
                }
            });
        }
    }
    renderProperties(model, expressID) {
        this.cleanPropertiesList();
        const ui = this.newEntityUI(model, expressID);
        if (!ui)
            return;
        if (this._propertiesManager) {
            this._propertiesManager.selectedModel = model;
            const exporter = this._propertiesManager.uiElement.exportButton;
            this._topToolbar.addChild(exporter);
        }
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const { name } = IfcPropertiesUtils.getEntityName(properties, expressID);
        this.uiElement.propertiesWindow.description = name;
        this._propsList.addChild(...[ui].flat());
    }
    newEntityUI(model, expressID) {
        const properties = model.properties;
        if (!properties)
            throw new Error("FragmentsGroup properties not found.");
        const modelElementsIndexation = this._indexMap[model.uuid];
        if (!modelElementsIndexation)
            return null;
        const entity = properties[expressID];
        const ignorable = this.entitiesToIgnore.includes(entity === null || entity === void 0 ? void 0 : entity.type);
        if (!entity || ignorable)
            return null;
        if (entity.type === WEBIFC.IFCPROPERTYSET)
            return this.newPsetUI(model, expressID);
        const mainGroup = this.newEntityTree(model, expressID);
        if (!mainGroup)
            return null;
        this.addEntityActions(model, expressID, mainGroup);
        mainGroup.onExpand.on(() => {
            var _a, _b;
            const { uiProcessed } = mainGroup.data;
            if (uiProcessed)
                return;
            mainGroup.addChild(...this.newAttributesUI(model, expressID));
            const elementPropsIndexation = (_a = modelElementsIndexation[expressID]) !== null && _a !== void 0 ? _a : [];
            for (const id of elementPropsIndexation) {
                const entity = properties[id];
                if (!entity)
                    continue;
                const renderFunction = (_b = this._renderFunctions[entity.type]) !== null && _b !== void 0 ? _b : this._renderFunctions[0];
                const ui = modelElementsIndexation[id]
                    ? this.newEntityUI(model, id)
                    : renderFunction(model, id);
                if (!ui)
                    continue;
                mainGroup.addChild(...[ui].flat());
            }
            mainGroup.data.uiProcessed = true;
        });
        return mainGroup;
    }
    setEntityIndex(model, expressID) {
        if (!this._indexMap[model.uuid][expressID])
            this._indexMap[model.uuid][expressID] = new Set();
        return this._indexMap[model.uuid][expressID];
    }
    newAttributesUI(model, expressID) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const entityAttributes = properties;
        if (!entityAttributes)
            return [];
        const attributesGroup = new AttributeSet(this._components, this, model, expressID);
        attributesGroup.attributesToIgnore = this.attributesToIgnore;
        return [attributesGroup];
    }
    newPsetUI(model, psetID) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const uiGroups = [];
        const pset = properties[psetID];
        if (pset.type !== WEBIFC.IFCPROPERTYSET)
            return uiGroups;
        const uiGroup = this.newEntityTree(model, psetID);
        if (!uiGroup)
            return uiGroups;
        this.addPsetActions(model, psetID, uiGroup);
        uiGroup.onExpand.on(() => {
            const { uiProcessed } = uiGroup.data;
            if (uiProcessed)
                return;
            const psetPropsID = IfcPropertiesUtils.getPsetProps(properties, psetID, (propID) => {
                const prop = properties[propID];
                if (!prop)
                    return;
                const tag = this.newPropertyTag(model, psetID, propID, "NominalValue");
                if (tag)
                    uiGroup.addChild(tag);
            });
            if (!psetPropsID || psetPropsID.length === 0) {
                const template = `
         <p class="text-base text-gray-500 py-1 px-3">
            This pset has no properties.
         </p>
        `;
                const notFoundText = new SimpleUIComponent(this._components, template);
                uiGroup.addChild(notFoundText);
            }
            uiGroup.data.uiProcessed = true;
        });
        uiGroups.push(uiGroup);
        return uiGroups;
    }
    newQsetUI(model, qsetID) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const uiGroups = [];
        const qset = properties[qsetID];
        if (qset.type !== WEBIFC.IFCELEMENTQUANTITY)
            return uiGroups;
        const uiGroup = this.newEntityTree(model, qsetID);
        if (!uiGroup)
            return uiGroups;
        this.addPsetActions(model, qsetID, uiGroup);
        IfcPropertiesUtils.getQsetQuantities(properties, qsetID, (quantityID) => {
            const { key } = IfcPropertiesUtils.getQuantityValue(properties, quantityID);
            if (!key)
                return;
            const tag = this.newPropertyTag(model, qsetID, quantityID, key);
            if (tag)
                uiGroup.addChild(tag);
        });
        uiGroups.push(uiGroup);
        return uiGroups;
    }
    addPsetActions(model, psetID, uiGroup) {
        if (!this.propertiesManager)
            return;
        const { psetActions } = this.propertiesManager.uiElement;
        const event = this.propertiesManager.setAttributeListener(model, psetID, "Name");
        event.on((v) => (uiGroup.description = v.toString()));
        uiGroup.innerElements.titleContainer.onmouseenter = () => {
            psetActions.data = { model, psetID };
            uiGroup.slots.titleRight.addChild(psetActions);
        };
        uiGroup.innerElements.titleContainer.onmouseleave = () => {
            if (psetActions.modalVisible)
                return;
            psetActions.removeFromParent();
            psetActions.cleanData();
        };
    }
    addEntityActions(model, expressID, uiGroup) {
        if (!this.propertiesManager)
            return;
        const { entityActions } = this.propertiesManager.uiElement;
        uiGroup.innerElements.titleContainer.onmouseenter = () => {
            entityActions.data = { model, elementIDs: [expressID] };
            uiGroup.slots.titleRight.addChild(entityActions);
        };
        uiGroup.innerElements.titleContainer.onmouseleave = () => {
            if (entityActions.modal.visible)
                return;
            entityActions.removeFromParent();
            entityActions.cleanData();
        };
    }
    newEntityTree(model, expressID) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const entity = properties[expressID];
        if (!entity)
            return null;
        const currentUI = this._currentUI[expressID];
        if (currentUI)
            return currentUI;
        const entityTree = new TreeView(this._components);
        this._currentUI[expressID] = entityTree;
        // const entityTree = this._entityUIPool.get();
        entityTree.title = `${IfcCategoryMap[entity.type]}`;
        const { name } = IfcPropertiesUtils.getEntityName(properties, expressID);
        entityTree.description = name;
        return entityTree;
    }
    newPropertyTag(model, setID, expressID, valueKey) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const entity = properties[expressID];
        if (!entity)
            return null;
        const tag = new PropertyTag(this._components, this, model, expressID);
        // @ts-ignore
        this._currentUI[expressID] = tag;
        if (!this.propertiesManager)
            return tag;
        // #region ManagementUI
        const { propActions } = this.propertiesManager.uiElement;
        tag.get().onmouseenter = () => {
            propActions.data = { model, setID, expressID, valueKey };
            tag.addChild(propActions);
        };
        tag.get().onmouseleave = () => {
            if (propActions.modalVisible)
                return;
            propActions.removeFromParent();
            propActions.cleanData();
        };
        // #endregion ManagementUI
        return tag;
    }
}
export * from "./src";
//# sourceMappingURL=index.js.map
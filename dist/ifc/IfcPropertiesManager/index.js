import * as WEBIFC from "web-ifc";
import { Event, Component } from "../../base-types";
import { generateIfcGUID } from "../../utils";
import { IfcPropertiesUtils } from "../IfcPropertiesUtils";
import { EntityActionsUI } from "./src/entity-actions";
import { PsetActionsUI } from "./src/pset-actions";
import { PropActionsUI } from "./src/prop-actions";
import { Button } from "../../ui";
export class IfcPropertiesManager extends Component {
    constructor(components, ifcApi) {
        super();
        this.name = "PropertiesManager";
        this.enabled = true;
        this.attributeListeners = {};
        this._changeMap = {};
        this.onElementToPset = new Event();
        this.onPropToPset = new Event();
        this.onPsetRemoved = new Event();
        this.onDataChanged = new Event();
        this.wasm = {
            path: "/",
            absolute: false,
        };
        this._ifcApi = ifcApi !== null && ifcApi !== void 0 ? ifcApi : new WEBIFC.IfcAPI();
        // TODO: Save original IFC file so that opening it again is not necessary
        const exportButton = new Button(components);
        exportButton.tooltip = "Export IFC";
        exportButton.materialIcon = "exit_to_app";
        exportButton.onclick = () => {
            const fileOpener = document.createElement("input");
            fileOpener.type = "file";
            fileOpener.onchange = async () => {
                if (!this.selectedModel ||
                    !fileOpener.files ||
                    !fileOpener.files.length) {
                    return;
                }
                const file = fileOpener.files[0];
                const rawBuffer = await file.arrayBuffer();
                const fileData = new Uint8Array(rawBuffer);
                const resultBuffer = await this.saveToIfc(this.selectedModel, fileData);
                const resultFile = new File([new Blob([resultBuffer])], file.name);
                const link = document.createElement("a");
                link.download = file.name;
                link.href = URL.createObjectURL(resultFile);
                link.click();
                link.remove();
                fileOpener.remove();
            };
            fileOpener.click();
        };
        this.uiElement = {
            exportButton,
            entityActions: new EntityActionsUI(components),
            psetActions: new PsetActionsUI(components),
            propActions: new PropActionsUI(components),
        };
        this.setUIEvents();
    }
    async init() {
        const { path, absolute } = this.wasm;
        this._ifcApi.SetWasmPath(path, absolute);
        await this._ifcApi.Init();
    }
    dispose() {
        this._ifcApi = null;
        this.selectedModel = undefined;
        this.attributeListeners = {};
        this._changeMap = {};
        this.onElementToPset.reset();
        this.onPropToPset.reset();
        this.onPsetRemoved.reset();
        this.onDataChanged.reset();
        this.uiElement.entityActions.dispose();
        this.uiElement.psetActions.dispose();
        this.uiElement.propActions.dispose();
    }
    setUIEvents() {
        this.uiElement.entityActions.onNewPset.on(({ model, elementIDs, name, description }) => {
            const { pset } = this.newPset(model, name, description === "" ? undefined : description);
            for (const expressID of elementIDs !== null && elementIDs !== void 0 ? elementIDs : []) {
                this.addElementToPset(model, pset.expressID, expressID);
            }
            this.uiElement.entityActions.cleanData();
        });
        this.uiElement.propActions.onEditProp.on(({ model, expressID, name, value }) => {
            var _a, _b;
            const { properties } = IfcPropertiesManager.getIFCInfo(model);
            const prop = properties[expressID];
            const { key: valueKey } = IfcPropertiesUtils.getQuantityValue(properties, expressID);
            const { key: nameKey } = IfcPropertiesUtils.getEntityName(properties, expressID);
            if (name !== "" && nameKey) {
                if ((_a = prop[nameKey]) === null || _a === void 0 ? void 0 : _a.value) {
                    prop[nameKey].value = name;
                }
                else {
                    prop.Name = { type: 1, value: name };
                }
            }
            if (value !== "" && valueKey) {
                if ((_b = prop[valueKey]) === null || _b === void 0 ? void 0 : _b.value) {
                    prop[valueKey].value = value;
                }
                else {
                    prop.NominalValue = { type: 1, value }; // Need to change type based on property 1:STRING, 2: LABEL, 3: ENUM, 4: REAL
                }
            }
            this.uiElement.propActions.cleanData();
        });
        this.uiElement.propActions.onRemoveProp.on(({ model, expressID, setID }) => {
            this.removePsetProp(model, setID, expressID);
            this.uiElement.propActions.cleanData();
        });
        this.uiElement.psetActions.onEditPset.on(({ model, psetID, name, description }) => {
            var _a, _b;
            const { properties } = IfcPropertiesManager.getIFCInfo(model);
            const pset = properties[psetID];
            if (name !== "") {
                if ((_a = pset.Name) === null || _a === void 0 ? void 0 : _a.value) {
                    pset.Name.value = name;
                }
                else {
                    pset.Name = { type: 1, value: name };
                }
            }
            if (description !== "") {
                if ((_b = pset.Description) === null || _b === void 0 ? void 0 : _b.value) {
                    pset.Description.value = description;
                }
                else {
                    pset.Description = { type: 1, value: description };
                }
            }
        });
        this.uiElement.psetActions.onRemovePset.on(({ model, psetID }) => {
            this.removePset(model, psetID);
        });
        this.uiElement.psetActions.onNewProp.on(({ model, psetID, name, type, value }) => {
            const prop = this.newSingleStringProperty(model, type, name, value);
            this.addPropToPset(model, psetID, prop.expressID);
        });
    }
    increaseMaxID(model) {
        model.ifcMetadata.maxExpressID++;
    }
    static getIFCInfo(model) {
        const properties = model.properties;
        if (!properties)
            throw new Error("FragmentsGroup properties not found");
        const schema = model.ifcMetadata.schema;
        if (!schema)
            throw new Error("IFC Schema not found");
        return { properties, schema };
    }
    newGUID(model) {
        const { schema } = IfcPropertiesManager.getIFCInfo(model);
        return new WEBIFC[schema].IfcGloballyUniqueId(generateIfcGUID());
    }
    getOwnerHistory(model) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const ownerHistory = IfcPropertiesUtils.findItemOfType(properties, WEBIFC.IFCOWNERHISTORY);
        if (!ownerHistory)
            throw new Error("No OwnerHistory was found.");
        const ownerHistoryHandle = new WEBIFC.Handle(ownerHistory.expressID);
        return { ownerHistory, ownerHistoryHandle };
    }
    registerChange(model, ...expressID) {
        if (!this._changeMap[model.uuid])
            this._changeMap[model.uuid] = new Set();
        for (const id of expressID) {
            this._changeMap[model.uuid].add(id);
            this.onDataChanged.trigger({ model, expressID: id });
        }
    }
    setData(model, ...dataToSave) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        for (const data of dataToSave) {
            const expressID = data.expressID;
            if (!expressID)
                continue;
            properties[expressID] = data;
            this.registerChange(model, expressID);
        }
    }
    newPset(model, name, description) {
        const { schema } = IfcPropertiesManager.getIFCInfo(model);
        const { ownerHistoryHandle } = this.getOwnerHistory(model);
        // Create the Pset
        this.increaseMaxID(model);
        const psetGlobalId = this.newGUID(model);
        const psetName = new WEBIFC[schema].IfcLabel(name);
        const psetDescription = description
            ? new WEBIFC[schema].IfcText(description)
            : null;
        const pset = new WEBIFC[schema].IfcPropertySet(psetGlobalId, ownerHistoryHandle, psetName, psetDescription, []);
        // Create the Pset relation
        this.increaseMaxID(model);
        const relGlobalId = this.newGUID(model);
        const rel = new WEBIFC[schema].IfcRelDefinesByProperties(relGlobalId, ownerHistoryHandle, null, null, [], new WEBIFC.Handle(pset.expressID));
        this.setData(model, pset, rel);
        return { pset, rel };
    }
    removePset(model, ...psetID) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        for (const expressID of psetID) {
            const pset = properties[expressID];
            if ((pset === null || pset === void 0 ? void 0 : pset.type) !== WEBIFC.IFCPROPERTYSET)
                continue;
            const relID = IfcPropertiesUtils.getPsetRel(properties, expressID);
            if (relID) {
                delete properties[relID];
                this.registerChange(model, relID);
            }
            if (pset) {
                for (const propHandle of pset.HasProperties)
                    delete properties[propHandle.value];
                delete properties[expressID];
                this.onPsetRemoved.trigger({ model, psetID: expressID });
                this.registerChange(model, expressID);
            }
        }
    }
    newSingleProperty(model, type, name, value) {
        const { schema } = IfcPropertiesManager.getIFCInfo(model);
        this.increaseMaxID(model);
        const propName = new WEBIFC[schema].IfcIdentifier(name);
        // @ts-ignore
        const propValue = new WEBIFC[schema][type](value);
        const prop = new WEBIFC[schema].IfcPropertySingleValue(propName, null, propValue, null);
        this.setData(model, prop);
        return prop;
    }
    newSingleStringProperty(model, type, name, value) {
        return this.newSingleProperty(model, type, name, value);
    }
    newSingleNumericProperty(model, type, name, value) {
        return this.newSingleProperty(model, type, name, value);
    }
    newSingleBooleanProperty(model, type, name, value) {
        return this.newSingleProperty(model, type, name, value);
    }
    removePsetProp(model, psetID, propID) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const pset = properties[psetID];
        const prop = properties[propID];
        if (!(pset.type === WEBIFC.IFCPROPERTYSET && prop))
            return;
        const propHandlers = pset.HasProperties.filter((handle) => {
            return handle.value !== propID;
        });
        pset.HasProperties = propHandlers;
        delete properties[propID];
        this.registerChange(model, psetID, propID);
    }
    addElementToPset(model, psetID, ...elementID) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const relID = IfcPropertiesUtils.getPsetRel(properties, psetID);
        if (!relID)
            return;
        const rel = properties[relID];
        for (const expressID of elementID) {
            const elementHandle = new WEBIFC.Handle(expressID);
            rel.RelatedObjects.push(elementHandle);
            this.onElementToPset.trigger({ model, psetID, elementID: expressID });
        }
        this.registerChange(model, psetID);
    }
    addPropToPset(model, psetID, ...propID) {
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const pset = properties[psetID];
        if (!pset)
            return;
        for (const expressID of propID) {
            const elementHandle = new WEBIFC.Handle(expressID);
            pset.HasProperties.push(elementHandle);
            this.onPropToPset.trigger({ model, psetID, propID: expressID });
        }
        this.registerChange(model, psetID);
    }
    async saveToIfc(model, ifcToSaveOn) {
        var _a;
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const modelID = this._ifcApi.OpenModel(ifcToSaveOn);
        const changes = (_a = this._changeMap[model.uuid]) !== null && _a !== void 0 ? _a : [];
        for (const expressID of changes) {
            const data = properties[expressID];
            if (!data) {
                this._ifcApi.DeleteLine(modelID, expressID);
            }
            else {
                this._ifcApi.WriteLine(modelID, data);
            }
        }
        const modifiedIFC = this._ifcApi.SaveModel(modelID);
        this._ifcApi.CloseModel(modelID);
        this._ifcApi = null;
        this._ifcApi = new WEBIFC.IfcAPI();
        const { path, absolute } = this.wasm;
        this._ifcApi.SetWasmPath(path, absolute);
        await this._ifcApi.Init();
        return modifiedIFC;
    }
    setAttributeListener(model, expressID, attributeName) {
        if (!this.attributeListeners[model.uuid])
            this.attributeListeners[model.uuid] = {};
        const existingListener = this.attributeListeners[model.uuid][expressID]
            ? this.attributeListeners[model.uuid][expressID][attributeName]
            : null;
        if (existingListener)
            return existingListener;
        const { properties } = IfcPropertiesManager.getIFCInfo(model);
        const entity = properties[expressID];
        if (!entity) {
            throw new Error(`Entity with expressID ${expressID} doesn't exists.`);
        }
        const attribute = entity[attributeName];
        if (Array.isArray(attribute) || !attribute) {
            throw new Error(`Attribute ${attributeName} is array or null, and it can't have a listener.`);
        }
        const value = attribute.value;
        if (value === undefined || value == null) {
            throw new Error(`Attribute ${attributeName} has a badly defined handle.`);
        }
        // Is it good to set all the above as errors? Or better return null?
        const event = new Event();
        Object.defineProperty(entity[attributeName], "value", {
            get() {
                return this._value;
            },
            set(value) {
                this._value = value;
                event.trigger(value);
            },
        });
        entity[attributeName].value = value;
        if (!this.attributeListeners[model.uuid][expressID])
            this.attributeListeners[model.uuid][expressID] = {};
        this.attributeListeners[model.uuid][expressID][attributeName] = event;
        return event;
    }
    get() {
        return this._changeMap;
    }
}
//# sourceMappingURL=index.js.map
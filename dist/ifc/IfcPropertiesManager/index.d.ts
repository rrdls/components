import * as WEBIFC from "web-ifc";
import { FragmentsGroup } from "bim-fragment";
import { Disposable, Event, Component } from "../../base-types";
import { Components } from "../../core";
import { EntityActionsUI } from "./src/entity-actions";
import { PsetActionsUI } from "./src/pset-actions";
import { PropActionsUI } from "./src/prop-actions";
import { Button } from "../../ui";
type BooleanPropTypes = "IfcBoolean" | "IfcLogical";
type StringPropTypes = "IfcText" | "IfcLabel" | "IfcIdentifier";
type NumericPropTypes = "IfcInteger" | "IfcReal";
interface ChangeMap {
    [modelID: string]: Set<number>;
}
interface AttributeListener {
    [modelID: string]: {
        [expressID: number]: {
            [attributeName: string]: Event<String | Boolean | Number>;
        };
    };
}
export declare class IfcPropertiesManager extends Component<ChangeMap> implements Disposable {
    name: string;
    enabled: boolean;
    attributeListeners: AttributeListener;
    selectedModel?: FragmentsGroup;
    uiElement: {
        entityActions: EntityActionsUI;
        psetActions: PsetActionsUI;
        propActions: PropActionsUI;
        exportButton: Button;
    };
    private _ifcApi;
    private _changeMap;
    readonly onElementToPset: Event<{
        model: FragmentsGroup;
        psetID: number;
        elementID: number;
    }>;
    readonly onPropToPset: Event<{
        model: FragmentsGroup;
        psetID: number;
        propID: number;
    }>;
    readonly onPsetRemoved: Event<{
        model: FragmentsGroup;
        psetID: number;
    }>;
    readonly onDataChanged: Event<{
        model: FragmentsGroup;
        expressID: number;
    }>;
    wasm: {
        path: string;
        absolute: boolean;
    };
    constructor(components: Components, ifcApi?: WEBIFC.IfcAPI);
    init(): Promise<void>;
    dispose(): void;
    private setUIEvents;
    private increaseMaxID;
    static getIFCInfo(model: FragmentsGroup): {
        properties: import("bim-fragment").IfcProperties;
        schema: import("bim-fragment").IfcSchema;
    };
    private newGUID;
    private getOwnerHistory;
    private registerChange;
    setData(model: FragmentsGroup, ...dataToSave: Record<string, any>[]): void;
    newPset(model: FragmentsGroup, name: string, description?: string): {
        pset: WEBIFC.IFC2X3.IfcPropertySet | WEBIFC.IFC4.IfcPropertySet | WEBIFC.IFC4X3.IfcPropertySet;
        rel: WEBIFC.IFC4X3.IfcRelDefinesByProperties | WEBIFC.IFC4.IfcRelDefinesByProperties | WEBIFC.IFC2X3.IfcRelDefinesByProperties;
    };
    removePset(model: FragmentsGroup, ...psetID: number[]): void;
    private newSingleProperty;
    newSingleStringProperty(model: FragmentsGroup, type: StringPropTypes, name: string, value: string): WEBIFC.IFC2X3.IfcPropertySingleValue | WEBIFC.IFC4.IfcPropertySingleValue | WEBIFC.IFC4X3.IfcPropertySingleValue;
    newSingleNumericProperty(model: FragmentsGroup, type: NumericPropTypes, name: string, value: number): WEBIFC.IFC2X3.IfcPropertySingleValue | WEBIFC.IFC4.IfcPropertySingleValue | WEBIFC.IFC4X3.IfcPropertySingleValue;
    newSingleBooleanProperty(model: FragmentsGroup, type: BooleanPropTypes, name: string, value: boolean): WEBIFC.IFC2X3.IfcPropertySingleValue | WEBIFC.IFC4.IfcPropertySingleValue | WEBIFC.IFC4X3.IfcPropertySingleValue;
    removePsetProp(model: FragmentsGroup, psetID: number, propID: number): void;
    addElementToPset(model: FragmentsGroup, psetID: number, ...elementID: number[]): void;
    addPropToPset(model: FragmentsGroup, psetID: number, ...propID: number[]): void;
    saveToIfc(model: FragmentsGroup, ifcToSaveOn: Uint8Array): Promise<Uint8Array>;
    setAttributeListener(model: FragmentsGroup, expressID: number, attributeName: string): Event<String | Number | Boolean>;
    get(): ChangeMap;
}
export {};

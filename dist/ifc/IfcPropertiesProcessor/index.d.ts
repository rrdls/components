import { FragmentsGroup } from "bim-fragment";
import { Button } from "../../ui/ButtonComponent";
import { UI, Event, Disposable } from "../../base-types";
import { Component } from "../../base-types/component";
import { FloatingWindow } from "../../ui";
import { Components } from "../../core/Components";
import { IfcPropertiesManager } from "../IfcPropertiesManager";
interface IndexMap {
    [modelID: string]: {
        [expressID: string]: Set<number>;
    };
}
export declare class IfcPropertiesProcessor extends Component<IndexMap> implements UI, Disposable {
    name: string;
    enabled: boolean;
    uiElement: {
        propertiesWindow: FloatingWindow;
        main: Button;
    };
    relationsToProcess: number[];
    entitiesToIgnore: number[];
    attributesToIgnore: string[];
    private _components;
    private _propsList;
    private _topToolbar;
    private _indexMap;
    private _renderFunctions;
    private _propertiesManager;
    private _currentUI;
    readonly onPropertiesManagerSet: Event<IfcPropertiesManager>;
    set propertiesManager(manager: IfcPropertiesManager | null);
    get propertiesManager(): IfcPropertiesManager | null;
    constructor(components: Components);
    dispose(): void;
    getProperties(model: FragmentsGroup, id: string): any[] | null;
    private getNestedPsets;
    private getPsetProperties;
    private setUI;
    cleanPropertiesList(): void;
    get(): IndexMap;
    process(model: FragmentsGroup): void;
    renderProperties(model: FragmentsGroup, expressID: number): void;
    private newEntityUI;
    private setEntityIndex;
    private newAttributesUI;
    private newPsetUI;
    private newQsetUI;
    private addPsetActions;
    private addEntityActions;
    private newEntityTree;
    private newPropertyTag;
}
export * from "./src";

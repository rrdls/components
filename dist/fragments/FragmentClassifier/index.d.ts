import { FragmentsGroup } from "bim-fragment";
import { Disposable, FragmentIdMap } from "../../base-types";
import { Component } from "../../base-types/component";
import { FragmentManager } from "../FragmentManager";
export interface Classification {
    [system: string]: {
        [className: string]: {
            [fragmentID: string]: Set<string>;
        };
    };
}
export declare class FragmentClassifier extends Component<Classification> implements Disposable {
    /** {@link Component.name} */
    name: string;
    /** {@link Component.enabled} */
    enabled: boolean;
    private _groupSystems;
    private _fragments;
    constructor(fragmentManager: FragmentManager);
    /** {@link Component.get} */
    get(): Classification;
    dispose(): void;
    remove(guid: string): void;
    find(filter?: {
        [name: string]: string[];
    }): FragmentIdMap;
    byModel(modelID: string, group: FragmentsGroup): void;
    byPredefinedType(group: FragmentsGroup): void;
    byEntity(group: FragmentsGroup): void;
    byStorey(group: FragmentsGroup): void;
    byIfcRel(group: FragmentsGroup, ifcRel: number, systemName: string): void;
    private saveItem;
}

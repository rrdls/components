import { FragmentsGroup } from "bim-fragment";
import { Components, LocalCacher } from "../../core";
import { FragmentManager } from "../FragmentManager";
export declare class FragmentCacher extends LocalCacher {
    private _fragments;
    private _mode;
    get fragmentsIDs(): string[];
    constructor(components: Components, fragments: FragmentManager);
    getFragmentGroup(id: string): Promise<FragmentsGroup | null>;
    saveFragmentGroup(group: FragmentsGroup, id?: string): Promise<void>;
    dispose(): void;
    private getIDs;
}

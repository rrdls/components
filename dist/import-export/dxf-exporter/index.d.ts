import { FragmentManager, FragmentPlans } from "../../fragments";
import { EdgeProjector } from "./src/edge-projector";
import { Component } from "../../base-types";
export declare class DXFExporter extends Component<EdgeProjector> {
    enabled: boolean;
    name: string;
    private _fragments;
    private _plans;
    precission: number;
    private _projector;
    constructor(fragments: FragmentManager, plans: FragmentPlans);
    get(): EdgeProjector;
    dispose(): void;
    export(name: string): Promise<string>;
    private drawGeometry;
}

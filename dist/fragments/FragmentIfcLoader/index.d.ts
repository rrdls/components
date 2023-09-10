import * as WEBIFC from "web-ifc";
import { FragmentsGroup } from "bim-fragment";
import { Disposable, Event, UI, Component } from "../../base-types";
import { FragmentManager } from "../index";
import { Button } from "../../ui";
import { Components } from "../../core";
export * from "./src/types";
/**
 * Reads all the geometry of the IFC file and generates a set of
 * [fragments](https://github.com/ifcjs/fragment). It can also return the
 * properties as a JSON file, as well as other sets of information within
 * the IFC file.
 */
export declare class FragmentIfcLoader extends Component<WEBIFC.IfcAPI> implements Disposable, UI {
    name: string;
    enabled: boolean;
    uiElement: {
        main: Button;
    };
    ifcLoaded: Event<FragmentsGroup>;
    locationsSaved: Event<{
        [id: number]: number[];
    }>;
    private _webIfc;
    private _toast;
    private readonly _fragments;
    private readonly _components;
    private readonly _geometry;
    private readonly _converter;
    constructor(components: Components, fragments: FragmentManager);
    get(): WEBIFC.IfcAPI;
    get settings(): import("./src").IfcFragmentSettings;
    /** {@link Disposable.dispose} */
    dispose(): void;
    /** Loads the IFC file and converts it to a set of fragments. */
    load(data: Uint8Array, name: string): Promise<FragmentsGroup>;
    private setupOpenButton;
    private readIfcFile;
    private readAllGeometries;
    private cleanUp;
    private isExcluded;
}

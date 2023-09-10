import { Component, Event } from "../../base-types";
/**
 * An object to easily use the services of That Open Platform.
 */
export declare class CloudProcessor extends Component<any[]> {
    tools: Component<any>[];
    /** {@link Component.name} */
    name: string;
    /** {@link Component.enabled} */
    enabled: boolean;
    modelProcessed: Event<unknown>;
    checkInterval: number;
    private _models;
    private _urls;
    constructor(token: string);
    /**
     * Retrieves a tool component by its name.
     */
    get(): any[];
    update(): Promise<void>;
    upload(fileUrl: string): Promise<void>;
    delete(modelID: string): Promise<any>;
    getModel(modelID: string): Promise<any>;
    private setupModelProcessEvent;
    private createModel;
}

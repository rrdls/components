import * as WEBIFC from "web-ifc";
import { IfcGeometries } from "./types";
export declare class GeometryReader {
    private _webIfc?;
    saveLocations: boolean;
    items: IfcGeometries;
    locations: {
        [itemID: number]: [number, number, number];
    };
    get webIfc(): WEBIFC.IfcAPI;
    cleanUp(): void;
    streamMesh(webifc: WEBIFC.IfcAPI, mesh: WEBIFC.FlatMesh, forceTransparent?: boolean): void;
    private newBufferGeometry;
    private getIndices;
    private getVertices;
    private constructBuffer;
}

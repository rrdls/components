import { Component, Event } from "../../base-types";
/**
 * An object to easily use the services of That Open Platform.
 */
export class CloudProcessor extends Component {
    constructor(token) {
        super();
        this.tools = [];
        /** {@link Component.name} */
        this.name = "CloudProcessor";
        /** {@link Component.enabled} */
        this.enabled = true;
        this.modelProcessed = new Event();
        this.checkInterval = 5000;
        this._models = [];
        this._urls = {
            base: "https://01wj0udft7.execute-api.eu-central-1.amazonaws.com/v1/models",
            token: "?accessToken=",
        };
        this._urls.token += token;
    }
    /**
     * Retrieves a tool component by its name.
     */
    get() {
        return this._models;
    }
    async update() {
        const { base, token } = this._urls;
        const url = `${base}${token}`;
        const result = await fetch(url);
        const parsed = await result.json();
        this._models = parsed.models;
    }
    async upload(fileUrl) {
        const response = await this.createModel();
        const uploadUrl = response.uploadUrl;
        const read = await fetch(fileUrl);
        const body = await read.arrayBuffer();
        await fetch(uploadUrl, { method: "PUT", body });
        this.setupModelProcessEvent(response.model._id);
    }
    async delete(modelID) {
        const { base, token } = this._urls;
        const url = `${base}/${modelID}${token}`;
        const result = await fetch(url, { method: "DELETE" });
        return result.json();
    }
    async getModel(modelID) {
        const { base, token } = this._urls;
        const modelUrl = `${base}/${modelID}${token}`;
        const modelResponse = await fetch(modelUrl);
        return modelResponse.json();
    }
    setupModelProcessEvent(modelID) {
        const interval = setInterval(async () => {
            const response = await this.getModel(modelID);
            if (response.model.status === "PROCESSED") {
                this.modelProcessed.trigger(response);
                clearInterval(interval);
            }
        }, this.checkInterval);
    }
    async createModel() {
        const { base, token } = this._urls;
        const url = `${base}${token}`;
        const result = await fetch(url, { method: "POST" });
        return result.json();
    }
}
//# sourceMappingURL=index.js.map
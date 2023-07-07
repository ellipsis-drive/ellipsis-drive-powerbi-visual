/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import IVisualEventService = powerbi.extensibility.IVisualEventService;

import { VisualFormattingSettingsModel } from "./settings";

export class Visual implements IVisual {
    private target: HTMLElement;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private iframe: HTMLIFrameElement;
    private curLanding: boolean = false; // false because we want to render the landing page first
    private renderedUrl: string;
    private events: IVisualEventService;

    private handleEvent(e: MessageEvent) {
            console.log("Event Handler");
            // Get the sent data
            const data = e.data;
        
            // parse the message as a json;
            const decoded = JSON.parse(data);
            
            //check the action type of the message and the data of the message
            console.log('action type is ', decoded.action)
            //data of the action is
            console.log('data of action is', decoded.data)
    }


    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;

        this.events = options.host.eventService;
        
        this.renderLandingPage();
    }

    private renderLandingPage() {
        window.removeEventListener('message', this.handleEvent);

        this.curLanding = true;
        console.log("render landing page");
        this.target.innerHTML = "";
        
        const p = document.createElement("p");
        p.appendChild(document.createTextNode("Welcome to the Ellipsis Drive Power BI visual. Please enter the url of the Ellipsis Drive page you want to display in the visual settings."));
        this.target.appendChild(p);
    }

    private renderIframe(src: string) {
        if (this.renderedUrl === src) { // don't re-render if the url hasn't changed
            return;
        }
        this.curLanding = false;
        this.renderedUrl = src;
        console.log("render iframe");        
        this.target.innerHTML = "";
        this.iframe = document.createElement("iframe");
        this.iframe.setAttribute("style", "width: 100%; height: 100%;");

        let url = new URL(src);
        url.searchParams.delete("hideNavbar");
        url.searchParams.append("hideNavbar", "true");
        this.iframe.setAttribute("src", url.toString());
        
        // add event listener for ellipsis drive messages
        window.addEventListener('message', this.handleEvent);

        this.target.appendChild(this.iframe);

    }

    /* 
    * Checks if a url is valid
    * @param url - the url to check
    * @returns true if the url is valid, false otherwise
    */
    private isValidUrl(url: string) {
        try {
            new URL(url);
        } catch (_) {
            return false;
        }
        return true;
    }

    public update(options: VisualUpdateOptions) {
        // notify that the visual is rendering
        this.events.renderingStarted(options);

        console.log('Visual update', options);
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);
        const url = this.formattingSettings.dataPointCard.iframeSrc.value;

        // render the iframe if the url is valid, otherwise render the landing page
        if (this.isValidUrl(url)) {
            this.renderIframe(url);
        } else {
            this.renderLandingPage( )
        }
        // notify that the visual has finished rendering
        this.events.renderingFinished(options);
    }

    public destroy(): void {
        // clean up event listener
        window.removeEventListener('message', this.handleEvent);

    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
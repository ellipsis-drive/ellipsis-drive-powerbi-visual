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

import { VisualFormattingSettingsModel } from "./settings";

export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private textNode: Text;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private iframesrc: string;
    private iframediv: HTMLElement;
    private iframe: HTMLIFrameElement;
    private curLanding: boolean = false; // false because we want to render the landing page first
    private renderedUrl: string;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;

        this.renderLandingPage();

        // add event listener for ellipsis drive messages
        window.addEventListener('message', function (e) {
            console.log("Event Handler");
            // Get the sent data
            const data = e.data;
        
            // parse the message as a json;
            const decoded = JSON.parse(data);
            
            //check the action type of the message and the data of the message
            console.log('action type is ', decoded.action)
            //data of the action is
            console.log('data of action is', decoded.data)
        });

    }

    private renderLandingPage() {
        if (this.curLanding) { // don't re-render
            return;
        }
        this.curLanding = true;
        console.log("render landing page");
        this.target.innerHTML = "";
        
        const p = document.createElement("p");
        p.appendChild(document.createTextNode("Welcome to the Ellipsis Drive Power BI visual. Please enter the url of the Ellipsis Drive page you want to display in the visual settings."));
        this.target.appendChild(p);
    }

    private renderIframe(src: string) {
        this.curLanding = false;
        if (this.renderedUrl == src) { // don't re-render if the url hasn't changed
            return;
        }
        this.renderedUrl = src;
        console.log("render iframe");        
        this.target.innerHTML = "";
        this.iframe = document.createElement("iframe");
        this.iframe.setAttribute("style", "width: 100%; height: 100%;");

        let url = new URL(src);
        url.searchParams.delete("hideNavbar");
        url.searchParams.append("hideNavbar", "true");
        this.iframe.setAttribute("src", url.toString());
        
        this.target.appendChild(this.iframe);

    }

    private isValidUrl(url: string) {
        try {
            new URL(url);
        } catch (_) {
            return false;
        }
        return true;
    }

    public update(options: VisualUpdateOptions) {
        console.log('Visual update', options);
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);

        console.log(this.formattingSettings.dataPointCard.iframeSrc.value);

        const url = this.formattingSettings.dataPointCard.iframeSrc.value;
        console.log(this.isValidUrl(url));

        if (this.isValidUrl(url)) {
            this.renderIframe(url);
        } else {
            this.renderLandingPage( )
        }
    }

    /**
     * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
     * This method is called once every time we open properties pane or when the user edit any format property. 
     */
    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
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
'use strict';

import powerbi from 'powerbi-visuals-api';
import { FormattingSettingsService } from 'powerbi-visuals-utils-formattingmodel';
import './../style/visual.less';

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import IVisualEventService = powerbi.extensibility.IVisualEventService;

import { VisualFormattingSettingsModel } from './settings';

import {
  IFilterColumnTarget,
  IAdvancedFilter,
  FilterType,
} from 'powerbi-models';

import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import FilterAction = powerbi.FilterAction;

/**
 * Interface for search text view model. stolen from https://community.fabric.microsoft.com/t5/Developer/Visual-filtering-using-Advanced-Filter-API/m-p/1379950#M25788
 */
interface ViewModel {
  filterColumns: IFilterColumnTarget[];
}
export class Visual implements IVisual {
  private target: HTMLElement;
  private formattingSettings: VisualFormattingSettingsModel;
  private formattingSettingsService: FormattingSettingsService;
  private iframe: HTMLIFrameElement;
  private curLanding: boolean = false; // false because we want to render the landing page first
  private renderedUrl: string;
  private events: IVisualEventService;
  private viewModel: ViewModel;
  private visualHost: IVisualHost;
  private curProperties: any = null;

  private handleEvent(e: MessageEvent) {
    // console.log('Got event');

    // Get the sent data
    const data = e.data;

    // parse the message as a json;
    const decoded = JSON.parse(data);

    // console.log(decoded);

    let action = decoded?.action;

    if (action === 'featureClick') {
      // console.log('Received featureClick');
      // if the message is a feature click, set the properties
      if (decoded?.data?.feature.properties !== undefined) {
        this.curProperties = decoded?.data?.feature.properties;
      }
    } else if (action === 'deselectFeature') {
      // console.log('Received deselectFeature');
      this.curProperties = {};
    }

    const doFilter = this.formattingSettings.dataPointCard.enableFilter.value;

    if (doFilter) {
      this.filter(this.formattingSettings.dataPointCard);
    }
  }

  constructor(options: VisualConstructorOptions) {
    this.formattingSettingsService = new FormattingSettingsService();
    this.target = options.element;

    this.visualHost = options.host;

    this.events = options.host.eventService;

    this.renderLandingPage();
  }

  private renderLandingPage() {
    if (this.curLanding) {
      // don't re-render if we're already on the landing page
      return;
    }

    // console.log('Rendering landing');

    // clean up event listener
    window.removeEventListener('message', this.handleEvent.bind(this));
    this.curLanding = true;
    this.target.innerHTML = '';

    const p = document.createElement('p');
    p.appendChild(
      document.createTextNode('Welcome to the Ellipsis Drive Power BI visual.')
    );
    p.appendChild(document.createElement('br'));
    p.appendChild(
      document.createTextNode(
        'Please enter the url of the Ellipsis Drive bookmark you want to display in the visual settings.'
      )
    );
    this.target.appendChild(p);
  }

  private fixHttps(url: string) {
    if (url.startsWith('https://')) {
      return url;
    } else if (url.startsWith('http://')) {
      return 'https://' + url.substring(7);
    } else {
      // assume no protocol is given, so add https
      // might be better in the future to check for other protocols
      return 'https://' + url;
    }
  }

  private renderIframe(src: string) {
    if (this.renderedUrl === src) {
      // don't re-render if the url hasn't changed
      return;
    }
    this.curLanding = false;
    this.renderedUrl = src;
    this.target.innerHTML = '';
    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('style', 'width: 100%; height: 100%;');

    const url = new URL(src);

    url.searchParams.delete('hideNavbar');
    url.searchParams.append('hideNavbar', 'true');
    this.iframe.setAttribute('src', url.toString());

    // add event listener for ellipsis drive messages
    window.addEventListener('message', this.handleEvent.bind(this));

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
    // console.log('Update');

    // notify that the visual is rendering
    this.events.renderingStarted(options);

    this.formattingSettings =
      this.formattingSettingsService.populateFormattingSettingsModel(
        VisualFormattingSettingsModel,
        options.dataViews
      );

    // get the url from the settings and add https if necessary
    const url = this.fixHttps(
      this.formattingSettings.dataPointCard.iframeSrc.value
    );

    const doFilter = this.formattingSettings.dataPointCard.enableFilter.value;

    // render the iframe if the url is valid, otherwise render the landing page
    if (this.isValidUrl(url)) {
      this.renderIframe(url);
    } else {
      this.renderLandingPage();
    }

    this.viewModel = this.getViewModel(options);

    if (doFilter) {
      this.filter(this.formattingSettings.dataPointCard);
    } else {
      this.visualHost.applyJsonFilter(
        null,
        'general',
        'filter',
        FilterAction.remove
      );
    }

    // notify that the visual has finished rendering
    this.events.renderingFinished(options);
  }

  private getViewModel(options: VisualUpdateOptions): ViewModel {
    //declare the data view
    const dataView = options.dataViews[0];
    const tableDataView = dataView.table;

    //set an empty view model
    const viewModel: ViewModel = {
      filterColumns: [],
    };

    //return empty view model if there's no data to show
    if (!tableDataView || !tableDataView.rows || !tableDataView.columns) {
      return viewModel;
    }

    //declare columns
    const cols = tableDataView.columns;

    //iterate cols and push the columns properties to the view model
    cols.forEach((col) => {
      viewModel.filterColumns.push({
        table: col.queryName.substr(0, col.queryName.indexOf('.')),
        column: col.displayName,
      });
    });

    return viewModel;
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
    return this.formattingSettingsService.buildFormattingModel(
      this.formattingSettings
    );
  }

  //private filter(target: IFilterColumnTarget, operator: any, text: string) {

  private filter(settings) {
    // console.log('Doing filter');

    const table = settings.tableName.value;
    const column = settings.columnName.value;
    const operator = settings.condition.value;
    const propertyName = settings.propertyName.value;
    const value = this.curProperties[propertyName];

    // console.log(`Filtering on value: ${value}`);

    const advancedFilter: IAdvancedFilter = {
      target: {
        table: table,
        column: column,
      },
      logicalOperator: 'Or',
      conditions: [
        {
          operator: operator.value,
          value: value,
        },
      ],
      $schema: 'http://powerbi.com/product/schema#advanced',
      filterType: FilterType.Advanced,
    };

    // invoke the filter
    this.visualHost.applyJsonFilter(
      advancedFilter,
      'general',
      'filter',
      FilterAction.merge
    );
  }
}

/*
 *  Power BI Visualizations
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

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Data Point Formatting Card
 */
class DataPointCardSettings extends FormattingSettingsCard {

    enableFilter = new formattingSettings.ToggleSwitch({
        name: "enableFilter",
        displayName: "Enable Filter",
        value: false
    });


    iframeSrc = new formattingSettings.TextInput({
        name: "iframeSrc",
        displayName: "Ellipsis Drive url",
        placeholder: "Enter url",
        value: "https://app.ellipsis-drive.com/view?pathId=92b55e70-3b4d-413b-991d-d0ae7f736b78&hideNavbar=true"
    });

    // "None" | "LessThan" | "LessThanOrEqual" | "GreaterThan" | "GreaterThanOrEqual" | "Contains" | "DoesNotContain" | "StartsWith" | "DoesNotStartWith" | "Is" | "IsNot" | "IsBlank" | "IsNotBlank" | "IsEmptyString" | "IsNotEmptyString";

    filterType = new formattingSettings.ItemDropdown({
        name: "filterType",
        displayName: "Filter Type",
        items: [
            { value: "none", displayName: "None" },
            { value: "lessThan", displayName: "Less Than" },
            { value: "lessThanOrEqual", displayName: "Less Than Or Equal" },
            { value: "greaterThan", displayName: "Greater Than" },
            { value: "greaterThanOrEqual", displayName: "Greater Than Or Equal" },
            { value: "contains", displayName: "Contains" },
            { value: "doesNotContain", displayName: "Does Not Contain" },
            { value: "startsWith", displayName: "Starts With" },
            { value: "doesNotStartWith", displayName: "Does Not Start With" },
            { value: "is", displayName: "Is" },
            { value: "isNot", displayName: "Is Not" },
            { value: "isBlank", displayName: "Is Blank" },
            { value: "isNotBlank", displayName: "Is Not Blank" },
            { value: "isEmptyString", displayName: "Is Empty String" },
            { value: "isNotEmptyString", displayName: "Is Not Empty String" },
        ],
        value: {value: "none", displayName: "None"}
    });

    filterValue = new formattingSettings.TextInput({
        name: "filterValue",
        displayName: "Filter Value",
        placeholder: "Enter filter value",
        value: ""
    });


    propertyName = new formattingSettings.TextInput({
        name: "propertyName",
        displayName: "Property Name",
        placeholder: "Enter property name",
        value: ""
    });

    tableName = new formattingSettings.TextInput({
        name: "tableName",
        displayName: "Table Name",
        placeholder: "Enter table name",
        value: ""
    });

    columnName = new formattingSettings.TextInput({
        name: "columnName",
        displayName: "Column Name",
        placeholder: "Enter column name",
        value: ""
    });


    name: string = "dataPoint";
    displayName: string = "Ellipsis Drive Settings";
    slices: Array<FormattingSettingsSlice> = [this.enableFilter, this.iframeSrc, this.filterType, this.filterValue, this.propertyName, this.tableName, this.columnName];
}

/**
* visual settings model class
*
*/
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    dataPointCard = new DataPointCardSettings();

    cards = [this.dataPointCard];
}

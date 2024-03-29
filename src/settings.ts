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

'use strict';

import { formattingSettings } from 'powerbi-visuals-utils-formattingmodel';

import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

/**
 * Data Point Formatting Card
 */
class DataPointCardSettings extends FormattingSettingsCard {
  enableFilter = new formattingSettings.ToggleSwitch({
    name: 'enableFilter',
    displayName: 'Enable Filter',
    value: false,
  });

  iframeSrc = new formattingSettings.TextInput({
    name: 'iframeSrc',
    displayName: 'Ellipsis Drive url',
    placeholder: 'Enter url',
    value: '',
  });

  // "None" | "LessThan" | "LessThanOrEqual" | "GreaterThan" | "GreaterThanOrEqual" | "Contains" | "DoesNotContain" | "StartsWith" | "DoesNotStartWith" | "Is" | "IsNot" | "IsBlank" | "IsNotBlank" | "IsEmptyString" | "IsNotEmptyString";

  condition = new formattingSettings.ItemDropdown({
    name: 'condition',
    displayName: 'Condition',
    items: [
      { value: 'None', displayName: 'None' },
      { value: 'LessThan', displayName: 'Less than' },
      { value: 'LessThanOrEqual', displayName: 'Less than or equal' },
      { value: 'GreaterThan', displayName: 'Greater than' },
      { value: 'GreaterThanOrEqual', displayName: 'Greater than or equal' },
      { value: 'Contains', displayName: 'Contains' },
      { value: 'DoesNotContain', displayName: 'Does not contain' },
      { value: 'StartsWith', displayName: 'Starts with' },
      { value: 'DoesNotStartWith', displayName: 'Does not start with' },
      { value: 'Is', displayName: 'Is' },
      { value: 'IsNot', displayName: 'Is not' },
      { value: 'IsBlank', displayName: 'Is blank' },
      { value: 'IsNotBlank', displayName: 'Is not blank' },
      { value: 'IsEmptyString', displayName: 'Is empty string' },
      { value: 'IsNotEmptyString', displayName: 'Is not empty string' },
    ],
    value: { value: 'None', displayName: 'None' },
  });

  propertyName = new formattingSettings.TextInput({
    name: 'propertyName',
    displayName: 'Property Name',
    placeholder: 'Enter property name',
    value: '',
  });

  tableName = new formattingSettings.TextInput({
    name: 'tableName',
    displayName: 'Table Name',
    placeholder: 'Enter table name',
    value: '',
  });

  columnName = new formattingSettings.TextInput({
    name: 'columnName',
    displayName: 'Column Name',
    placeholder: 'Enter column name',
    value: '',
  });

  name: string = 'dataPoint';
  displayName: string = 'Ellipsis Drive Settings';
  slices: Array<FormattingSettingsSlice> = [
    this.enableFilter,
    this.iframeSrc,
    this.condition,
    this.propertyName,
    this.tableName,
    this.columnName,
  ];
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

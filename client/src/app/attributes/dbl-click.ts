import {bindable, bindingMode, inject} from 'aurelia-framework';
import {Utilities} from '../models/utilities';

@inject(Element, Utilities)
export class DblClickCustomAttribute {

    @bindable event: string;
    @bindable data: any;

    constructor(private element: Element, private utils: Utilities) {
        $(element).dblclick((event: JQueryEventObject) => {
            this.utils.fireEvent(this.event, this.data);
        });
    }

    eventChanged(newValue: string, oldValue: string) {
        var x = 1;
    }

    dataChanged(newValue: string, oldValue: string) {
        var x = 1;
    }
}
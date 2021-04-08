import { Component, Input, OnChanges } from '@angular/core';
import { DocumentDatastore, Resource, ValuelistDefinition } from 'idai-field-core';
import { HierarchyUtil } from '../../../../core/util/hierarchy-util';
import { ValuelistUtil } from '../../../../core/util/valuelist-util';


@Component({
    selector: 'dai-radio',
    templateUrl: `./radio.html`
})

/**
 * @author Fabian Z.
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export class RadioComponent implements OnChanges {

    @Input() resource: Resource;
    @Input() field: any;

    public valuelist: ValuelistDefinition;


    constructor(private datastore: DocumentDatastore) {}


    public getValues = () => this.valuelist ? ValuelistUtil.getOrderedValues(this.valuelist) : [];

    public getLabel = (valueId: string) => ValuelistUtil.getValueLabel(this.valuelist, valueId);


    async ngOnChanges() {

        this.valuelist = ValuelistUtil.getValuelist(
            this.field,
            await this.datastore.get('project'),
            await HierarchyUtil.getParent(this.resource, this.datastore)
        );
    }


    public setValue(value: any) {

        this.resource[this.field.name] = value;
    }


    public resetValue() {

        delete this.resource[this.field.name];
    }


    public hasEmptyValuelist(): boolean {

        return this.valuelist && Object.keys(this.valuelist.values).length === 0
    }
}

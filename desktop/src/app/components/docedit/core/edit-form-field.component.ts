import { Component, Input } from '@angular/core';
import { Resource, Field } from 'idai-field-core';
import { Language } from '../../../services/languages';


@Component({
    selector: 'edit-form-field',
    templateUrl: './edit-form-field.html'
})
/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class EditFormFieldComponent {

    @Input() resource: Resource;
    @Input() field: Field;
    @Input() languages: { [languageCode: string]: Language };
}

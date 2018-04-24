import {NgModule} from '@angular/core';
import {ImportComponent} from './import.component';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {UploadModalComponent} from './upload-modal.component';
import {Importer} from '../../core/importer/importer';
import {RelationsCompleter} from '../../core/importer/relations-completer';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule
    ],
    declarations: [
        ImportComponent,
        UploadModalComponent
    ],
    exports: [
        ImportComponent
    ],
    entryComponents: [
        UploadModalComponent
    ],
    providers: [
        RelationsCompleter
    ]
})

export class ImportModule {}
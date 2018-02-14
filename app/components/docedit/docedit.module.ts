import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';
import {IdaiDocumentsModule} from 'idai-components-2/documents';
import {DoceditComponent} from './docedit.component';
import {RouterModule} from '@angular/router';
import {IdaiWidgetsModule} from 'idai-components-2/widgets';
import {IdaiMessagesModule} from 'idai-components-2/messages';
import {WidgetsModule} from '../../widgets/widgets.module';
import {DoceditImageTabComponent} from './imagetab/docedit-image-tab.component';
import {DoceditConflictsTabComponent} from './docedit-conflicts-tab.component';
import {ConflictDeletedModalComponent} from './conflict-deleted-modal.component';
import {EditSaveDialogComponent} from './edit-save-dialog.component';
import {TypeSwitcherButtonComponent} from './type-switcher-button.component';
import {ImagePickerComponent} from "./imagetab/image-picker.component";
import {ImageGridModule} from "../imagegrid/image-grid.module";
import {DeleteModalComponent} from './delete-modal.component';
import {DocumentHolder} from './document-holder';

@NgModule({
    providers: [
      DocumentHolder
    ],
    imports: [
        BrowserModule,
        NgbModule,
        FormsModule,
        IdaiWidgetsModule,
        IdaiDocumentsModule,
        RouterModule,
        IdaiMessagesModule,
        WidgetsModule,
        ImageGridModule
    ],
    declarations: [
        ConflictDeletedModalComponent,
        DeleteModalComponent,
        DoceditComponent,
        EditSaveDialogComponent,
        DoceditImageTabComponent,
        DoceditConflictsTabComponent,
        TypeSwitcherButtonComponent,
        ImagePickerComponent
    ],
    exports: [
        EditSaveDialogComponent,
        DoceditComponent
    ],
    entryComponents: [
        DoceditComponent,
        ConflictDeletedModalComponent,
        ImagePickerComponent,
        DeleteModalComponent,
        EditSaveDialogComponent
    ]
})

export class DoceditModule {}
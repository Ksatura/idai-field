import {Component, EventEmitter, Input, OnChanges, Output, ViewChild} from '@angular/core';
import {Document} from 'idai-components-2/core';
import {IdaiFieldImageDocument} from '../../../../core/model/idai-field-image-document';
import {ImageGridComponent} from '../../../imagegrid/image-grid.component';
import {IdaiFieldImageDocumentReadDatastore} from "../../../../core/datastore/field/idai-field-image-document-read-datastore";

@Component({
    selector: 'thumbnail-view',
    moduleId: module.id,
    templateUrl: './thumbnail-view.html'
})
/**
 * @author Sebastian Cuy
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export class ThumbnailViewComponent implements OnChanges {

    @ViewChild('imageGrid') public imageGrid: ImageGridComponent;
    public documents: IdaiFieldImageDocument[];

    @Input() imageIds: string[];

    @Output() onRelationTargetClicked: EventEmitter<Document> = new EventEmitter<Document>();


    constructor(
        private datastore: IdaiFieldImageDocumentReadDatastore
    ) {}


    public onResize() {

        if (!this.documents || this.documents.length == 0) return;

        this.imageGrid.calcGrid();
    }


    public clickRelation(document: Document) {

        this.onRelationTargetClicked.emit(document);
    }


    ngOnChanges() {

        if (!this.imageIds) return;

        this.documents = [];
        let promise = Promise.resolve();
        for (let id of this.imageIds) {
            promise = promise.then(() => this.datastore.get(id))
                .then(doc => {
                    this.documents.push(doc as any);
                });
        }

        promise.then(() => this.imageGrid.calcGrid());
    }
}
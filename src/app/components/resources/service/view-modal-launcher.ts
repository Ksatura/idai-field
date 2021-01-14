import {Injectable} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Document, ImageDocument} from 'idai-components-2';
import {MenuContext, MenuService} from '../../menu-service';
import {ImageReadDatastore} from '../../../core/datastore/field/image-read-datastore';
import {ImageViewModalComponent} from '../../viewmodal/image/image-view-modal.component';
import {ResourceViewModalComponent} from '../../viewmodal/resource/resource-view-modal.component';


@Injectable()
/**
 * @author Thomas Kleinke
 */
export class ViewModalLauncher {

    constructor(private modalService: NgbModal,
                private datastore: ImageReadDatastore,
                private menuService: MenuService) {}


    public async openImageViewModal(document: Document) {

        this.menuService.setContext(MenuContext.MODAL);

        const images: Array<ImageDocument> = await this.getImageDocuments(
            document.resource.relations.isDepictedIn
        );

        const modalRef: NgbModalRef = this.modalService.open(
            ImageViewModalComponent,
            { size: 'lg', backdrop: 'static', keyboard: false }
        );
        await modalRef.componentInstance.initialize(
            images,
            images[0],
            document.resource.identifier
        );
        await modalRef.result;

        this.menuService.setContext(MenuContext.DEFAULT);
    }


    /**
     * Returns true if the document has been edited via the resource view modal, otherwise false
     */
    public async openResourceViewModal(document: Document): Promise<boolean> {

        this.menuService.setContext(MenuContext.MODAL);

        const modalRef: NgbModalRef = this.modalService.open(
            ResourceViewModalComponent,
            { size: 'lg', backdrop: 'static', keyboard: false }
        );
        await modalRef.componentInstance.initialize(document);
        const edited: boolean = await modalRef.result;

        this.menuService.setContext(MenuContext.DEFAULT);

        return edited;
    }


    private async getImageDocuments(relations: string[]|undefined): Promise<Array<ImageDocument>> {

        return relations
            ? this.datastore.getMultiple(relations)
            : [];
    }
}


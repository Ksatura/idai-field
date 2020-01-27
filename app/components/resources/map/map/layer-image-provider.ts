import {Injectable} from '@angular/core';
import {Imagestore} from '../../../../core/images/imagestore/imagestore';
import {ImageContainer} from '../../../../core/images/imagestore/image-container';
import {BlobMaker} from '../../../../core/images/imagestore/blob-maker';


@Injectable()
/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class LayerImageProvider {

    private imageContainers: { [resourceId: string]: ImageContainer } = {};


    constructor(private imagestore: Imagestore) {}


    public async getImageContainer(resourceId: string): Promise<ImageContainer> {

        if (!this.imageContainers[resourceId]) {
            this.imageContainers[resourceId] = await this.createImageContainer(resourceId);
        }

        return this.imageContainers[resourceId];
    }


    public reset() {

        for (let resourceId of Object.keys(this.imageContainers)) {
            const thumb: boolean = this.imageContainers[resourceId].imgSrc ? false : true;
            this.imagestore.revoke(resourceId, thumb);
        }

        this.imageContainers = {};
    }


    private createImageContainer(resourceId: string): Promise<ImageContainer> {

        return this.imagestore.read(resourceId, true, false)
            .then(url => {
                if (url != '') {
                    return Promise.resolve({ imgSrc: url });
                } else {
                    return this.imagestore.read(resourceId, true, true)
                        .then(thumbnailUrl => {
                            return Promise.resolve({ thumbSrc: thumbnailUrl });
                        }).catch(() => {
                            return Promise.resolve({ imgSrc: BlobMaker.blackImg });
                        });
                }
            }, () => {
                console.error('Error while creating image container. Original image not found in imagestore for ' +
                    'document:', document);
                return Promise.resolve({ imgSrc: BlobMaker.blackImg });
            });
    }
}
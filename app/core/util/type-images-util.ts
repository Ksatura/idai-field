import {isDefined} from 'tsfun';
import {asyncMap} from 'tsfun-extra';
import {FieldDocument, FieldResource} from 'idai-components-2';
import {FieldReadDatastore} from '../datastore/field/field-read-datastore';
import {ResourceId} from '../constants';
import {ModelUtil} from '../model/model-util';
import {ImageRowItem} from '../../components/image/row/image-row.component';
import getMainImageId = ModelUtil.getMainImageId;


/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export module TypeImagesUtil {

    /**
     * @param document: A document of resource type Type or TypeCatalog
     * @param datastore
     *
     * Returns images of linked types (for type catalogs) or finds (for types). If the types linked to a
     * type catalog are not directly linked to an image, the images of finds linked to the types are returned.
     */
    export function getLinkedImages(document: FieldDocument,
                                    datastore: FieldReadDatastore): Promise<Array<ImageRowItem>> {

        if (document.resource.type !== 'Type' && document.resource.type !== 'TypeCatalog') {
            throw Error('Illegal argument: Document must be of resource type Type or TypeCatalog.');
        }

        return document.resource.type === 'TypeCatalog'
            ? getLinkedImagesForTypeCatalog(document.resource.id, datastore)
            : getLinkedImagesForType(document.resource.id, datastore);
    }


    async function getLinkedImagesForTypeCatalog(resourceId: ResourceId,
                                                 datastore: FieldReadDatastore): Promise<Array<ImageRowItem>> {

        const documents: Array<FieldDocument> = (await datastore.find(
            { constraints: { 'liesWithin:contain': resourceId } }
        )).documents;

        return (await asyncMap(
            (document: FieldDocument) => getTypeImage(document.resource, datastore)
        )(documents)).filter(isDefined) as Array<ImageRowItem>;
    }


    async function getTypeImage(resource: FieldResource,
                                datastore: FieldReadDatastore): Promise<ImageRowItem|undefined> {

        let imageId: string|undefined = await ModelUtil.getMainImageId(resource);

        if (imageId) {
            return { imageId: imageId, resource: resource };
        } else {
            const linkedImageIds: Array<ImageRowItem> = await getLinkedImagesForType(
                resource.id, datastore
            );

            return linkedImageIds.length > 0
                ? linkedImageIds[0]
                : undefined;
        }
    }


    async function getLinkedImagesForType(resourceId: ResourceId,
                                          datastore: FieldReadDatastore): Promise<Array<ImageRowItem>> {

        const constraints = { constraints: { 'isInstanceOf:contain': resourceId }};

        return (await datastore.find(constraints))
            .documents
            .map(document => {
                const imageId: string|undefined = getMainImageId(document.resource);
                return imageId
                    ? { imageId: imageId, resource: document.resource }
                    : undefined;
            })
            .filter(isDefined) as Array<ImageRowItem>;
    }
}
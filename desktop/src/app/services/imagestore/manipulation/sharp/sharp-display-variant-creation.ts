import { ImageDocument, ImageStore, ImageVariant } from 'idai-field-core';
import { SharpImageManipulation } from './sharp-image-manipulation';
import { ImageManipulation } from '../image-manipulation';


/**
 * @author Thomas Kleinke
 */
export module SharpDisplayVariantCreation {

    /**
     * @returns A buffer containing data of a newly created display variant, or undefined if no display variant is needed.
     */
    export async function createDisplayVariant(document: ImageDocument, imagestore: ImageStore,
                                               originalData: Buffer): Promise<Buffer|undefined> {
        
        const imageId: string = document.resource.id;
        const fileExtension: string = ImageDocument.getOriginalFileExtension(document);
        const width: number = document.resource.width;
        const height: number = document.resource.height;

        const sharpImageHandle = SharpImageManipulation.getImageObject(originalData);

        const convertToJpeg: boolean = await shouldConvertToJpeg(
            width * height, fileExtension, sharpImageHandle
        );

        const resize: boolean = width > ImageManipulation.MAX_DISPLAY_WIDTH 
            || height > ImageManipulation.MAX_DISPLAY_HEIGHT;

        if (!convertToJpeg && !resize) {
            await imagestore.addUseOriginalMarker(imageId);
            return undefined;
        }

        const displayVariantData: Buffer = await SharpImageManipulation.createDisplayImage(
            sharpImageHandle, convertToJpeg, resize
        );

        await imagestore.store(imageId, displayVariantData, undefined, ImageVariant.DISPLAY);
        
        return displayVariantData;
    };


    async function shouldConvertToJpeg(pixels: number, fileExtension: string, sharpLibHandle: any): Promise<boolean> {

        if (fileExtension.toLowerCase().includes('tif')) return true;
        
        if (fileExtension.toLowerCase().includes('png') && pixels > ImageManipulation.MAX_ORIGINAL_PIXELS) {
            return await SharpImageManipulation.isOpaque(sharpLibHandle);
        }
    }
}

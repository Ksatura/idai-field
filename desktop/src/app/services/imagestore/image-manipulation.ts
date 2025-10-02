const sharp = window.require('sharp');


export module ImageManipulationErrors {

    export const MAX_INPUT_PIXELS_EXCEEDED = 'imageManipulation/maxInputPixelsExceeded';
}


/**
 * @author Thomas Kleinke
 */
export module ImageManipulation {

    export const MAX_INPUT_PIXELS = 2500000000;
    export const MAX_ORIGINAL_PIXELS = 25000000;
    export const MAX_DISPLAY_WIDTH = 10000;
    export const MAX_DISPLAY_HEIGHT = 10000;


    /**
     * Create a sharp image instance based on raw buffer data.
     * 
     * See also https://sharp.pixelplumbing.com.
     * 
     * @param buffer, the raw image data.
     * @returns A sharp instance or Error for invalid buffer parameters (for example 
     * if the absolute number of pixels exceeds Field Desktop's maximum)
     */
    export function getSharpImage(buffer: Buffer): any {

        console.log('Generating sharp image...');
        const sharpImage = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS });
        console.log('Finished generating sharp image');
        return sharpImage;
    }


    export async function createThumbnail(buffer: Buffer, targetHeight: number,
                                          targetJpegQuality: number): Promise<Buffer> {

        try {
            console.log('Starting thumbnail creation...');
            console.log('Sharp status:', sharp.counters());
            console.log('Max sharp threads:', sharp.concurrency());
            const sharpImage = getSharpImage(buffer);
            console.log('Resizing image to target height: ' + targetHeight);
            const resizedImage = sharpImage.resize(undefined, targetHeight);
            console.log('Converting to JPEG...');
            const jpegImage = resizedImage.jpeg({ quality: targetJpegQuality });
            console.log('Converting to buffer...');
            const result = await jpegImage.toBuffer();
            console.log('Finished generating thumbnail');
            return result;
        } catch (err) {
            console.error('Failed to generate thumbnail:', err);
            return undefined;
        }
    }


    export async function isOpaque(image: any): Promise<boolean> {

        const stats = await image.stats();
        return stats.isOpaque;
    }

    
    export async function createDisplayImage(image: any, convertToJpeg: boolean,
                                             resize: boolean): Promise<Buffer> {

        if (convertToJpeg) image = image.jpeg();
        if (resize) image = image.resize(MAX_DISPLAY_WIDTH, MAX_DISPLAY_HEIGHT, { fit: 'inside' });
        
        return image.toBuffer();
    }
}

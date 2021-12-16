import {Injectable, SecurityContext} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {ImageStore, ImageVariant} from 'idai-field-core';

@Injectable()
/**
 * Provides URLs for binary data read from the {@link ImageStore} for
 * usage in the Angular application.
 *
 * @author Sebastian Cuy
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 * @author Simon Hohl
 */
export class ImageUrlMaker {

    public static blackImg = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

    private originalUrls: { [imageKey: string]: SafeResourceUrl} = {};
    private thumbnailUrls: { [imageKey: string]: SafeResourceUrl} = {};

    constructor(private sanitizer: DomSanitizer, private imagestore: ImageStore) {}

    /**
     * Returns a URL to the image for the requested image resource.
     *
     * Internally creates a link to in-memory image data using {@link URL.createObjectURL}, you may want to call
     * {@link revokeImageUrl} or {@link revokeAllImageUrls} prematurely if you run into memory issues.
     * See also https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL.
     *
     * @param imageId the image's id
     * @param type the image's version, for possible values see {@link ImageVariant}
     */
     public async getUrl(imageId: string, type: ImageVariant): Promise<SafeResourceUrl> {

        const relevantList = (type === ImageVariant.ORIGINAL) ? this.originalUrls : this.thumbnailUrls;

        if (relevantList[imageId]) {
            return relevantList[imageId];
        }

        try {
            const data = await this.imagestore.getData(imageId, type);

            relevantList[imageId] = this.sanitizer.bypassSecurityTrustResourceUrl(
                URL.createObjectURL(new Blob([data]))
            );

            return relevantList[imageId];
        } catch (e) {
            return ImageUrlMaker.blackImg;
        }
    }


    /**
     * Forces a revokation of all URLs objects created by {@link getUrl}, freeing the linked binary data
     * up for garbage collection.
     */
     public revokeAllUrls() {

        for (const imageId of Object.keys(this.originalUrls)) {
            this.revokeUrl(imageId, ImageVariant.ORIGINAL);
        }

        for (const imageId of Object.keys(this.originalUrls)) {
            this.revokeUrl(imageId, ImageVariant.THUMBNAIL);
        }
    }

     private revokeUrl(imageId: string, type: ImageVariant) {

        const requestedList = (type === ImageVariant.ORIGINAL) ? this.originalUrls : this.thumbnailUrls;
        if (!requestedList[imageId]) return;

        URL.revokeObjectURL(this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, requestedList[imageId]));
        delete requestedList[imageId];
    }
}

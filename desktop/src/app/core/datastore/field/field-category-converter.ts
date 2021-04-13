import { Injectable } from '@angular/core';
import { takeOrMake, CategoryConverter, Document } from 'idai-field-core';
import { ProjectConfiguration } from '../../configuration/project-configuration';
import { Migrator } from './migrator';


@Injectable()
/**
 * @author Daniel de Oliveira
 */
export class FieldCategoryConverter extends CategoryConverter {

    constructor(private projectConfiguration: ProjectConfiguration) {

        super();
    }


    public convert<T extends Document>(document: Document): T {

        const convertedDocument: T = Migrator.migrate(document) as T;
        takeOrMake(convertedDocument, ['resource','identifier'], '');

        // if (this.projectConfiguration.isSubcategory(convertedDocument.resource.category, 'Image')) {
            // takeOrMake(convertedDocument, ['resource','relations','depicts'], []);
        // } else {
            // takeOrMake(convertedDocument, ['resource','identifier'],'');
            // takeOrMake(convertedDocument, ['resource','relations','isRecordedIn'], []);
        // }

        return convertedDocument;
    }
}

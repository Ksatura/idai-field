import { Relation } from '../model/configuration/relation';
import { Document, FieldWarnings } from '../model/document';
import { Resource } from '../model/resource';
import { ProjectConfiguration } from '../services/project-configuration';
import { Tree } from '../tools/forest';
import { InPlace } from '../tools/in-place';
import { Named } from '../tools/named';
import { DatastoreErrors } from './datastore-errors';
import { Migrator } from './migrator';
import { CategoryForm } from '../model/configuration/category-form';
import { Warnings } from './warnings';


export class CategoryConverter {

    constructor(private projectConfiguration: ProjectConfiguration) { }


    public convert(document: Document): Document {

        const convertedDocument = Migrator.migrate(document);
        const category: CategoryForm = this.projectConfiguration.getCategory(document.resource.category);
        CategoryConverter.updateWarnings(document, category);

        if (document.resource.category !== 'Configuration' && !category) {
            throw [DatastoreErrors.UNKNOWN_CATEGORY, document.resource.category];
        }

        InPlace.takeOrMake(convertedDocument, [Document.RESOURCE, Resource.IDENTIFIER], '');

        // TODO review after 2.19 released
        if (Tree.flatten(this.projectConfiguration.getCategories()).length > 0) {

            if (this.projectConfiguration.getImageCategories().map(Named.toName)
                .includes(convertedDocument.resource.category)) {
                    InPlace.takeOrMake(convertedDocument, [Document.RESOURCE, Resource.RELATIONS, Relation.Image.DEPICTS], []);
                } else {
                    InPlace.takeOrMake(convertedDocument, [Document.RESOURCE, Resource.RELATIONS, Relation.Hierarchy.RECORDEDIN], []);

                    if (this.projectConfiguration.getFeatureCategories().map(Named.toName)
                        .includes(convertedDocument.resource.category)) {
                            InPlace.takeOrMake(convertedDocument, [Document.RESOURCE, Resource.RELATIONS, Relation.Time.AFTER], []);
                            InPlace.takeOrMake(convertedDocument, [Document.RESOURCE, Resource.RELATIONS, Relation.Time.BEFORE], []);
                            InPlace.takeOrMake(convertedDocument, [Document.RESOURCE, Resource.RELATIONS, Relation.Time.CONTEMPORARY], []);
                        }
                }
        }

        return convertedDocument;
    }


    private static updateWarnings(document: Document, category: CategoryForm) {

        const warnings: FieldWarnings = Warnings.getWarnings(document, category);
        if (warnings) document.warnings = warnings;
    }
}

import { Ionicons } from '@expo/vector-icons';
import { Document, ProjectConfiguration } from 'idai-field-core';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Button from '../common/Button';
import DocumentButton from '../common/DocumentButton';
import Row from '../common/Row';


interface DocumentsListProps {
    config: ProjectConfiguration;
    documents: Document[];
    onDocumentSelected: (document: Document) => void;
    onParentSelected: (document: Document) => void;
}


const DocumentsList: React.FC<DocumentsListProps> = ({
    config,
    documents,
    onDocumentSelected,
    onParentSelected,
}) => {

    const onDrillDown = (document: Document) => {

        onParentSelected(document);
    };

    return <ScrollView>
        { documents.map(document => <Row style={ styles.row } key={ document.resource.id }>
            <DocumentButton
                style={ styles.documentButton }
                config={ config }
                document={ document }
                onPress={ () => onDocumentSelected(document) }
                size={ 25 }
            />
            <Button
                variant="transparent"
                onPress={ () => onDrillDown(document) }
                icon={ <Ionicons name="chevron-forward" size={ 18 } /> }
            />
        </Row>)}
    </ScrollView>;
};

export default DocumentsList;


const styles = StyleSheet.create({
    row: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'stretch',
    },
    documentButton: {
        flex: 1,
    }
});

import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { Document, ProjectConfiguration, SyncStatus } from 'idai-field-core';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ProjectSettings } from '../../models/preferences';
import { DocumentRepository } from '../../repositories/document-repository';
import AddModal from './AddModal';
import { DocumentsContainerDrawerParamList } from './DocumentsContainer';
import Map from './Map/Map';
import SearchBar from './SearchBar';


interface DocumentsMapProps {
    route: RouteProp<DocumentsContainerDrawerParamList, 'DocumentsMap'>;
    navigation: DrawerNavigationProp<DocumentsContainerDrawerParamList, 'DocumentsMap'>;
    repository: DocumentRepository;
    documents: Document[];
    selectedDocument?: Document;
    syncStatus: SyncStatus;
    projectSettings: ProjectSettings;
    config: ProjectConfiguration;
    languages: string[];
    setProjectSettings: (projectSettings: ProjectSettings) => void;
    issueSearch: (q: string) => void;
    isInOverview: () => boolean;
}


const DocumentsMap: React.FC<DocumentsMapProps> = ({
    route,
    navigation,
    repository,
    documents,
    syncStatus,
    projectSettings,
    config,
    languages,
    setProjectSettings,
    issueSearch,
    isInOverview
}): ReactElement => {

    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [highlightedDoc, setHighlightedDoc] = useState<Document>();

    const toggleDrawer = useCallback(() => navigation.toggleDrawer(), [navigation]);

    const onBarCodeScanned = useCallback((data: string) => {

        repository.find({ constraints: { 'identifier:match': data } })
            .then(({ documents: [doc] }) =>
                navigation.navigate('DocumentDetails', { docId: doc.resource.id })
            )
            .catch(() => Alert.alert(
                'Not found',
                `Resource  '${data}' is not available`,
                [ { text: 'OK' } ]
            ));
    }, [repository, navigation]);

    const handleAddDocument = (parentDoc: Document) => {
       setHighlightedDoc(parentDoc);
       setIsAddModalOpen(true);
    };

    const closeAddModal = () => setIsAddModalOpen(false);

    const navigateAddCategory = (categoryName: string, parentDoc: Document | undefined) => {
        closeAddModal();
        if(parentDoc) navigation.navigate('DocumentAdd',{ parentDoc, categoryName });
    };

        
    return (
        <View style={ { flex: 1 } }>
            {isAddModalOpen && <AddModal
                onClose={ closeAddModal }
                parentDoc={ highlightedDoc }
                config={ config }
                onAddCategory={ navigateAddCategory }
                isInOverview={ isInOverview }
            />}
            <SearchBar { ...{
                issueSearch,
                projectSettings,
                setProjectSettings,
                syncStatus,
                toggleDrawer,
                onBarCodeScanned
            } } />
            <View style={ styles.container }>
                <Map
                    repository={ repository }
                    selectedDocumentIds={ useMemo(() =>
                        documents.filter(doc => doc?.resource.geometry)
                        .map(doc => doc.resource.id),[documents]) }
                    config={ config }
                    languages={ languages }
                    highlightedDocId={ route.params?.highlightedDocId }
                    addDocument={ handleAddDocument } />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});


export default DocumentsMap;

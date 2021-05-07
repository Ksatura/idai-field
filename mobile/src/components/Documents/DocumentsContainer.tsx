import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { Document, ProjectConfiguration, SyncStatus } from 'idai-field-core';
import React from 'react';
import useSearch from '../../hooks/use-search';
import { ProjectSettings } from '../../models/preferences';
import { DocumentRepository } from '../../repositories/document-repository';
import DocumentDetails from './DocumentDetails';
import DocumentsMap from './DocumentsMap';
import DrawerContent from './DrawerContent';


export type DocumentsContainerDrawerParamList = {
    DocumentsMap: undefined;
    DocumentDetails: { docId: string };
};


export type DocumentsContainerDrawerNavProps<T extends keyof DocumentsContainerDrawerParamList> = {
    navigation: DrawerNavigationProp<DocumentsContainerDrawerParamList, T>;
    route: RouteProp<DocumentsContainerDrawerParamList, T>;
};


const Drawer = createDrawerNavigator<DocumentsContainerDrawerParamList>();


interface DocumentsContainerProps {
    repository: DocumentRepository;
    syncStatus: SyncStatus;
    projectSettings: ProjectSettings;
    config: ProjectConfiguration;
    setProjectSettings: (projectSettings: ProjectSettings) => void;
}


type DrawerNavigation = DrawerNavigationProp<DocumentsContainerDrawerParamList, 'DocumentsMap' | 'DocumentDetails'>;


const DocumentsContainer: React.FC<DocumentsContainerProps> = ({
    repository,
    syncStatus,
    projectSettings,
    config,
    setProjectSettings
}) => {

    const [documents, issueSearch] = useSearch(repository);
    const [allDocuments, _] = useSearch(repository);

    const onDocumentSelected = (doc: Document, navigation: DrawerNavigation) => {
    
        navigation.closeDrawer();
        navigation.navigate('DocumentDetails', { docId: doc.resource.id } );
    };

    return (
        
        <Drawer.Navigator
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            drawerContent={ ({ navigation }: { navigation: any }) => {

                return <DrawerContent
                    documents={ documents }
                    config={ config }
                    onDocumentSelected={ doc => onDocumentSelected(doc, navigation) }
                    onHomeButtonPressed={ () => navigation.navigate('HomeScreen') }
                    onSettingsButtonPressed={ () => navigation.navigate('SettingsScreen') } />;
            } }
        >
            <Drawer.Screen name="DocumentsMap">
                { (props) => <DocumentsMap { ...props }
                    repository={ repository }
                    documents={ documents }
                    allDocuments={ allDocuments }
                    issueSearch={ issueSearch }
                    syncStatus={ syncStatus }
                    projectSettings={ projectSettings }
                    config={ config }
                    setProjectSettings={ setProjectSettings } /> }
            </Drawer.Screen>
            <Drawer.Screen name="DocumentDetails">
                { (props) => <DocumentDetails { ...props }
                    config={ config }
                    docId={ props.route.params.docId }
                    repository={ repository }
                /> }
            </Drawer.Screen>
        </Drawer.Navigator>
    );
};


export default DocumentsContainer;

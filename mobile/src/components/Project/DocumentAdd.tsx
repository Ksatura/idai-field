import { MaterialIcons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import {
    Category, Document, NewDocument, NewResource, Resource
} from 'idai-field-core';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { isUndefinedOrEmpty } from 'tsfun';
import { ConfigurationContext } from '../../contexts/configuration-context';
import LabelsContext from '../../contexts/labels/labels-context';
import useToast from '../../hooks/use-toast';
import { DocumentRepository } from '../../repositories/document-repository';
import Button from '../common/Button';
import DocumentForm from '../common/forms/DocumentForm';
import { ToastType } from '../common/Toast/ToastProvider';
import { DocumentsContainerDrawerParamList } from './DocumentsContainer';

type DocumentAddNav = DrawerNavigationProp<DocumentsContainerDrawerParamList, 'DocumentAdd'>;

interface DocumentAddProps {
    repository: DocumentRepository;
    navigation: DocumentAddNav;
    parentDoc: Document;
    categoryName: string;
}

const DocumentAdd: React.FC<DocumentAddProps> = ({ repository, navigation, parentDoc, categoryName }) => {
    
    const config = useContext(ConfigurationContext);
    const { labels } = useContext(LabelsContext);

    const [category, setCategory] = useState<Category>();
    const [newResource, setNewResource] = useState<NewResource>();
    const [saveBtnEnabled, setSaveBtnEnabled] = useState<boolean>(false);
    const { showToast } = useToast();

    const setResourceToDefault = useCallback(() =>
        setNewResource({
            identifier: '',
            relations: createRelations(parentDoc),
            category: categoryName
        }),[parentDoc, categoryName]);
   
    useEffect(() => setResourceToDefault,[setResourceToDefault, category]);

    useEffect(() => {

        if(newResource?.identifier) setSaveBtnEnabled(true);
        else setSaveBtnEnabled(false);
    },[newResource]);

    useEffect(() => setCategory(config.getCategory(categoryName)),[config, categoryName]);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateResource = (key: string, value: any) =>
        setNewResource(oldResource => oldResource && { ...oldResource, [key]: value });

    const saveButtonHandler = () => {
        
        if(newResource){
            const newDocument: NewDocument = {
                resource: newResource
            };
            repository.create(newDocument)
                .then(doc => {
                    showToast(ToastType.Success,`Created ${doc.resource.identifier}`);
                    setResourceToDefault();
                    navigation.navigate('DocumentsMap',{ highlightedDocId: doc.resource.id });
                })
                .catch(_err => {
                    Keyboard.dismiss();
                    showToast(ToastType.Error,'Could not create resource!');
                    console.log(_err);
                });
        }
    };

    const onReturn = () => {
        setResourceToDefault();
        navigation.navigate('DocumentsMap',{});
    };
    
    if(!category || !labels) return null;
    
    
    return (
        <DocumentForm
            titleBarRight={
                <Button
                    variant="success"
                    onPress={ saveButtonHandler }
                    title="Save"
                    isDisabled={ !saveBtnEnabled }
                    icon={ <MaterialIcons name="save" size={ 18 } color="white" /> }
                /> }
            category={ category }
            headerText={ `Add ${labels.get(category)} to ${ parentDoc.resource.identifier }` }
            returnBtnHandler={ onReturn }
            resource={ newResource }
            updateFunction={ updateResource }
        />);
};

const createRelations = (parentDoc: Document): Resource.Relations => {

    const parentDocIsOperation = () => isUndefinedOrEmpty(parentDoc.resource.relations.isRecordedIn);
    const relations: Resource.Relations = { isRecordedIn:[] };
    
    if(parentDocIsOperation()){
        relations['isRecordedIn'] = [parentDoc.resource.id];
    } else {
        relations['isRecordedIn'] = [ parentDoc.resource.relations.isRecordedIn[0]];
        relations['liesWithin'] = [parentDoc.resource.id];
    }
    return relations;
};


export default DocumentAdd;

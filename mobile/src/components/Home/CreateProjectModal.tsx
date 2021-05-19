import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal } from 'react-native';
import Button from '../common/Button';
import Input from '../common/Input';
import TitleBar from '../common/TitleBar';

interface CreateProjectModalProps {
    onProjectCreated: (project: string) => void;
    onClose: () => void;
}


const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onProjectCreated, onClose }) => {

    const [project, setProject] = useState<string>('');


    const onCreate = () => {

        setProject('');
        onProjectCreated(project);
        onClose();
    };


    const onCancel = () => {

        setProject('');
        onClose();
    };


    return <Modal
        onRequestClose={ onCancel }
        animationType="slide"
    >
        <TitleBar title="Create project"
            left={ <Button
                title="Cancel"
                variant="transparent"
                icon={ <Ionicons name="close-outline" size={ 16 } /> }
                onPress={ onCancel }
            /> }
            right={ <Button
                title="Create"
                variant="success"
                onPress={ onCreate }
                isDisabled={ !project }
            /> }
        />
        <Input
            label="Project name"
            value={ project }
            onChangeText={ setProject }
            autoCapitalize="none"
            autoCompleteType="off"
            autoCorrect={ false }
            autoFocus
            helpText="The project name is the unique identifier for the project.
                Make sure to use the exact same project name if you intend to sync
                to other instances of iDAI.field."
            invalidText="Project name must not be empty."
            isValid={ project !== '' }
            style={ { margin: 10 } }
        />
    </Modal>;
};

export default CreateProjectModal;

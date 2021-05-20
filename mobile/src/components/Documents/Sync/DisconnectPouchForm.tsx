import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import Button from '../../common/Button';
import TitleBar from '../../common/TitleBar';

interface DisconnectPouchFormProps {
    onDisconnect: () => void;
    onClose: () => void;
}

const DisconnectPouchForm: React.FC<DisconnectPouchFormProps> = ({ onDisconnect, onClose }) => {
    return (
        <TitleBar
            title={ 'Connected' }
            left={ <Button
                title="Cancel"
                variant="transparent"
                icon={ <Ionicons name="close-outline" size={ 16 } /> }
                onPress={ onClose }
            /> }
            right={ <Button variant="danger" onPress={ onDisconnect } title="Disconnect" /> }
        />
    );
};

export default DisconnectPouchForm;

import { SyncStatus } from 'idai-field-core';
import { Box, HStack, Icon, IconButton, Input } from 'native-base';
import React from 'react';
import { SyncSettings } from '../model/sync-settings';
import SyncSettingsButton from './Sync/SyncSettingsButton';

interface SearchBarProps {
    issueSearch: (q: string) => void;
    syncSettings: SyncSettings;
    setSyncSettings: (settings: SyncSettings) => void;
    syncStatus: SyncStatus;
    toggleDrawer: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({
    issueSearch,
    syncSettings,
    setSyncSettings,
    syncStatus,
    toggleDrawer
}) => {

    return (
        <Box style={ styles.box }>
            <Input
                placeholder="Search..."
                variant="rounded"
                style={ styles.input }
                onChange={ issueSearch }
                InputLeftElement={ renderLeftIcons(toggleDrawer) }
                InputRightElement={ renderRightIcons(issueSearch, syncSettings, setSyncSettings, syncStatus) }
            />
        </Box>
    );
};


const renderLeftIcons = (onPress: () => void) =>
    <IconButton
        onPress={ onPress }
        icon={ <Icon type="Ionicons" name="menu" /> }
    />;
    

const renderRightIcons = (
    issueSearch: (q: string) => void,
    syncSettings: SyncSettings,
    setSyncSettings: (settings: SyncSettings) => void,
    syncStatus: SyncStatus
) =>
    <HStack>
        <IconButton
            onPress={ () => issueSearch('*') }
            isDisabled={ syncStatus === SyncStatus.Offline ? true : false }
            icon={ <Icon type="Ionicons" name="refresh" /> }
        />
        <SyncSettingsButton
            settings={ syncSettings }
            setSyncSettings={ setSyncSettings }
            status={ syncStatus }
        />
    </HStack>;


const styles = {
    box: {
        padding: 10
    },
    input: {
    }
};


export default SearchBar;

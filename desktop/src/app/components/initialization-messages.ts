const INITIALIZATION_MESSAGES = {
    'de': {
        'loading1': 'Projekt',
        'loading2': 'wird geladen...',
        'restart': 'Neu starten',
        'loadTestProject': 'Testprojekt laden',
        'phase/processingImages': 'Bilder werden für die Anzeige optimiert.\nDieser Schritt wird einmalig durchgeführt und kann einige Minuten dauern.',
        'alreadyOpenError': 'Die Anwendung konnte nicht gestartet werden. Bitte prüfen Sie, ob Field Desktop bereits in einem anderen Fenster geöffnet ist.',
        'databaseError': 'Ein Fehler ist aufgetreten: Die Projektdatenbank konnte nicht geladen werden.',
        'configurationError': 'Ein Fehler ist aufgetreten: Die Projektkonfiguration konnte nicht geladen werden.',
        'fetchDocumentsError': 'Ein Fehler ist aufgetreten: Die Projektressourcen konnte nicht aus der Datenbank gelesen werden.',
        'indexingError': 'Ein Fehler ist aufgetreten: Die Indizierung der Projektressourcen ist fehlgeschlagen.',
        'oneConfigurationError': 'Fehler in der Projektkonfiguration:',
        'multipleConfigurationErrors': 'Fehler in der Projektkonfiguration:',
        'configuration/error/invalidJson': 'Die Konfigurationsdatei "[0]" enthält kein valides JSON.',
        'configuration/error/missingValuelist': 'Die Werteliste für das Feld "[0]" der Kategorie "[1]" konnte nicht gefunden werden.',
        'configuration/error/missingFieldName': 'Ein in der Projektkonfiguration definiertes Feld hat keinen Namen.',
        'configuration/error/missingRelationCategory': 'Die in einer Relationsdefinition angegebene Kategorie "[0]" konnte nicht gefunden werden.',
        'configuration/fields/custom/parentNotDefined': 'Die Oberkategorie "[0]" konnte nicht gefunden werden.',
        'configuration/fields/custom/tryingToSubtypeANonExtendableCategory': 'Für die Kategorie "[0]" dürfen keine Unterkategorien angelegt werden.',
        'configuration/fields/custom/commonFieldValuelistFromProjectDocNotToBeOverwritten': 'Für das Feld "[1]" der Kategorie "[0]" darf keine Werteliste gesetzt werden, da die erlaubten Werte der Projektressource entnommen werden.',
        'configuration/buildProjectCategories/duplicationInSelection': 'Für die Kategorie "[0]" wurde mehr als ein Formular gewählt.',
        'configuration/buildProjectCategories/mustHaveParent': 'Für die Kategorie "[0]" muss eine Oberkategorie gewählt werden.',
        'configuration/buildProjectCategories/missingCategoryProperty': 'Die Eigenschaft "[0]" muss für die Kategorie "[1]" gesetzt werden.',
        'configuration/buildProjectCategories/illegalCategoryProperty': 'Die Eigenschaft "[0]" darf für die Kategorie "[1]" nicht gesetzt werden.',
        'configuration/buildProjectCategories/missingFieldProperty': 'Die Eigenschaft "[0]" muss für das Feld "[2]" der Kategorie "[1]" gesetzt werden.',
        'configuration/buildProjectCategories/mustNotSetInputType': 'Die Eigenschaft "inputType" darf für das Feld "[1]" der Kategorie "[0]" nicht geändert werden.',
        'configuration/buildProjectCategories/illegalFieldInputType': 'Der als Eigenschaft "inputType" des Feldes "[1]" gesetzte Wert "[0]" ist ungültig.',
        'configuration/buildProjectCategories/illegalFieldProperty': 'Die Eigenschaft "[1]" ist ungültig.',
        'configuration/buildProjectCategories/noValuelistProvided': 'Für das Feld "[1]" der Kategorie "[0]" wurde keine Werteliste angegeben.',
        'configuration/buildProjectCategories/triedToOverwriteParentField': 'Das in der Kategorie "[1]" definierte Feld "[0]" darf in der Subkategorie "[2]" nicht neu definiert werden.'
    },
    'en': {
        'loading1': 'Loading project',
        'loading2': '...',
        'restart': 'Restart',
        'loadTestProject': 'Load test project',
        'phase/processingImages': 'Images are being optimized for display.\nThis step is performed once and may take a few minutes.',
        'alreadyOpenError': 'The application could not be started. Please check if Field Desktop is already open in another window.',
        'databaseError': 'An error has occurred: The project database could not be loaded.',
        'configurationError': 'An error has occurred: The project configuration could not be loaded.',
        'fetchDocumentsError': 'An error has occurred: The project resources could not be read from the database.',
        'indexingError': 'An error has occurred: The indexing of the project resources has failed.',
        'oneConfigurationError': 'Error in project configuration:',
        'multipleConfigurationErrors': 'Errors in project configuration:',
        'configuration/error/invalidJson': 'The configuration file "[0]" does not contain valid JSON.',
        'configuration/error/missingValuelist': 'The value list for the field "[0]" of category "[1]" could not be found.',
        'configuration/error/missingFieldName': 'A field defined in the project configuration has no name.',
        'configuration/error/missingRelationCategory': 'The category "[0]" specified in a relation definition could not be found.',
        'configuration/fields/custom/parentNotDefined': 'The supercategory "[0]" could not be found.',
        'configuration/fields/custom/tryingToSubtypeANonExtendableCategory': 'No subcategories may be created for the category "[0]".',
        'configuration/fields/custom/commonFieldValuelistFromProjectDocNotToBeOverwritten': 'No value list may be set for the field "[1]" of the category "[0]" as the allowed values are taken from the project resource.',
        'configuration/buildProjectCategories/duplicationInSelection': '',
        'configuration/buildProjectCategories/mustHaveParent': 'More than one form was selected for the category "[0]".',
        'configuration/buildProjectCategories/missingCategoryProperty': 'The property "[0]" must be set for the category "[1]".',
        'configuration/buildProjectCategories/illegalCategoryProperty': 'The property "[0]" must not be set for the category "[1]".',
        'configuration/buildProjectCategories/missingFieldProperty': 'The property "[0]" must be set for field "[2]" of category "[1]".',
        'configuration/buildProjectCategories/mustNotSetInputType': 'The property "inputType" must not be changed for field "[1]" of category "[0]".',
        'configuration/buildProjectCategories/illegalFieldInputType': 'The value "[0]" set as property "inputType" of field "[1]" is invalid.',
        'configuration/buildProjectCategories/illegalFieldProperty': 'The property "[1]" is invalid.',
        'configuration/buildProjectCategories/noValuelistProvided': 'No value list has been specified for field "[1]" of category "[0]".',
        'configuration/buildProjectCategories/triedToOverwriteParentField': 'The field "[0]" defined in category "[1]" must not be redefined in subcategory "[2]".'
    },
    'it': {
        'loading1': 'Progetto',
        'loading2': 'in caricamento...',
        'restart': 'Restart',
        'loadTestProject': 'Caricare progetto di prova',
        'phase/processingImages': 'Le immagini vengono ottimizzate per la visualizzazione.\nQuesto processo viene eseguito una sola volta e può richiedere alcuni minuti.',
        'alreadyOpenError': 'The application could not be started. Please check if Field Desktop is already open in another window.',
        'databaseError': 'Si è verificato un errore: non è stato possibile caricare il database del progetto.',
        'configurationError': 'Si è verificato un errore: non è stato possibile caricare la configurazione del progetto.',
        'fetchDocumentsError': 'Si è verificato un errore: le risorse del progetto non possono essere estratte dal database.',
        'indexingError': 'Si è verificato un errore: indicizzazione delle risorse del progetto non riuscita.',
        'oneConfigurationError': 'Errore nella configurazione del progetto:',
        'multipleConfigurationErrors': 'Errori nella configurazione del progetto:',
        'configuration/error/invalidJson': 'Il file di configurazione "[0]" non contiene un formato JSON valido.',
        'configuration/error/missingValuelist': 'Impossibile trovare la lista di valori per il campo "[0]" della categoria "[1]".',
        'configuration/error/missingFieldName': 'Un campo definito nella configurazione del progetto non ha nome.',
        'configuration/error/missingRelationCategory': 'Impossibile trovare la categoria "[0]" specificata in una definizione di relazione.',
        'configuration/fields/custom/parentNotDefined': 'Impossibile trovare la categoria superiore "[0]".',
        'configuration/fields/custom/tryingToSubtypeANonExtendableCategory': 'Per la categoria "[0]" non è possibile creare sottocategorie.',
        'configuration/fields/custom/commonFieldValuelistFromProjectDocNotToBeOverwritten': 'Per il campo "[1]" della categoria "[0]" non è possibile impostare liste di valori perchè i valori ammessi provengono dalla risorsa del progetto.',
        'configuration/buildProjectCategories/duplicationInSelection': 'Per la categoria "[0]" è stato selezionato più di un modulo.',
        'configuration/buildProjectCategories/mustHaveParent': 'È necessario selezionare una categoria superiore per la categoria "[0]".',
        'configuration/buildProjectCategories/missingCategoryProperty': 'La proprietà "[0]" deve essere impostata per la categoria "[1]".',
        'configuration/buildProjectCategories/illegalCategoryProperty': 'La proprietà "[0]" non può essere impostata per la categoria "[1]".',
        'configuration/buildProjectCategories/missingFieldProperty': 'La proprietà "[0]" deve essere impostata per il campo "[2]" della categoria "[1]".',
        'configuration/buildProjectCategories/mustNotSetInputType': 'La proprietà "inputType" non può essere modificata per il campo "[1]" della categoria "[0]".',
        'configuration/buildProjectCategories/illegalFieldInputType': 'Il valore "[0]" indicato per la proprietà "inputType" del campo "[1]" non è valido.',
        'configuration/buildProjectCategories/illegalFieldProperty': 'La proprietà "[1]" non è valida.',
        'configuration/buildProjectCategories/noValuelistProvided': 'Per il campo "[1]" della categoria "[0]" non è stata indicata nessuna lista di valori.',
        'configuration/buildProjectCategories/triedToOverwriteParentField': 'Il campo "[0]" della categoria "[1]" non può essere ridefinito nella sottocategoria "[2]".'
    }, 'uk': {
        'loading1': 'Проект',
        'loading2': 'Завантаження...',
        'restart': 'Стартувати заново',
        'loadTestProject': 'Завантаження тестового проекту',
        'alreadyOpenError': 'Не вдалося запустити програму. Будь ласка, перевірте, чи програму Field Desktop уже відкрито в іншому вікні.',
        'phase/processingImages': 'Ілюстрації буде оптимізовано для відображення.\nЦей крок виконається один раз і може зайняти декілька хвилин.',
        'databaseError': 'Сталася помилка: не вдалося завантажити базу даних проекту.',
        'configurationError': 'Сталася помилка: не вдалося завантажити конфігурацію проекту.',
        'fetchDocumentsError': 'Сталася помилка: ресурси проекту не вдалося прочитати з бази даних.',
        'indexingError': 'Сталася помилка: не вдалося виконати індексацію ресурсів проекту.',
        'oneConfigurationError': 'Помилка в конфігурації проекту:',
        'multipleConfigurationErrors': 'Помилка в конфігурації проекту:',
        'configuration/error/invalidJson': 'Файл конфігурації "[0]" не містить дійсного JSON.',
        'configuration/error/missingValuelist': 'Не вдалося знайти список значень для поля "[0]" категорії "[1]".',
        'configuration/error/missingFieldName': 'Поле, визначене в конфігурації проекту, не має назви/імені.',
        'configuration/error/missingRelationCategory': 'Не вдалося знайти категорію "[0]", вказану у визначенні відношення.',
        'configuration/fields/custom/parentNotDefined': 'Не вдалося знайти основну/батьківську категорію "[0]".',
        'configuration/fields/custom/tryingToSubtypeANonExtendableCategory': 'Для категорії "[0]" не можна створювати підкатегорії.',
        'configuration/fields/custom/commonFieldValuelistFromProjectDocNotToBeOverwritten': 'Не можна встановлювати список значень для поля "[1]" категорії "[0]", оскільки дозволені значення взяті з ресурсу проекту.',
        'configuration/buildProjectCategories/duplicationInSelection': 'Для категорії "[0]" вибрано більше однієї форми.',
        'configuration/buildProjectCategories/mustHaveParent': 'Для категорії "[0]" необхідно вибрати основну/батьківську категорію.',
        'configuration/buildProjectCategories/missingCategoryProperty': 'Властивість «[0]» повинна бути встановлена ​​для категорії «[1]».',
        'configuration/buildProjectCategories/illegalCategoryProperty': 'Властивість "[0]" не можна встановлювати для категорії "[1]".',
        'configuration/buildProjectCategories/missingFieldProperty': 'Для поля "[2]" категорії "[1]" необхідно встановити властивість "[0]".',
        'configuration/buildProjectCategories/mustNotSetInputType': 'Властивість "inputType" (Тип входу) не можна змінювати для поля "[1]" категорії "[0]".',
        'configuration/buildProjectCategories/illegalFieldInputType': 'Значення "[0]", установлене як властивість "inputType" (Тип входу) поля "[1]", недійсне.',
        'configuration/buildProjectCategories/illegalFieldProperty': 'Значення "[1]" недійсне.',
        'configuration/buildProjectCategories/noValuelistProvided': 'Для поля «[1]» категорії «[0]» не вказано список значень.',
        'configuration/buildProjectCategories/triedToOverwriteParentField': 'Поле «[0]», визначене в категорії «[1]», не можна перевизначати в підкатегорії «[2]».'
    },
};


export const getMessage = (key: string, locale: string, parameters?: string[]): string | undefined => {

    let message: string = INITIALIZATION_MESSAGES[locale][key];

    if (!message) return undefined;

    if (parameters) {
        for (let i = 0; i < parameters.length; i++) {
            message = message.replace('[' + i + ']', parameters[i]);
        }
    }

    return message;
};

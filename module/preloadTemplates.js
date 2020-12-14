export const preloadHandlebarsTemplates = async function () {
    const templatePaths = [
        //Character Sheets
        'systems/assh/templates/actors/character-sheet.html',
        'systems/assh/templates/actors/monster-sheet.html',
        //Actor partials
        //Sheet tabs
        'systems/assh/templates/actors/partials/character-header.html',
        'systems/assh/templates/actors/partials/character-attributes-tab.html',
        'systems/assh/templates/actors/partials/character-abilities-tab.html',
        'systems/assh/templates/actors/partials/character-spells-tab.html',
        'systems/assh/templates/actors/partials/character-inventory-tab.html',
        'systems/assh/templates/actors/partials/character-notes-tab.html',

        'systems/assh/templates/actors/partials/monster-header.html',
        'systems/assh/templates/actors/partials/monster-attributes-tab.html'
    ];
    return loadTemplates(templatePaths);
};

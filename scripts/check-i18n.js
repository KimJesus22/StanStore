const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '../src/messages');
const SOURCE_LANG = 'es.json';
const TARGET_LANGS = ['en.json', 'ko.json'];

function readJson(file) {
    const filePath = path.join(MESSAGES_DIR, file);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(file, data) {
    const filePath = path.join(MESSAGES_DIR, file);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`Updated ${file}`);
}

function deepMerge(source, target) {
    let modified = false;

    // Iterate over source keys
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null) {
            // Nested object
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {}; // Create structure if missing
                modified = true;
            }
            const nestedModified = deepMerge(source[key], target[key]);
            if (nestedModified) modified = true;
        } else {
            // Leaf value
            if (!target.hasOwnProperty(key)) {
                target[key] = `MISSING_TRANSLATION: ${source[key]}`;
                console.log(`+ Added missing key: ${key} -> ${target[key]}`);
                modified = true;
            }
        }
    }
    return modified;
}

function main() {
    console.log('--- i18n Checker ---');
    console.log(`Source Language: ${SOURCE_LANG}`);

    const sourceData = readJson(SOURCE_LANG);

    TARGET_LANGS.forEach(langFile => {
        console.log(`\nChecking ${langFile}...`);
        const targetData = readJson(langFile);

        const modified = deepMerge(sourceData, targetData);

        if (modified) {
            writeJson(langFile, targetData);
        } else {
            console.log('No missing keys found.');
        }
    });

    console.log('\nDone.');
}

main();

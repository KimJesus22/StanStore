const fs = require('fs');
const path = require('path');

// Definición de Features Identificados
const features = [
    'auth',
    'cart',
    'product',
    'checkout',
    'admin',
    'search'
];

// Estructura interna por Feature
const subdirs = [
    'components',
    'hooks',
    'api',
    'types',
    'utils'
];

// Rutas base
const srcDir = path.join(__dirname, '..', 'src');
const featuresDir = path.join(srcDir, 'features');

// 1. Crear directorio base src/features
if (!fs.existsSync(featuresDir)) {
    fs.mkdirSync(featuresDir);
    console.log(`✅ Creado: ${featuresDir}`);
} else {
    console.log(`ℹ️  Ya existe: ${featuresDir}`);
}

// 2. Iterar sobre features
features.forEach(feature => {
    const featurePath = path.join(featuresDir, feature);

    // Crear carpeta del feature
    if (!fs.existsSync(featurePath)) {
        fs.mkdirSync(featurePath);
        console.log(`  📂 Feature: ${feature}`);
    }

    // Crear subdirectorios
    subdirs.forEach(subdir => {
        const subdirPath = path.join(featurePath, subdir);
        if (!fs.existsSync(subdirPath)) {
            fs.mkdirSync(subdirPath);
            // Crear un .gitkeep para asegurar que git trackee la carpeta
            fs.writeFileSync(path.join(subdirPath, '.gitkeep'), '');
        }
    });
    console.log(`     ✨ Estructura creada en ${feature}/`);
});

console.log('\n🚀 Scaffolding completado. Listo para migrar archivos.');

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('--- Running ESM to CJS Patch for @rumsan/user ---');

function resolveModulePath(moduleName) {
    try {
        const userPath = path.resolve(process.cwd(), 'node_modules', '@rumsan', 'user');
        // Try to resolve relative to @rumsan/user first (nested)
        return path.dirname(require.resolve(`${moduleName}/package.json`, { paths: [userPath] }));
    } catch (e) {
        try {
            // Fallback to root node_modules
            return path.dirname(require.resolve(`${moduleName}/package.json`));
        } catch (err) {
            return null;
        }
    }
}

function patchSingleFileModule(moduleName, fileEntry) {
    const modulePath = resolveModulePath(moduleName);
    if (!modulePath) {
        console.log(`[Patch] Skipped: ${moduleName} not found`);
        return;
    }

    const pkgPath = path.join(modulePath, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.type === 'module') {
            delete pkg.type;
            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
            console.log(`[Patch] Removed "type": "module" from ${moduleName}`);
        }
    }

    const targetFile = path.join(modulePath, fileEntry);
    if (!fs.existsSync(targetFile)) {
        console.log(`[Patch] Skipped: ${targetFile} not found`);
        return;
    }

    console.log(`[Patch] Bundling ${moduleName}/${fileEntry} to CJS...`);
    execSync(`npx --yes esbuild "${targetFile}" --bundle --format=cjs --outfile="${targetFile}" --allow-overwrite`, { stdio: 'inherit' });
}

function patchJose() {
    const modulePath = resolveModulePath('jose');
    if (!modulePath) {
        console.log(`[Patch] Skipped: jose not found`);
        return;
    }

    const pkgPath = path.join(modulePath, 'package.json');
    let pkg = {};
    if (fs.existsSync(pkgPath)) {
        pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.type === 'module') {
            delete pkg.type;
            // Force require() to use index.js which we will create below
            pkg.main = 'index.js';
            fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
            console.log(`[Patch] Removed "type": "module" from jose and set main to index.js`);
        }
    }

    // Find the actual ESM entry point
    let esmEntry = 'dist/node/esm/index.js'; // jose v6 typical path
    if (!fs.existsSync(path.join(modulePath, esmEntry))) {
        esmEntry = pkg.module || 'index.js';
    }

    const targetFile = path.join(modulePath, esmEntry);
    const outFile = path.join(modulePath, 'index.js');

    if (!fs.existsSync(targetFile)) {
        console.log(`[Patch] Skipped: jose ESM entry ${targetFile} not found`);
        return;
    }

    console.log(`[Patch] Bundling jose to CJS...`);
    execSync(`npx --yes esbuild "${targetFile}" --bundle --format=cjs --outfile="${outFile}" --allow-overwrite`, { stdio: 'inherit' });
}

patchSingleFileModule('@noble/curves', 'secp256k1.js');
patchSingleFileModule('@noble/hashes', 'sha2.js');
patchJose();

console.log('--- ESM Patch Complete ---');

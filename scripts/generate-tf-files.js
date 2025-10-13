const fs = require('fs');
const { terraformManifestYaml } = require('./index');
fs.writeFileSync('./src/data/manifest/terraform/main.tf', terraformManifestYaml);

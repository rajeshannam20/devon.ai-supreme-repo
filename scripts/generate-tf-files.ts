import fs from 'fs';
import { terraformManifestYaml } from '../src/data/manifest/terraform/index';
fs.writeFileSync('./src/data/manifest/terraform/main.tf', terraformManifestYaml);

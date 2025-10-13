import fs from 'fs';
import { terraformManifestYaml } from '../src/data/manifest/terraform/index.ts';

fs.writeFileSync('./src/data/manifest/terraform/main.tf', terraformManifestYaml);

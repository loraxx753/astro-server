import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const typeDefsArray = loadFilesSync(path.join(__dirname, '..', 'schemas', 'types', '*.graphql'), { extensions: ['graphql'] });

export default mergeTypeDefs(typeDefsArray);
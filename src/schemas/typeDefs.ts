import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaGlob = path.join(__dirname, "types", "*.graphql");
const typeDefsArray = loadFilesSync(schemaGlob, { extensions: ["graphql"] });

if (!typeDefsArray.length) {
  throw new Error(`No GraphQL schema files found at ${schemaGlob}`);
}

export default mergeTypeDefs(typeDefsArray);
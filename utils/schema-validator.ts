// @ts-ignore
import fs from 'fs/promises';
// @ts-ignore
import path from 'path';
import Ajv from "ajv";
import { createSchema } from 'genson-js';
import addFormats from 'ajv-formats';

const SCHEMA_BASE_PATH = './response-schemas';
const ajv = new Ajv({allErrors: true});
addFormats(ajv);

export async function validateSchema(dirName: string, fileName: string, responseBody: object, createSchemaFlag: boolean = false) {
    const schemaPath = path.join(SCHEMA_BASE_PATH, dirName, `${fileName}_schema.json`);

    if(createSchemaFlag) await generateNewSchema(responseBody, schemaPath);

    const schema = await loadSchema(schemaPath);
    const validate = ajv.compile(schema);
    const valid = validate(responseBody);
    if(!valid)
        throw new Error(`Schema validation ${fileName}_schema.json failed: \n` +
            `${JSON.stringify(validate.errors, null, 4)}\n\n` +
            `Actual response body: \n` +
            `${JSON.stringify(responseBody, null, 4)}`);
}

async function loadSchema(schemaPath: string) {
    try{
        const schemaContent = await fs.readFile(schemaPath, 'utf-8');
        return JSON.parse(schemaContent);
    } catch(e) {
        throw new Error(`Failed to read schema file: ${e.message}`);
    }
}

async function generateNewSchema(responseBody: object, schemaPath: string) {
    try {
        const generatedSchema = createSchema(responseBody);
        
        addDateTimeFormats(generatedSchema);

        await fs.mkdir(path.dirname(schemaPath), { recursive: true});
        await fs.writeFile(schemaPath, JSON.stringify(generatedSchema, null, 4));
    }catch(e) {
        throw new Error(`Failed to create schema file: ${e.message}`)
    }
}

function addDateTimeFormats(schema: any): void {
    if (!schema || typeof schema !== 'object') return;

    // Check if this is a properties object with createdAt or updatedAt
    if (schema.properties) {
        ['createdAt', 'updatedAt'].forEach(dateField => {
            if (schema.properties[dateField] && schema.properties[dateField].type === 'string') {
                schema.properties[dateField].format = 'date-time';
            }
        });
    }

    // Recursively process nested properties
    if (schema.properties) {
        Object.values(schema.properties).forEach((prop: any) => {
            addDateTimeFormats(prop);
        });
    }

    // Handle array items
    if (schema.items) {
        addDateTimeFormats(schema.items);
    }

    // Handle anyOf, oneOf, allOf
    ['anyOf', 'oneOf', 'allOf'].forEach(key => {
        if (Array.isArray(schema[key])) {
            schema[key].forEach((item: any) => addDateTimeFormats(item));
        }
    });
}

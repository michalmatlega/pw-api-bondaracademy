// // @ts-ignore
// import dotenv from 'dotenv';
// // @ts-ignore
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const processENV = process.env.TEST_ENV;
const env = processENV || 'dev';
console.log(`Test environment is: ${env}`)

const config = {
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: process.env.USER,
    userPassword: process.env.PASS,
}

if(env === 'qa') {
    //todo: add throw exception when env no provided
    config.userEmail = 'pw'
    config.userPassword = 'another pass';
}

export { config };

const processENV = process.env.TEST_ENV;
const env = processENV || 'dev';
console.log(`Test environment is: ${env}`)

const config = {
    apiUrl: 'https://conduit-api.bondaracademy.com/api',
    userEmail: process.env.USER,
    userPassword: process.env.PASS,
}

if(env === 'qa') {
    config.userEmail = 'pw'
    config.userPassword = 'another pass';
}

export { config };

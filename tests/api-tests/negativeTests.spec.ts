import { test } from '../../utils/fixtures';
import { expect } from '../../utils/custom-expect';

[
    {
        username: 'd',
        usernameErrorMessage: 'is too short (minimum is 3 characters)'
    },
    {
        username: 'ddd',
        usernameErrorMessage: ''
    },
    {
        username: 'd'.repeat(20),
        usernameErrorMessage: ''
    },
    {
        username: 'd'.repeat(21),
        usernameErrorMessage: 'is too long (maximum is 20 characters)'
    },
].forEach(({username, usernameErrorMessage}) => {
    test(`Error message validation for username: "${username}"`, async({api}) => {

        const newUserResponse = await api
            .path('/users')
            .body({
                "user": {
                    "email": "d",
                    "password": "d",
                    "username": username
                }
            })
            .clearAuth()
            .postRequest(422);

        await expect(newUserResponse).shouldMatchSchema('users', 'POST_users');

        if(username.length === 3 || username.length === 20) {
            expect(newUserResponse.errors).not.toHaveProperty('username');
        } else {
            expect(newUserResponse.errors.username[0]).shouldEqual(usernameErrorMessage);
        }

        console.log(newUserResponse);
    })
})



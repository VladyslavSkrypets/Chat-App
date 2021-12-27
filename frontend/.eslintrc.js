module.exports = {
    "env": {
        "node": true,
        // todo: why node in front app?
        "browser": true,
        "es6": true,
        "commonjs": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:sonarjs/recommended",
        "plugin:prettier/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "sonarjs",
    ],
    "rules": {
        "react/prop-types": "off"
    },
    "ignorePatterns": [".eslintrc.js"]
};

# wik-app
The where is kevin react native application.

- `https://wik-general-api-408585232460.europe-west4.run.app` - The API for the app

## Handy commands
- `gcloud auth application-default login` to authenticate with Google Cloud

## Getting Started
- `npx create-expo-app .` to create a new expo app
- `npm install` to install dependencies
- `npx expo start` to start the app
- `npm install --global eas-cli && eas init --id cb192ef1-a64d-4586-b178-4c4aaed12fbc` to install eas-cli and initialize the project
- `npx expo export --platform web` to export the app for web
- `npx serve dist` to serve the app for web
- `npx eas deploy` to deploy the app for web add (--prod) for production
- `npx eas build --platform android` to build the app for android
- `npx eas submit --platform ios` to submit the app for ios
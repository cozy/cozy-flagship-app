# Storybook usage

`yarn storybook` will launch the application in storybook mode. This will allow you to view all the components in the application and their various states.

`yarn prestorybook` is launched automatically before `yarn storybook` and will update the storybook.requires.js file with the latest components. This is required to ensure that the storybook is up to date.

Refer to the [Storybook documentation](https://github.com/storybookjs/react-native) for more information.

# Known issues:
- Bad handling of file creation during Metro watch (storybook.requires isn't rebuilt)

- Should implement a path alias to the Storybook folder

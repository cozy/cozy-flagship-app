# Tips for a better developer experience

## About the lock screen

If enabled in Cozy Settings you'll always get a lock screen in the app.

If disabled in Cozy Settings and your phone is not protected, you'll get a CTA screen that ask you to set a pin.

If disabled in Cozy Settings and your phone is protected, you won't be bothered anymore.

## Disable flagship certification in your local stack

Add the snippet below in your `cozy.yml` config to disable flagship certification in your local stack for all your local Cozy in dev context.

```yml
flagship:
  contexts:
    dev:
      skip_certification: true
```

## Use default redirection to speed up your development

If you are developing a feature on a cozy app like Photos, you can set the default redirection of your Cozy to Photos to go directly to Photos when you start the flagship app.

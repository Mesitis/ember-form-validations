### Lego blocks

We need a form to have the following properties:
- `clientFormErrors`: errors due to checks made before a form is submitted
- `serverFormErrors`: errors arising from the request that was made
- `clientFormErrorStatus`:  if errors exist within `clientFormErrors`
- `serverFormErrorStatus`: if errors exist within `serverFormErrors`

### Usage

- Each of `clientFormErrors` and `serverFormErrors` represent key-value pairs of errors. They need to be initialized on the form component e.g

``` js
export default Component.extend(ValidatableFormMixin, {

  clientFormErrors: EmberObject.create({
    identification : null,
    password       : null
  }),

  serverFormErrors: EmberObject.create({
    credentials: null
  })

})
```

- Within Canopy forms, we wanna satisfy the following
  - all errors should show up together at the end of the form before the submit
  - the erroneous fields need to be highlighted with a red cross
  - focusing into an erroneous field should clear the error
  - focusing out of a field should do the validation for whether the field deserves an error
  - submit button needs to be disabled if any fields are erroneous
  - a server error would mean cleaning out existing client errors
  - focusing into a field after getting a server error should clear the server error

### `ValidatableFormMixin`

The `ValidatableFormMixin` makes life easier when dealing with the requirements listed out above. The following are made available
- fn `currentFormErrorStatus` (args: `type`, which can either be `server` or `client`). returns `true` or `false` depending on whether relevant errors exist
- fn `updateServerError` (args: `property`, `error`) - since the server errors are passed on from a parent component, this can be used to update the `serverFormErrors` with the relevant error, through `didUpdateAttrs` for example
- fn `updateClientError` (args: `property`, `error`)
- hook `afterServerErrorUpdate`
- hook `afterClientErrorUpdate`
- hook `afterClearingFieldError`
- hook `afterSettingFieldError`
- action `setFieldError` (args: `field`)
- action `clearFieldError` (args: `field`)

# `transform-grid-options`

> _Transform AG Grid options_

## Description

This plugin returns a source code transformation that will update fields on AG Grid options objects, including modifying the relevant attributes on AG Grid React/Angular/Vue elements.

## Common tasks

### Creating a new Grid Options transform

Run the following script within the current workspace package:

```
pnpm run task:create-transform --plugin transform-grid-options
```

This will prompt for the name of the transform, and will create the source files for the transform based on a template.

### Adding rules to an existing Grid Options transform

Grid option transformation rules are typically defined in the `./replacements.ts` file within a directory that defines a Grid Options transform.

There are three types of options: migrating field names, transforming field values, and deprecating fields.

#### Renaming object fields

Grid options fields can be renamed using the `migrateProperty(toName, valueTransformer)` helper.

For example, to rename an optional grid options field named `hello` to a field named `greet`, maintaining its value as-is:

```javascript
  hello: migrateProperty('greet', migrateOptionalValue())
```

...the value can additionally be transformed, e.g. inverting the field value if specified:

```javascript
  friendly: migrateProperty('unfriendly', invertOptionalBooleanValue())
```

See existing transform rules for more advanced usage examples.

#### Transforming existing object field values

If the field does not need renaming, but the value needs to be transformed, grid options fields can have their values modified using the `transformPropertyValue(valueTransformer)` helper.

For example, you can apply a complex value transformation that locates a `columnDefs` object and applies a complex transformation to that field's value:

```javascript
  columnDefs: transformPropertyValue(
    transformOptionalValue(
      transformObjectListValue(
        transformObjectProperties({
          suppressMenu: migrateProperty('headerMenuButton', invertOptionalBooleanValue()),
        }),
      ),
    ),
  )
```

> This example assumes that `columnDefs` is an optional field that contains an array of objects, each of which can specify a `suppressMenu` field that, if present, will be renamed and its value inverted.

Value transformer combinators can be nested indefinitely, allowing modifications to fields deep inside the grid options object.

#### Deprecating object fields

Grid options fields can be deprecated using the `removeProperty(message)` helper.

This will cause the codemod to emit a warning when this field is detected, whose `message` is typically generated via one of the `getDeprecationMessage(fieldName, migrationUrl)` / `getManualInterventionMessage(fieldName, migrationUrl)` helpers.

```
  goodbye: removeProperty(getDeprecationMessage('goodbye', MIGRATION_URL)),
```

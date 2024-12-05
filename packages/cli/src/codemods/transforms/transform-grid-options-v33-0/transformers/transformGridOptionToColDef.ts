import j, { ASTPath, ObjectProperty, JSXAttribute } from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import { getKeyValueNode, getSibling, getValueFromNode } from './utils';

const transformOptionToColDef =
  (option: string) => (path: ASTPath<ObjectProperty | JSXAttribute>) => {
    const isGridOption =
      getSibling(path, 'rowData') ||
      getSibling(path, 'rowModel') ||
      getSibling(path, 'columnDefs') ||
      getSibling(path, 'defaultColDef');
    if (!isGridOption) {
      // likely in a col def
      return;
    }

    const defaultColDef = getSibling(path, 'defaultColDef');
    if (defaultColDef) {
      const defaultColDefVal = getValueFromNode(defaultColDef);
      defaultColDefVal.properties = defaultColDefVal.properties.filter(
        (property) => property.key.name !== option,
      );
      // prioritise grid option
      defaultColDefVal.properties.push(
        j.objectProperty(
          j.identifier(option),
          getValueFromNode(path.value) ?? j.booleanLiteral(true),
        ),
      );
      // if defaultColDef exists, delete this prop
      path.replace();
      return;
    }

    // if no defaultColDef, add it
    path.replace(
      getKeyValueNode(
        path,
        'defaultColDef',
        j.objectExpression([
          j.objectProperty(
            j.identifier(option),
            getValueFromNode(path.value) ?? j.booleanLiteral(true),
          ),
        ]),
      ),
    );
  };

const transformGridOptionToColDef: (optionName: string) => JSCodeShiftTransformer =
  (optionName: string) => (root) => {
    // translate optionName to defaultColDef.optionName
    root
      .find(ObjectProperty, { key: { name: optionName } })
      .forEach(transformOptionToColDef(optionName));
    root
      .find(JSXAttribute, { name: { name: optionName } })
      .forEach(transformOptionToColDef(optionName));
  };

export { transformGridOptionToColDef };

module.exports = [
  new SyntaxError(`This method has been deprecated

> | gridApi.showColumnMenuAfterButtonClick('foo', document.body.firstChild);
  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`This method has been deprecated

> | gridApi.showColumnMenuAfterMouseEvent('foo', new MouseEvent('click'));
  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
  new SyntaxError(`This method has been deprecated

> | gridApi?.showColumnMenuAfterMouseEvent('foo', new MouseEvent('click'));
  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`),
];

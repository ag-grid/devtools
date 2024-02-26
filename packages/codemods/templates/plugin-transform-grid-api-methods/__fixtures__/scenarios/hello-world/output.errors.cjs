module.exports = [
  new SyntaxError(`This method has been deprecated
   7 |
   8 | gridApi.helloWorld();
>  9 | gridApi.goodbyeWorld();
     | ^^^^^^^^^^^^^^^^^^^^^^
  10 |`),
];

require('./file');

it("should include selected file when compiling", done => {
  expect(__webpack_modules__[require.resolve('foo')].toString())
    .toContain('__prefresh_utils__');
  done();
});

require('./file');

it("should exclude selected file when compiling", done => {
  expect(__webpack_modules__[require.resolve('./file.js')].toString())
    .not.toContain('__prefresh_utils__');
  done();
});

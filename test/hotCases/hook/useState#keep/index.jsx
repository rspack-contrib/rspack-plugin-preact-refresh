import React from 'react';
import ReactDOM from 'react-dom/client';
import update from '../../update';
import { App } from './app';

const container = document.createElement('div');
container.id = 'root';
document.body.appendChild(container);
const root = ReactDOM.createRoot(container);
root.render(
  <div>
    <App />
  </div>,
);

it('should keep state', (done) => {
  expect(container.querySelector('span').textContent).toBe('before: light');
  setTimeout(() => {
    expect(container.querySelector('span').textContent).toBe('before: dark');
    NEXT(
      update(done, true, () => {
        expect(container.querySelector('span').textContent).toBe('after: dark');
        done();
      }),
    );
  }, 200);
});

if (module.hot) {
  module.hot.accept('./app');
}

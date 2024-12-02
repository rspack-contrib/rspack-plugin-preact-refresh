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

it('should rerender when children change', (done) => {
  expect(container.querySelector('span').textContent).toBe('no child');
  NEXT(
    update(done, true, () => {
      expect(container.querySelector('.component-a').textContent).toBe('same name component in component-a');
      expect(container.querySelector('.component-b').textContent).toBe('same name component in component-b');
      NEXT(
        update(done, true, () => {
          expect(container.querySelector('.component-a').textContent).toBe(
            'change same name component in component-a',
          );
          expect(container.querySelector('.component-b').textContent).toBe(
            'same name component in component-b',
          );
          done();
        }),
      );
    }),
  );
});

if (module.hot) {
  module.hot.accept('./app');
}

export function App() {
  return (<div><span>no child</span></div>);
}

---
import { ChildA } from './child-a'
import { ChildB } from './child-b'

export function App() {
  return (
    <div>
      <ChildA />
      <ChildB />
    </div>
  );
}

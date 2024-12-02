throw new Error("should not been imported");
---
import { SameNameComponent } from './same-name-component';

export function ChildB() {
  return (<span className="component-b"><SameNameComponent /></span>);
}
---
import { SameNameComponent } from './same-name-component';

export function ChildB() {
  return (<span className="component-b"><SameNameComponent /></span>);
}

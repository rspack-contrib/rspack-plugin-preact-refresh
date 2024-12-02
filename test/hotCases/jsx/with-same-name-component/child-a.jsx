throw new Error("should not been imported");
---
function SameNameComponent() {
  return <span>same name component in component-a</span>;
}

export function ChildA() {
  return (<span className="component-a"><SameNameComponent /></span>);
}
---
function SameNameComponent() {
  return <span>same name component in component-a</span>;
}

export function ChildA() {
  return (<span className="component-a">{'change '}<SameNameComponent /></span>);
}

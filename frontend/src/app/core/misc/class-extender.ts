/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export const ClassExtender =
  (extendableClasses: Function[]) =>
  (targetClass: Function): void => {
    // targetClass - klasa, która będzie rozszerzała klasy z listy `extendableClasses`
    extendableClasses.forEach(extendingClass => {
      Object.getOwnPropertyNames(extendingClass.prototype).forEach(name => {
        Object.defineProperty(targetClass.prototype, name, Object.getOwnPropertyDescriptor(extendingClass.prototype, name));
      });
    });
  };

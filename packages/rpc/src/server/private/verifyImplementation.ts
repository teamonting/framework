import type { StubDeclaration } from '../../types/StubDeclaration';
import type { StubImplementation } from '../../types/StubImplementation';

function verifyImplementation<T extends StubDeclaration<S>, S extends StubImplementation>(
  declaration: T,
  implementation: S
) {
  const declaredKeySet = new Set(declaration.keys);
  const implementedKeySet = new Set(Object.getOwnPropertyNames(implementation));

  const differences = declaredKeySet.symmetricDifference(implementedKeySet);

  if (differences.size) {
    throw new Error(`Keys in stub declaration does not match implementation: ${Array.from(differences).join(', ')}`);
  }
}

export default verifyImplementation;

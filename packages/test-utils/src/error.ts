export function withErrorPrefix<T>(prefix: string, fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      error.message = `${prefix}\n\n${error.message}`;
    }
    throw error;
  }
}

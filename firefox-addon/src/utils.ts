export async function delay(milliSeconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliSeconds))
}

export function isDefined(input: unknown): boolean {
  return input !== undefined
}

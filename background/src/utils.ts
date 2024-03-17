export async function delay(milliSeconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliSeconds))
}

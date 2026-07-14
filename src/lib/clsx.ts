export type ClassValue = string | number | null | undefined | false | ClassValue[]

export function clsx(...values: ClassValue[]): string {
  return values
    .flat(Infinity as never)
    .filter(Boolean)
    .join(' ')
}

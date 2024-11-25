export type Language = "en" | "ja" | "zh"

export function localized(key: string): string | undefined
export function localized(key: string, defaultValue: string): string
export function localized(
  key: string,
  defaultValue: string,
  language?: Language
): string
export function localized(
  key: string,
  defaultValue?: string,
  language?: Language
): string | undefined {
  // ja-JP or ja -> ja

  return defaultValue
}

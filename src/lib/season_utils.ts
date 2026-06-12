/** 年月日から季節を自動判定（日本の気候に合わせた簡易版） */

export function detect_season(date_str: string): string {
  const month = new Date(date_str).getMonth() + 1

  if (month >= 3 && month <= 5) return '春'
  if (month >= 6 && month <= 8) return '夏'
  if (month >= 9 && month <= 11) return '秋'
  return '冬'
}

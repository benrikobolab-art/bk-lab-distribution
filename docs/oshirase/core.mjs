export const TEMPLATES = {
  "イベント案内": ["イベントのお知らせ", ["日時", "場所", "内容", "持ち物", "連絡先"]],
  "休業案内": ["休業のお知らせ", ["期間", "理由", "再開日", "連絡先"]],
  "注意喚起": ["注意のお知らせ", ["対象", "注意事項", "期間", "連絡先"]],
  "募集": ["募集のお知らせ", ["募集内容", "対象", "申込方法", "締切", "連絡先"]],
  "持ち物案内": ["持ち物のお知らせ", ["日時", "対象", "持ち物", "注意事項", "連絡先"]],
  "会議案内": ["会議のお知らせ", ["日時", "場所", "議題", "対象", "持ち物", "連絡先"]],
  "当番案内": ["当番のお知らせ", ["期間", "担当", "集合場所", "持ち物", "連絡先"]],
  "点検案内": ["点検のお知らせ", ["日時", "場所", "対象", "お願い", "連絡先"]],
  "工事案内": ["工事のお知らせ", ["期間", "場所", "工事内容", "お願い", "連絡先"]],
  "一般通知": ["お知らせ", ["日時", "対象", "本文", "お願い", "連絡先"]]
};

export const GREETINGS = {
  春: "春暖の候、皆さまにはますますご健勝のこととお喜び申し上げます。",
  夏: "盛夏の候、皆さまにはお変わりなくお過ごしのことと存じます。",
  秋: "秋涼の候、皆さまにはますますご健勝のこととお喜び申し上げます。",
  冬: "寒冷の候、皆さまにはお変わりなくお過ごしのことと存じます。"
};

export function seasonForMonth(month) {
  if ([3, 4, 5].includes(month)) return "春";
  if ([6, 7, 8].includes(month)) return "夏";
  if ([9, 10, 11].includes(month)) return "秋";
  return "冬";
}

export function clamp(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.round(number))) : fallback;
}

export function effectiveIntroFont(text, requested) {
  const length = String(text || "").replaceAll("\n", "").length;
  const chosen = clamp(requested, 11, 22, 15);
  const safeMax = length <= 80 ? 22 : length <= 140 ? 16 : 13;
  return Math.min(chosen, safeMax);
}

export function proofread(data) {
  const replacements = {"宜しく": "よろしく", "有難う": "ありがとう", "下さい": "ください", "致します": "いたします", "出来ます": "できます", "頂く": "いただく"};
  const messages = [];
  for (const [label, value] of Object.entries(data)) {
    if (typeof value !== "string" || !value.trim()) continue;
    for (const [oldText, newText] of Object.entries(replacements)) {
      if (value.includes(oldText)) messages.push(`${label}：「${oldText}」は「${newText}」の表記が一般的です`);
    }
    if (/[。、，,]{2,}/.test(value)) messages.push(`${label}：句読点が連続しています`);
    if (/[ \t　]{2,}/.test(value)) messages.push(`${label}：空白が連続しています`);
  }
  return messages.length ? messages : ["気になる表記は見つかりませんでした。最終確認は必ず行ってください。"];
}


export type RiskCategory =
  | 'Lower Risk'
  | 'Suspicious'
  | 'High Risk';

export interface WarningIndicator {
  id: string;
  label: string;
  detail: string;
  points: number;
  matchedPhrase?: string;
}

export interface ScamAnalysis {
  score: number;
  category: RiskCategory;
  summary: string;
  indicators: WarningIndicator[];
  advice: string[];
}

interface Rule {
  id: string;
  label: string;
  detail: string;
  points: number;
  pattern: RegExp;
}

// Local, explainable pattern checks only. Weights are heuristic and unvalidated.
// Each category contributes once even if several matching phrases are present.
const RULES: Rule[] = [
  {
    id: 'credentials',
    label: 'Requests for sensitive account information',
    detail: 'Asks for passwords, sign-in codes, or financial account details.',
    points: 30,
    pattern: /\b(password|passcode|one[- ]time (?:code|password)|otp|verification code|security code|pin number|banking details|card details|account number|login credentials)\b/i,
  },
  {
    id: 'urgent-threat',
    label: 'Urgency or threat of account trouble',
    detail: 'Uses a deadline, threat, or account restriction to rush a decision.',
    points: 20,
    pattern: /\b(urgent|immediately|act now|within \d+ hours?|final notice|will be (?:closed|suspended|locked)|account (?:suspended|locked|will close)|legal action|warrant|arrest|penalty|expire[sd]?)\b/i,
  },
  {
    id: 'reward',
    label: 'Unexpected prize, reward, or refund',
    detail: 'Promises money or a prize you may not have expected.',
    points: 20,
    pattern: /\b(you(?:'|’)ve won|winner|prize|reward|cashback|refund|claim your|free gift|lottery|congratulations)\b/i,
  },
  {
    id: 'link',
    label: 'Suspicious link or web address',
    detail: 'Contains a shortened, unencrypted, numeric, or unusual destination pattern. ScamShield does not open or verify links.',
    points: 20,
    pattern: /\bhttp:\/\/\S+|\b(?:bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|goo\.gl|ow\.ly|buff\.ly)\/\S*|\b(?:https?:\/\/)?(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/\S*)?|\bxn--[a-z0-9-]+|\b[a-z0-9-]+\.(?:top|xyz|click|zip|mov|shop|support|info|work|site|example)\b/i,
  },
  {
    id: 'payment',
    label: 'Payment, transfer, or fee requested',
    detail: 'Asks you to send money, pay a fee, or use an unusual payment method.',
    points: 25,
    pattern: /\b(pay(?:ment)?|fee|wire transfer|bank transfer|money transfer|gift card|crypto(?:currency)?|bitcoin|deposit|processing charge|send (?:money|funds)|payment details)\b/i,
  },
  {
    id: 'impersonation',
    label: 'Possible organization impersonation',
    detail: 'A named bank, agency, delivery, or support service is used to establish trust.',
    points: 15,
    pattern: /\b(bank|government|irs|tax office|social security|police|customs|postal service|delivery|courier|package|customer support|tech support|help desk|microsoft|apple|amazon|paypal)\b/i,
  },
  {
    id: 'pressure',
    label: 'Secrecy or extreme pressure',
    detail: 'Pressures you to keep this private or act without checking.',
    points: 10,
    pattern: /\b(do not tell|don't tell|keep (?:this )?(?:a )?secret|keep this confidential|do not discuss|act fast|right away|no time to explain|only chance)\b/i,
  },
];

const BASE_ADVICE = [
  'Pause before replying, clicking, or sharing any information.',
  'Contact the organization through a number or website you find independently.',
  'Never share a password, one-time code, or payment details in response to an unexpected message.',
];

export function analyzeMessage(message: string): ScamAnalysis {
  const indicators = RULES.flatMap((rule) => {
    const match = rule.pattern.exec(message)?.[0];
    if (!match) return [];
    const matchedPhrase =
      match.length > 120 ? `${match.slice(0, 117)}…` : match;
    return [
      {
        id: rule.id,
        label: rule.label,
        detail: rule.detail,
        points: rule.points,
        matchedPhrase,
      },
    ];
  });
  const score = Math.min(
    100,
    indicators.reduce((total, indicator) => total + indicator.points, 0),
  );
  const category: RiskCategory =
    score >= 60 ? 'High Risk' : score >= 30 ? 'Suspicious' : 'Lower Risk';

  const summary =
    category === 'High Risk'
      ? 'Several strong warning signs appear together. Do not follow the message’s instructions until you verify them independently.'
      : category === 'Suspicious'
        ? 'Some warning signs deserve a closer look. Take a moment to verify the sender and request before responding.'
        : indicators.length
          ? 'A small number of warning signs appeared. Use extra care and verify any request through a trusted channel.'
          : 'No common warning patterns were detected in this text. That alone does not prove it is safe.';

  const advice = [...BASE_ADVICE];
  if (indicators.some(({ id }) => id === 'link')) {
    advice.unshift('Avoid opening the link. Visit the organization’s official site by typing its address yourself.');
  }
  if (indicators.some(({ id }) => id === 'credentials')) {
    advice.unshift('Do not share passwords, PINs, or one-time codes with anyone who contacted you.');
  }

  return { score, category, summary, indicators, advice: [...new Set(advice)] };
}

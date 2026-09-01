import type { MessageKey } from './en';

export const he: Record<MessageKey, string> = {
  'common.continue': 'המשך',
  'common.back': 'חזרה',
  'common.next': 'הבא',
  'common.start': 'התחלה',
  'brand.tagline': 'מערכת אישית לצמיחת שיער',
  'locale.toggle.toHe': 'עברית',
  'locale.toggle.toEn': 'English',

  'landing.eyebrow': 'מערכת אישית לצמיחת שיער',
  'landing.cta': 'אבחון שיער חינם',

  'scale.norwood.label': 'סולם נורווד–המילטון',
  'scale.ludwig.label': 'סולם לודוויג',

  'severity.mild': 'מוקדם',
  'severity.moderate': 'בינוני',
  'severity.established': 'מבוסס',

  'zone.frontal-hairline': 'קו השיער הקדמי',
  'zone.temples': 'הרקות',
  'zone.mid-scalp': 'מרכז הקרקפת',
  'zone.crown-vertex': 'קודקוד הראש',

  // TODO: confirm with client — clinical Hebrew phrasing (spec §12 PENDING inventory)
  'zone-note.frontal-hairline': 'נסיגה לאורך קו השיער הקדמי.',
  'zone-note.temples': 'שתי פינות הרקות נסוגו לאחור.',
  'zone-note.mid-scalp': 'כיסוי מופחת במרכז הקרקפת.',
  'zone-note.crown-vertex': 'דילול בקודקוד עם שקיפות של הקרקפת.',

  'metric.pattern-stage': 'שלב הדפוס',
  'metric.relative-density': 'צפיפות יחסית',
  'metric.thickness-caliber': 'עובי השערה',
  'metric.scalp-visibility': 'חשיפת הקרקפת',

  'note.treatment-naive': 'לא בוצע טיפול קודם לנשירת שיער.',
  'note.prior-no-response': 'טיפול קודם ללא שיפור מורגש.',
  'note.prior-partial': 'טיפול קודם עם שיפור חלקי.',
  'note.family-history-positive': 'קיים רקע משפחתי של נשירת שיער.',
  'note.family-history-unknown': 'רקע משפחתי לא ודאי.',
  'note.family-history-negative': 'אין רקע משפחתי מדווח של נשירת שיער.',

  'summary.norwood.mild': 'דילול מוקדם בדפוס, ממוקד באזורים בודדים. איכות השערה נראית תקינה.',
  'summary.norwood.moderate': 'דילול בדפוס שכבר מבוסס באזורים המסומנים.',
  'summary.norwood.established': 'דילול ותיק בדפוס עם קרקפת חשופה במספר אזורים.',
  'summary.ludwig.mild': 'דילול מפוזר מוקדם, בולט בעיקר לאורך הפסוקת.',
  'summary.ludwig.moderate': 'דילול מפוזר עם התרחבות הפסוקת וירידה בנפח.',
  'summary.ludwig.established': 'דילול מפוזר ניכר במרכז הקרקפת.',

  'diagnosis.rail.intro': 'הקדמה',
  'diagnosis.rail.gender': 'עליך',
  'diagnosis.rail.photos': 'תמונות',
  'diagnosis.rail.analysis': 'ניתוח',
  'diagnosis.rail.results': 'תוצאות',

  'diagnosis.intro.title': 'האבחון החינמי שלך',
  'diagnosis.intro.point1': 'לוקח רק כמה דקות',
  'diagnosis.intro.point2': 'ניתוח שיער מבוסס AI',
  'diagnosis.intro.point3': 'תוכנית טיפול אישית',

  'diagnosis.gender.title': 'מה המין שלך?',
  'diagnosis.gender.male': 'גבר',
  'diagnosis.gender.female': 'אישה',
};

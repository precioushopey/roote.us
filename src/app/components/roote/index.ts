/**
 * ROOTÉ primitive system (WP1). Distinctive, intentional building blocks for
 * the redesign — cream/ivory ground, emerald as the one accent, elevation
 * (shadow) only for genuine depth, the three-strand mark as the recurring
 * motif. Pages
 * compose these; they never reach into content config or i18n for domain
 * content themselves.
 */

export { Button, IconButton, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';
export { Card, GlassCard } from './Surface';
export { Eyebrow, DisplayTitle, Prose, TextLink } from './Text';
export { Badge, Pill, type BadgeTone } from './Badge';
export { Stat } from './Stat';
export { Section } from './Section';

export { Accordion, type AccordionItem } from './Accordion';
export { RadioCard, SegmentedControl } from './Choice';
export { Stepper, type Step } from './Stepper';
export { Modal, Drawer } from './Overlay';
export { ToastProvider, useToast } from './Toast';
export { Tooltip } from './Tooltip';
export { LegalNotice, ConsentPanel } from './Notice';

export { ConcernCard, ProductCard, ProgramCard, IngredientCard } from './DomainCards';
export { AnalysisMetric, ScanCard, ScanGuide, type MetricLevel } from './Scan';
export { Timeline, TreatmentChecklist, ProgressPhotoCard, type TimelineMilestone, type ChecklistTask } from './Progress';
export { BeforeAfterSlider } from './BeforeAfterSlider';
export { ProgramProgressBar } from './ProgramProgressBar';
export { ReportSection } from './ReportSection';
export { CountryLanguageSelector } from './CountryLanguageSelector';

// re-exports of foundation pieces so pages import from one place
export { MediaPlaceholder, type MediaKind } from '@/app/components/media/MediaPlaceholder';
export { PendingChip } from '@/app/components/brand/PendingChip';

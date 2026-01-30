/**
 * FAQ Section
 *
 * Frequently asked questions about FonPick
 */

'use client'

import { Accordion, AccordionItem } from '@/components/shared/Accordion'
import { useTranslations } from 'next-intl'

// ============================================================================
// FAQ SECTION COMPONENT
// ============================================================================

const FAQ_KEYS = [
  'updateFrequency',
  'noData',
  'priorityOrder',
  'smartMoneyDefinition',
  'riskOnOff',
  'contradiction',
  'crossRanked',
] as const

export function FAQSection() {
  const t = useTranslations('guide.faq')

  // Generate FAQ items with translation content
  const faqs: AccordionItem[] = FAQ_KEYS.map((key) => ({
    id: key,
    title: t(`items.${key}.title` as any),
    content: <FAQContent itemKey={key} />,
  }))

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-100">
        {t('title')}
      </h2>

      <Accordion items={faqs} allowMultiple={false} />
    </section>
  )
}

// Helper component to render FAQ content with translations
interface FAQContentProps {
  itemKey: typeof FAQ_KEYS[number]
}

function FAQContent({ itemKey }: FAQContentProps) {
  const t = useTranslations('guide.faq')

  // Render different content based on FAQ type
  if (itemKey === 'updateFrequency') {
    return (
      <div className="text-gray-300 space-y-2">
        <p>{t('items.updateFrequency.content.time' as any)}</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>{t('items.updateFrequency.content.sources' as any)}</li>
          <li>{t('items.updateFrequency.content.dataSource' as any)}</li>
        </ul>
      </div>
    )
  }

  if (itemKey === 'noData') {
    return (
      <div className="text-gray-300 space-y-2">
        <p>{t('items.noData.content.reason' as any)}</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {(t.raw('items.noData.content.reasons') as string[]).map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (itemKey === 'priorityOrder') {
    return (
      <div className="text-gray-300 space-y-2">
        <p>{t('items.priorityOrder.content.reason' as any)}</p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          {(t.raw('items.priorityOrder.content.priorities') as string[]).map((priority, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: priority }} />
          ))}
        </ol>
      </div>
    )
  }

  if (itemKey === 'smartMoneyDefinition') {
    return (
      <div className="text-gray-300 space-y-2">
        <p>{t('items.smartMoneyDefinition.content.definition' as any)}</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {(t.raw('items.smartMoneyDefinition.content.types') as string[]).map((type, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: type }} />
          ))}
        </ul>
        <p className="text-sm mt-2">{t('items.smartMoneyDefinition.content.advantage' as any)}</p>
      </div>
    )
  }

  if (itemKey === 'riskOnOff') {
    return (
      <div className="text-gray-300 space-y-2">
        <p>{t('items.riskOnOff.content.definition' as any)}</p>
        <div className="grid md:grid-cols-2 gap-3 mt-2">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="font-semibold text-green-400">{t('items.riskOnOff.content.riskOn' as any)}</p>
            <p className="text-sm">{t('items.riskOnOff.content.riskOnDesc' as any)}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="font-semibold text-red-400">{t('items.riskOnOff.content.riskOff' as any)}</p>
            <p className="text-sm">{t('items.riskOnOff.content.riskOffDesc' as any)}</p>
          </div>
        </div>
      </div>
    )
  }

  if (itemKey === 'contradiction') {
    return (
      <div className="text-gray-300 space-y-2">
        <p>{t('items.contradiction.content.reason' as any)}</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {(t.raw('items.contradiction.content.possibilities') as string[]).map((possibility, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: possibility }} />
          ))}
        </ul>
        <p className="text-sm mt-2 text-yellow-400">{t('items.contradiction.content.advice' as any)}</p>
      </div>
    )
  }

  if (itemKey === 'crossRanked') {
    return (
      <div className="text-gray-300 space-y-2">
        <p>{t('items.crossRanked.content.definition' as any)}</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {(t.raw('items.crossRanked.content.examples') as string[]).map((example, i) => (
            <li key={i}>{example}</li>
          ))}
        </ul>
        <p className="text-sm mt-2" dangerouslySetInnerHTML={{ __html: t('items.crossRanked.content.conclusion' as any) }} />
      </div>
    )
  }

  return <div className="text-gray-300">Content not found</div>
}

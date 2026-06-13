'use client'

import { useState, useEffect } from 'react'
import { Scissors, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

const SIZE_DATA = [
  { number: 50, letter: 'XS',  length: { inch: 50,   cm: 127 }, sleeve: { inch: 26,   cm: 66  }, bust: { inch: 40, cm: 104 }, hips: { inch: 44, cm: 112 } },
  { number: 52, letter: 'S',   length: { inch: 52,   cm: 132 }, sleeve: { inch: 26.5, cm: 67  }, bust: { inch: 42, cm: 109 }, hips: { inch: 46, cm: 117 } },
  { number: 54, letter: 'M',   length: { inch: 54,   cm: 137 }, sleeve: { inch: 27,   cm: 69  }, bust: { inch: 43, cm: 112 }, hips: { inch: 48, cm: 122 } },
  { number: 56, letter: 'L',   length: { inch: 56,   cm: 142 }, sleeve: { inch: 28,   cm: 71  }, bust: { inch: 45, cm: 117 }, hips: { inch: 52, cm: 132 } },
  { number: 58, letter: 'XL',  length: { inch: 58,   cm: 148 }, sleeve: { inch: 28.5, cm: 72  }, bust: { inch: 46, cm: 117 }, hips: { inch: 54, cm: 137 } },
  { number: 60, letter: 'XXL', length: { inch: 60,   cm: 153 }, sleeve: { inch: 29,   cm: 74  }, bust: { inch: 47, cm: 119 }, hips: { inch: 60, cm: 152 } },
] as const

type SizeRow = (typeof SIZE_DATA)[number]
type Unit = 'cm' | 'inch'
type StyleType = 'open' | 'closed'

const MEASUREMENT_FIELDS = [
  { key: 'length', label: 'Abaya Length' },
  { key: 'sleeve', label: 'Sleeve'       },
  { key: 'bust',   label: 'Bust'         },
  { key: 'hips',   label: 'Hips'         },
] as const

type MeasurementKey = (typeof MEASUREMENT_FIELDS)[number]['key']

const WHATSAPP_NUMBER = '917356958972'

interface Props {
  productName: string
  productSlug: string
}

export default function CustomizeDrawer({ productName, productSlug }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('customize-open', open)
    return () => { document.body.classList.remove('customize-open') }
  }, [open])
  const [styleType, setStyleType] = useState<StyleType | null>(null)
  const [unit, setUnit] = useState<Unit>('cm')
  const [selectedSize, setSelectedSize] = useState<SizeRow | null>(null)
  const [measurements, setMeasurements] = useState<Record<MeasurementKey, string>>({
    length: '', sleeve: '', bust: '', hips: '',
  })

  const applySize = (size: SizeRow, u: Unit = unit) => {
    setSelectedSize(size)
    setMeasurements({
      length: String(size.length[u]),
      sleeve: String(size.sleeve[u]),
      bust:   String(size.bust[u]),
      hips:   String(size.hips[u]),
    })
  }

  const handleUnitChange = (u: Unit) => {
    setUnit(u)
    if (selectedSize) applySize(selectedSize, u)
  }

  const handleClear = () => {
    setStyleType(null)
    setUnit('cm')
    setSelectedSize(null)
    setMeasurements({ length: '', sleeve: '', bust: '', hips: '' })
  }

  const handleSend = () => {
    const productUrl = `${window.location.origin}/product/${productSlug}`
    const sizeLabel = selectedSize
      ? `${selectedSize.number} (${selectedSize.letter})`
      : 'Not selected'

    const lines = [
      '🧵 *Custom Abaya Request*',
      '',
      `🛍 *Product:* ${productName}`,
      `🔗 *Link:* ${productUrl}`,
      '',
      `👗 *Style:* ${styleType === 'open' ? 'Open Type' : 'Closed Type'}`,
      `📏 *Size:* ${sizeLabel}`,
      `📐 *Unit:* ${unit === 'cm' ? 'Centimeter (cm)' : 'Inch (in)'}`,
      '',
      '📊 *Measurements:*',
      `• Abaya Length : ${measurements.length || '—'} ${unit}`,
      `• Sleeve       : ${measurements.sleeve || '—'} ${unit}`,
      `• Bust         : ${measurements.bust   || '—'} ${unit}`,
      `• Hips         : ${measurements.hips   || '—'} ${unit}`,
    ]

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank'
    )
  }

  const canSend = styleType !== null && selectedSize !== null

  const sizeBtn = (active: boolean) =>
    `border-2 text-sm font-semibold rounded-lg transition-all ${
      active
        ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
        : 'border-border text-foreground hover:border-violet-400 bg-background'
    }`

  return (
    <>
      <style>{`
        body.customize-open #ai-chat-widget {
          opacity: 0;
          pointer-events: none;
          transform: translateY(8px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
      `}</style>

      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className='w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-950/60 font-semibold text-sm py-2.5 transition-all'
      >
        <Scissors className='size-4' />
        Customize Your Dress
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side='right'
          showCloseButton={false}
          className='p-0 flex flex-col w-full sm:max-w-[440px] gap-0 overflow-hidden'
        >
          {/* ── Drawer header ── */}
          <SheetHeader className='shrink-0 px-5 py-4 bg-gradient-to-r from-violet-700 to-violet-900'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <SheetTitle className='text-white text-base font-bold flex items-center gap-2'>
                  <Scissors className='size-4' />
                  Customize Your Abaya
                </SheetTitle>
                <SheetDescription className='text-violet-200 text-xs mt-0.5 leading-tight line-clamp-2'>
                  {productName}
                </SheetDescription>
              </div>
              <button
                onClick={() => setOpen(false)}
                className='mt-0.5 text-violet-200 hover:text-white transition-colors shrink-0'
                aria-label='Close'
              >
                <X className='size-5' />
              </button>
            </div>
          </SheetHeader>

          {/* ── Scrollable body ── */}
          <div className='flex-1 overflow-y-auto px-5 py-5 space-y-5'>

            {/* Step 1 — Style type */}
            <section>
              <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
                Step 1 · Style Type
              </p>
              <div className='grid grid-cols-2 gap-3'>
                {(['open', 'closed'] as StyleType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setStyleType(t)}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      styleType === t
                        ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                        : 'border-border text-muted-foreground hover:border-violet-300 bg-background'
                    }`}
                  >
                    {t === 'open' ? '🔓  Open Type' : '🔒  Closed Type'}
                  </button>
                ))}
              </div>
            </section>

            <Separator />

            {/* Step 2 — Unit */}
            <section>
              <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
                Step 2 · Measurement Unit
              </p>
              <div className='inline-flex rounded-lg overflow-hidden border border-border'>
                {(['cm', 'inch'] as Unit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`px-6 py-2 text-sm font-medium transition-colors ${
                      unit === u
                        ? 'bg-violet-600 text-white'
                        : 'bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {u === 'cm' ? 'cm' : 'inch'}
                  </button>
                ))}
              </div>
            </section>

            <Separator />

            {/* Step 3 — Size */}
            <section>
              <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3'>
                Step 3 · Select Size
              </p>

              {/* By number */}
              <p className='text-xs text-muted-foreground mb-1.5'>By number</p>
              <div className='flex gap-2 flex-wrap mb-4'>
                {SIZE_DATA.map((s) => (
                  <button
                    key={s.number}
                    onClick={() => applySize(s)}
                    className={`w-11 h-11 rounded-lg ${sizeBtn(selectedSize?.number === s.number)}`}
                  >
                    {s.number}
                  </button>
                ))}
              </div>

              {/* By letter */}
              <p className='text-xs text-muted-foreground mb-1.5'>By letter</p>
              <div className='flex gap-2 flex-wrap'>
                {SIZE_DATA.map((s) => (
                  <button
                    key={s.letter}
                    onClick={() => applySize(s)}
                    className={`w-13 h-11 px-3 rounded-lg ${sizeBtn(selectedSize?.letter === s.letter)}`}
                  >
                    {s.letter}
                  </button>
                ))}
              </div>
            </section>

            <Separator />

            {/* Step 4 — Measurements */}
            <section>
              <div className='flex items-center justify-between mb-3'>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  Step 4 · Measurements ({unit})
                </p>
                {selectedSize && (
                  <span className='text-xs bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-medium'>
                    Size {selectedSize.number} · {selectedSize.letter}
                  </span>
                )}
              </div>

              <div className='grid grid-cols-2 gap-3'>
                {MEASUREMENT_FIELDS.map(({ key, label }) => (
                  <div key={key}>
                    <label className='text-xs text-muted-foreground font-medium block mb-1'>
                      {label}
                    </label>
                    <div className='relative'>
                      <input
                        type='number'
                        min={0}
                        value={measurements[key]}
                        onChange={(e) =>
                          setMeasurements((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        placeholder='—'
                        className='w-full h-10 pl-3 pr-10 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow'
                      />
                      <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none'>
                        {unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {!selectedSize && (
                <p className='text-xs text-center text-muted-foreground mt-2'>
                  ↑ Select a size above to auto-fill all measurements
                </p>
              )}
            </section>
          </div>

          {/* ── Fixed footer ── */}
          <div className='shrink-0 border-t bg-background px-5 py-4 space-y-2'>
            {/* Send to WhatsApp */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`w-full h-11 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-all ${
                canSend
                  ? 'bg-[#25d366] hover:bg-[#1ebe5d] text-white shadow-sm'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <svg viewBox='0 0 32 32' className='size-4 fill-current'>
                <path d='M16.003 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.363.638 4.659 1.847 6.668L2.667 29.333l6.845-1.797A13.284 13.284 0 0 0 16.003 29.333C23.37 29.333 29.333 23.364 29.333 16c0-7.364-5.963-13.333-13.33-13.333zm0 2.444c6.007 0 10.889 4.882 10.889 10.889 0 6.007-4.882 10.889-10.889 10.889a10.849 10.849 0 0 1-5.61-1.567l-.403-.245-4.063 1.067 1.085-3.959-.267-.416A10.849 10.849 0 0 1 5.114 16c0-6.007 4.882-10.889 10.889-10.889zm-3.19 5.245c-.218 0-.574.081-.875.406-.3.325-1.143 1.116-1.143 2.722s1.169 3.156 1.333 3.374c.163.217 2.277 3.674 5.647 5.004 2.8 1.104 3.37.883 3.977.828.606-.054 1.956-.8 2.233-1.573.277-.772.277-1.434.194-1.572-.082-.135-.3-.217-.626-.38-.325-.162-1.956-.965-2.258-1.075-.3-.109-.519-.163-.738.163-.218.325-.845 1.075-1.034 1.292-.19.218-.381.245-.706.082-.326-.163-1.374-.507-2.619-1.616-.967-.862-1.62-1.928-1.81-2.253-.19-.326-.02-.502.142-.664.146-.146.325-.38.487-.57.163-.19.217-.326.326-.543.108-.218.054-.407-.028-.57-.081-.162-.727-1.782-1.006-2.436-.261-.625-.532-.535-.737-.544-.19-.008-.406-.01-.624-.01z' />
              </svg>
              Send Customization on WhatsApp
            </button>

            {/* Clear */}
            <button
              onClick={handleClear}
              className='w-full h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            >
              Clear All
            </button>

            {/* Helper hint */}
            {!canSend && (
              <p className='text-xs text-center text-muted-foreground'>
                {!styleType && !selectedSize
                  ? 'Choose a style type and size to continue'
                  : !styleType
                  ? 'Choose Open or Closed style type'
                  : 'Select a size to continue'}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

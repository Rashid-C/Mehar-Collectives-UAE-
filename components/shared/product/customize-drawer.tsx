'use client'

import { useState, useEffect } from 'react'
import { Scissors, X, Lock, Unlock, Sparkles } from 'lucide-react'
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
  const [styleType, setStyleType] = useState<StyleType | null>(null)
  const [unit, setUnit] = useState<Unit>('cm')
  const [selectedSize, setSelectedSize] = useState<SizeRow | null>(null)
  const [measurements, setMeasurements] = useState<Record<MeasurementKey, string>>({
    length: '', sleeve: '', bust: '', hips: '',
  })

  useEffect(() => {
    document.body.classList.toggle('customize-open', open)
    return () => { document.body.classList.remove('customize-open') }
  }, [open])

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

  return (
    <>
      <style>{`
        body.customize-open #ai-chat-widget {
          opacity: 0;
          pointer-events: none;
          transform: translateY(8px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        @keyframes scissors-snip {
          0%   { transform: rotate(0deg)   scale(1);    }
          30%  { transform: rotate(-22deg) scale(1.15); }
          60%  { transform: rotate(14deg)  scale(1.1);  }
          100% { transform: rotate(0deg)   scale(1);    }
        }
        @keyframes border-dash-spin {
          to { stroke-dashoffset: -48; }
        }
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1);    }
          50%       { opacity: 1;   transform: scale(1.18); }
        }

        .customize-trigger .snip-icon {
          transition: transform 0.25s ease;
        }
        .customize-trigger:hover .snip-icon {
          animation: scissors-snip 0.45s ease-in-out forwards;
        }
        .customize-trigger .sparkle-icon {
          animation: sparkle-pulse 1.8s ease-in-out infinite;
        }
        .customize-trigger {
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }
        .customize-trigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.18);
        }
        .customize-trigger:active {
          transform: translateY(0px) scale(0.98);
        }
      `}</style>

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        className='customize-trigger w-full flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dotted border-foreground/50 bg-transparent text-foreground hover:bg-foreground hover:text-background hover:border-foreground font-semibold text-sm py-3 px-4'
      >
        <Scissors className='snip-icon size-4 shrink-0' />
        <span className='flex-1 text-center'>Customize Your Dress</span>
        <Sparkles className='sparkle-icon size-3.5 shrink-0 opacity-70' />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side='right'
          showCloseButton={false}
          className='p-0 flex flex-col w-full sm:max-w-110 gap-0 overflow-hidden'
        >
          {/* ── Header ── */}
          <SheetHeader className='shrink-0 px-5 py-4 border-b border-border bg-card'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15 shrink-0'>
                  <Scissors className='size-4 text-primary-foreground' />
                </div>
                <div>
                  <SheetTitle className='text-foreground text-base font-bold leading-tight'>
                    Customize Your Abaya
                  </SheetTitle>
                  <SheetDescription className='text-muted-foreground text-xs mt-0.5 leading-tight line-clamp-1'>
                    {productName}
                  </SheetDescription>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className='text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 rounded-full p-1.5'
                aria-label='Close'
              >
                <X className='size-4' />
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
                {/* Open Type */}
                <button
                  onClick={() => setStyleType('open')}
                  className={`group relative py-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 flex flex-col items-center gap-2 ${
                    styleType === 'open'
                      ? 'border-primary bg-primary/10 text-primary-foreground shadow-sm'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50 bg-background'
                  }`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                    styleType === 'open' ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
                  }`}>
                    <Unlock className={`size-4 transition-colors ${
                      styleType === 'open' ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary-foreground'
                    }`} />
                  </div>
                  <span>Open Type</span>
                </button>

                {/* Closed Type */}
                <button
                  onClick={() => setStyleType('closed')}
                  className={`group relative py-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 flex flex-col items-center gap-2 ${
                    styleType === 'closed'
                      ? 'border-primary bg-primary/10 text-primary-foreground shadow-sm'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50 bg-background'
                  }`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                    styleType === 'closed' ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
                  }`}>
                    <Lock className={`size-4 transition-colors ${
                      styleType === 'closed' ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary-foreground'
                    }`} />
                  </div>
                  <span>Closed Type</span>
                </button>
              </div>
            </section>

            <Separator />

            {/* Step 2 — Unit */}
            <section>
              <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
                Step 2 · Measurement Unit
              </p>
              <div className='inline-flex rounded-full overflow-hidden border border-border'>
                {(['cm', 'inch'] as Unit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`px-6 py-2 text-sm font-semibold transition-all duration-200 ${
                      unit === u
                        ? 'bg-primary text-primary-foreground'
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

              <p className='text-xs text-muted-foreground mb-1.5'>By number</p>
              <div className='flex gap-2 flex-wrap mb-4'>
                {SIZE_DATA.map((s) => (
                  <button
                    key={s.number}
                    onClick={() => applySize(s)}
                    className={`w-11 h-11 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                      selectedSize?.number === s.number
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm scale-105'
                        : 'border-border text-foreground hover:border-primary/50 hover:scale-105 bg-background'
                    }`}
                  >
                    {s.number}
                  </button>
                ))}
              </div>

              <p className='text-xs text-muted-foreground mb-1.5'>By letter</p>
              <div className='flex gap-2 flex-wrap'>
                {SIZE_DATA.map((s) => (
                  <button
                    key={s.letter}
                    onClick={() => applySize(s)}
                    className={`h-11 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                      selectedSize?.letter === s.letter
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm scale-105'
                        : 'border-border text-foreground hover:border-primary/50 hover:scale-105 bg-background'
                    }`}
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
                  <span className='text-xs bg-primary/15 text-primary-foreground px-2 py-0.5 rounded-full font-medium'>
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
                        className='w-full h-10 pl-3 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-150'
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
                  Select a size above to auto-fill measurements
                </p>
              )}
            </section>
          </div>

          {/* ── Fixed footer ── */}
          <div className='shrink-0 border-t border-border bg-background px-5 py-4 space-y-2'>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`w-full h-11 rounded-full flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 ${
                canSend
                  ? 'bg-[#25d366] hover:bg-[#1ebe5d] text-white shadow-sm hover:shadow-md hover:shadow-[#25d366]/30 hover:-translate-y-0.5'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <svg viewBox='0 0 32 32' className='size-4 fill-current shrink-0'>
                <path d='M16.003 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.363.638 4.659 1.847 6.668L2.667 29.333l6.845-1.797A13.284 13.284 0 0 0 16.003 29.333C23.37 29.333 29.333 23.364 29.333 16c0-7.364-5.963-13.333-13.33-13.333zm0 2.444c6.007 0 10.889 4.882 10.889 10.889 0 6.007-4.882 10.889-10.889 10.889a10.849 10.849 0 0 1-5.61-1.567l-.403-.245-4.063 1.067 1.085-3.959-.267-.416A10.849 10.849 0 0 1 5.114 16c0-6.007 4.882-10.889 10.889-10.889zm-3.19 5.245c-.218 0-.574.081-.875.406-.3.325-1.143 1.116-1.143 2.722s1.169 3.156 1.333 3.374c.163.217 2.277 3.674 5.647 5.004 2.8 1.104 3.37.883 3.977.828.606-.054 1.956-.8 2.233-1.573.277-.772.277-1.434.194-1.572-.082-.135-.3-.217-.626-.38-.325-.162-1.956-.965-2.258-1.075-.3-.109-.519-.163-.738.163-.218.325-.845 1.075-1.034 1.292-.19.218-.381.245-.706.082-.326-.163-1.374-.507-2.619-1.616-.967-.862-1.62-1.928-1.81-2.253-.19-.326-.02-.502.142-.664.146-.146.325-.38.487-.57.163-.19.217-.326.326-.543.108-.218.054-.407-.028-.57-.081-.162-.727-1.782-1.006-2.436-.261-.625-.532-.535-.737-.544-.19-.008-.406-.01-.624-.01z' />
              </svg>
              Send Customization on WhatsApp
            </button>

            <button
              onClick={handleClear}
              className='w-full h-9 rounded-full border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 font-medium'
            >
              Clear All
            </button>

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

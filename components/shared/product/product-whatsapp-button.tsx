'use client'

import { useEffect, useState } from 'react'

const ADMIN_NUMBER = '918078967913'

interface ProductWhatsAppButtonProps {
  productName: string
}

export default function ProductWhatsAppButton({ productName }: ProductWhatsAppButtonProps) {
  const [href, setHref] = useState('#')
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    // Use the exact current page URL — WhatsApp makes bare https:// links tappable
    const url = window.location.href
    const message =
      `Hi! I'm interested in this product:\n` +
      `${productName}\n\n` +
      `${url}`
    setHref(`https://wa.me/${ADMIN_NUMBER}?text=${encodeURIComponent(message)}`)
  }, [productName])

  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={`Ask about ${productName} on WhatsApp`}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
        padding: '13px 18px',
        borderRadius: 14,
        background: pressed
          ? 'linear-gradient(135deg,#189444 0%,#157a38 100%)'
          : 'linear-gradient(135deg,#25d366 0%,#1da851 100%)',
        color: '#fff',
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: '0.01em',
        cursor: 'pointer',
        textDecoration: 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: pressed
          ? '0 2px 8px rgba(37,211,102,0.2)'
          : '0 4px 18px rgba(37,211,102,0.38)',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.12s ease, box-shadow 0.15s ease, background 0.15s ease',
      }}
    >
      {/* WhatsApp icon */}
      <svg
        viewBox='0 0 32 32'
        xmlns='http://www.w3.org/2000/svg'
        style={{ width: 22, height: 22, fill: '#fff', flexShrink: 0 }}
      >
        <path d='M16.003 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.363.638 4.659 1.847 6.668L2.667 29.333l6.845-1.797A13.284 13.284 0 0 0 16.003 29.333C23.37 29.333 29.333 23.364 29.333 16c0-7.364-5.963-13.333-13.33-13.333zm0 2.444c6.007 0 10.889 4.882 10.889 10.889 0 6.007-4.882 10.889-10.889 10.889a10.849 10.849 0 0 1-5.61-1.567l-.403-.245-4.063 1.067 1.085-3.959-.267-.416A10.849 10.849 0 0 1 5.114 16c0-6.007 4.882-10.889 10.889-10.889zm-3.19 5.245c-.218 0-.574.081-.875.406-.3.325-1.143 1.116-1.143 2.722s1.169 3.156 1.333 3.374c.163.217 2.277 3.674 5.647 5.004 2.8 1.104 3.37.883 3.977.828.606-.054 1.956-.8 2.233-1.573.277-.772.277-1.434.194-1.572-.082-.135-.3-.217-.626-.38-.325-.162-1.956-.965-2.258-1.075-.3-.109-.519-.163-.738.163-.218.325-.845 1.075-1.034 1.292-.19.218-.381.245-.706.082-.326-.163-1.374-.507-2.619-1.616-.967-.862-1.62-1.928-1.81-2.253-.19-.326-.02-.502.142-.664.146-.146.325-.38.487-.57.163-.19.217-.326.326-.543.108-.218.054-.407-.028-.57-.081-.162-.727-1.782-1.006-2.436-.261-.625-.532-.535-.737-.544-.19-.008-.406-.01-.624-.01z' />
      </svg>

      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.25 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Ask on WhatsApp</span>
        <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.82 }}>Get instant reply</span>
      </span>

      {/* Arrow */}
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 20 20'
        fill='currentColor'
        style={{ width: 15, height: 15, marginLeft: 'auto', opacity: 0.8, flexShrink: 0 }}
      >
        <path
          fillRule='evenodd'
          d='M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z'
          clipRule='evenodd'
        />
      </svg>
    </a>
  )
}

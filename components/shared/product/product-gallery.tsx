'use client'

import { useState } from 'react'
import Image from 'next/image'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

const FALLBACK = '/images/p11-1.jpg'

export default function ProductGallery({ images }: { images: string[] }) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set())
    const galleryImages =
        images && images.filter(Boolean).length > 0
          ? images.filter((img) => img && !brokenImages.has(img))
          : [FALLBACK]
    const displayImages = galleryImages.length > 0 ? galleryImages : [FALLBACK]
    const safeSelected = Math.min(selectedImage, displayImages.length - 1)

    return (
        <div className='flex gap-2'>
            <div className='flex flex-col gap-2 mt-8'>
                {displayImages.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        onMouseOver={() => setSelectedImage(index)}
                        className={`bg-white rounded-lg overflow-hidden ${safeSelected === index
                            ? 'ring-2 ring-blue-500'
                            : 'ring-1 ring-gray-300'
                            }`}
                    >
                        <Image
                          src={image}
                          alt={'product image'}
                          width={48}
                          height={48}
                          loading='lazy'
                          onError={() => setBrokenImages((prev) => new Set(prev).add(image))}
                        />
                    </button>
                ))}
            </div>

            <div className='w-full'>
                <Zoom>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={displayImages[safeSelected] ?? FALLBACK}
                        alt='product image'
                        className='h-125 w-full object-contain'
                        onError={(e) => {
                          const img = displayImages[safeSelected]
                          if (img) setBrokenImages((prev) => new Set(prev).add(img))
                          ;(e.target as HTMLImageElement).src = FALLBACK
                        }}
                    />
                </Zoom>
            </div>
        </div>
    )
}

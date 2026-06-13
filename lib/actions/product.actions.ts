'use server'

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

import { unstable_cache, revalidatePath, revalidateTag } from 'next/cache'
import { connectToDatabase } from '@/lib/db'
import Product, { IProduct } from '@/lib/db/models/product.model'
import { formatError } from '../utils'
import { ProductInputSchema, ProductUpdateSchema } from '../validator'
import { IProductInput } from '@/types'
import { z } from 'zod'
import { getSetting } from './setting.actions'
import { requireAdmin } from '../auth-guard'
import {
  getPublishedFallbackProducts,
  logDevDbFallback,
  shouldUseDevDbFallback,
  withFallbackProductIds,
} from '@/lib/db/dev-fallback'

// CREATE
export async function createProduct(data: IProductInput) {
  try {
    await requireAdmin()
    const product = ProductInputSchema.parse(data)
    await connectToDatabase()
    await Product.create(product)
    revalidateTag('products')
    revalidatePath('/admin/products')
    revalidatePath('/')
    revalidatePath('/search')
    return {
      success: true,
      message: 'Product created successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    await requireAdmin()
    const product = ProductUpdateSchema.parse(data)
    await connectToDatabase()
    await Product.findByIdAndUpdate(product._id, { $set: product })
    revalidateTag('products')
    revalidatePath('/admin/products')
    revalidatePath(`/product/${product.slug}`)
    revalidatePath('/search')
    revalidatePath('/')
    return {
      success: true,
      message: 'Product updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// DELETE
export async function deleteProduct(id: string) {
  try {
    await requireAdmin()
    await connectToDatabase()
    const res = await Product.findByIdAndDelete(id)
    if (!res) throw new Error('Product not found')
    revalidateTag('products')
    revalidatePath('/admin/products')
    revalidatePath('/')
    revalidatePath('/search')
    return {
      success: true,
      message: 'Product deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// GET ONE PRODUCT BY ID
export async function getProductById(productId: string) {
  await connectToDatabase()
  const product = await Product.findById(productId).lean()
  return JSON.parse(JSON.stringify(product)) as IProduct
}

// GET ALL PRODUCTS FOR ADMIN
export async function getAllProductsForAdmin({
  query,
  page = 1,
  sort = 'latest',
  limit,
}: {
  query: string
  page?: number
  sort?: string
  limit?: number
}) {
  await requireAdmin()
  await connectToDatabase()

  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  const queryFilter =
    query && query !== 'all'
      ? {
          name: {
            $regex: escapeRegex(query),
            $options: 'i',
          },
        }
      : {}

  const order: Record<string, 1 | -1> =
    sort === 'best-selling'
      ? { numSales: -1 }
      : sort === 'price-low-to-high'
        ? { price: 1 }
        : sort === 'price-high-to-low'
          ? { price: -1 }
          : sort === 'avg-customer-review'
            ? { avgRating: -1 }
            : { _id: -1 }
  const skip = limit * (Number(page) - 1)
  const [products, countProducts] = await Promise.all([
    Product.find({ ...queryFilter })
      .sort(order)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments({ ...queryFilter }),
  ])
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: skip + 1,
    to: skip + products.length,
  }
}

// GET ALL PRODUCTS FOR EXPORT (no pagination limit)
export async function getAllProductsForExport() {
  await requireAdmin()
  await connectToDatabase()
  const products = await Product.find({})
    .sort({ _id: -1 })
    .select('_id name price listPrice description countInStock isPublished updatedAt')
    .lean()
  return JSON.parse(JSON.stringify(products)) as IProduct[]
}

export async function getProductsByCategoryForExport(category: string) {
  await requireAdmin()
  await connectToDatabase()
  const products = await Product.find({ category })
    .sort({ _id: -1 })
    .select('_id name price listPrice description countInStock isPublished updatedAt')
    .lean()
  return JSON.parse(JSON.stringify(products)) as IProduct[]
}

export async function renameCategory(oldName: string, newName: string) {
  await requireAdmin()
  await connectToDatabase()
  const result = await Product.updateMany(
    { category: oldName },
    { $set: { category: newName } }
  )
  revalidatePath('/search')
  revalidatePath('/admin/products')
  return { modifiedCount: result.modifiedCount }
}

export const getAllCategories = unstable_cache(
  async function () {
    try {
      await connectToDatabase()
      const categories = await Product.find({ isPublished: true }).distinct('category')
      return categories
    } catch (error) {
      if (!shouldUseDevDbFallback(error)) throw error
      logDevDbFallback('getAllCategories', error)
      return Array.from(
        new Set(getPublishedFallbackProducts().map((product) => product.category))
      ).sort()
    }
  },
  ['all-categories'],
  { revalidate: 3600, tags: ['categories'] }
)

export async function getAllCategoriesForAdmin() {
  await requireAdmin()
  await connectToDatabase()
  const categories = await Product.find().distinct('category')
  return categories as string[]
}

export async function getCategoriesWithCounts() {
  await requireAdmin()
  await connectToDatabase()
  const result = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, published: { $sum: { $cond: ['$isPublished', 1, 0] } } } },
    { $sort: { _id: 1 } },
  ])
  return result.map((r) => ({ name: r._id as string, count: r.count as number, published: r.published as number }))
}

export async function getAllBrandsForAdmin() {
  await requireAdmin()
  await connectToDatabase()
  const brands = await Product.find().distinct('brand')
  return brands as string[]
}

export const getCategoriesWithImages = unstable_cache(
  async function () {
    try {
      await connectToDatabase()
      const categories = await Product.aggregate([
        { $match: { isPublished: true } },
        {
          $group: {
            _id: '$category',
            image: { $first: { $arrayElemAt: ['$images', 0] } },
          },
        },
        { $project: { _id: 0, name: '$_id', image: 1 } },
      ])
      return categories as { name: string; image: string }[]
    } catch (error) {
      if (!shouldUseDevDbFallback(error)) throw error
      logDevDbFallback('getCategoriesWithImages', error)
      const categories = new Map<string, string>()
      getPublishedFallbackProducts().forEach((product) => {
        if (!categories.has(product.category)) {
          categories.set(product.category, product.images[0])
        }
      })
      return Array.from(categories, ([name, image]) => ({ name, image }))
    }
  },
  ['categories-with-images'],
  { revalidate: 3600, tags: ['categories'] }
)
export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  try {
    await connectToDatabase()
    const products = await Product.aggregate([
      { $match: { tags: { $in: [tag] }, isPublished: true } },
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          name: 1,
          href: { $concat: ['/product/', '$slug'] },
          image: { $arrayElemAt: ['$images', 0] },
        },
      },
    ])
    return products as { name: string; href: string; image: string }[]
  } catch (error) {
    if (!shouldUseDevDbFallback(error)) throw error
    logDevDbFallback(`getProductsForCard:${tag}`, error)
    return getPublishedFallbackProducts()
      .filter((product) => product.tags.includes(tag))
      .slice(0, limit)
      .map((product) => ({
        name: product.name,
        href: `/product/${product.slug}`,
        image: product.images[0],
      }))
  }
}
// GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  try {
    await connectToDatabase()
    const products = await Product.find({
      tags: { $in: [tag] },
      isPublished: true,
    })
      .sort({ createdAt: 'desc' })
      .limit(limit)
      .lean()
    return JSON.parse(JSON.stringify(products)) as IProduct[]
  } catch (error) {
    if (!shouldUseDevDbFallback(error)) throw error
    logDevDbFallback(`getProductsByTag:${tag}`, error)
    return withFallbackProductIds(
      getPublishedFallbackProducts()
        .filter((product) => product.tags.includes(tag))
        .slice(0, limit)
    ) as unknown as IProduct[]
  }
}

// GET ONE PRODUCT BY SLUG
const _getCachedProductBySlug = unstable_cache(
  async (slug: string) => {
    await connectToDatabase()
    const product = await Product.findOne({ slug, isPublished: true }).lean()
    return product ? (JSON.parse(JSON.stringify(product)) as IProduct) : null
  },
  ['product-by-slug'],
  { revalidate: 60, tags: ['products'] }
)

export async function getProductBySlug(slug: string) {
  const product = await _getCachedProductBySlug(slug)
  if (!product) throw new Error('Product not found')
  return product
}
// GET RELATED PRODUCTS: PRODUCTS WITH SAME CATEGORY
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = 4,
  page = 1,
}: {
  category: string
  productId: string
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()
  const skipAmount = (Number(page) - 1) * limit
  const conditions = {
    isPublished: true,
    category,
    _id: { $ne: productId },
  }
  const [products, productsCount] = await Promise.all([
    Product.find(conditions).sort({ numSales: 'desc' }).skip(skipAmount).limit(limit).lean(),
    Product.countDocuments(conditions),
  ])
  return {
    data: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(productsCount / limit),
  }
}

// GET ALL PRODUCTS
export async function getAllProducts({
  query,
  limit,
  page,
  category,
  tag,
  price,
  rating,
  sort,
}: {
  query: string
  category: string
  tag: string
  limit?: number
  page: number
  price?: string
  rating?: string
  sort?: string
}) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()

  const queryFilter =
    query && query !== 'all'
      ? {
          name: {
            $regex: escapeRegex(query),
            $options: 'i',
          },
        }
      : {}
  const categoryFilter = category && category !== 'all' ? { category } : {}
  const tagFilter = tag && tag !== 'all' ? { tags: tag } : {}

  const parsedRating = Number(rating)
  const ratingFilter =
    rating && rating !== 'all' && !isNaN(parsedRating)
      ? { avgRating: { $gte: Math.min(Math.max(parsedRating, 0), 5) } }
      : {}

  const [rawMin, rawMax] = (price || '').split('-').map(Number)
  const priceFilter =
    price && price !== 'all' && !isNaN(rawMin) && !isNaN(rawMax)
      ? { price: { $gte: rawMin, $lte: rawMax } }
      : {}
  const order: Record<string, 1 | -1> =
    sort === 'best-selling'
      ? { numSales: -1 }
      : sort === 'price-low-to-high'
        ? { price: 1 }
        : sort === 'price-high-to-low'
          ? { price: -1 }
          : sort === 'avg-customer-review'
            ? { avgRating: -1 }
            : { _id: -1 }
  const isPublished = { isPublished: true }
  const filter = {
    ...isPublished,
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  }
  const countFilter = {
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  }
  const skip = limit * (Number(page) - 1)
  const [products, countProducts] = await Promise.all([
    Product.find(filter).sort(order).skip(skip).limit(limit).lean(),
    Product.countDocuments(countFilter),
  ])
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: skip + 1,
    to: skip + products.length,
  }
}

export const getAllTags = unstable_cache(
  async function () {
    await connectToDatabase()
    const tags = await Product.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: null, uniqueTags: { $addToSet: '$tags' } } },
      { $project: { _id: 0, uniqueTags: 1 } },
    ])
    return (
      (tags[0]?.uniqueTags
        .sort((a: string, b: string) => a.localeCompare(b))
        .map((x: string) =>
          x
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        ) as string[]) || []
    )
  },
  ['all-tags'],
  { revalidate: 3600, tags: ['tags'] }
)

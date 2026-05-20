import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { sendPurchaseReceipt } from '@/emails'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import Product from '@/lib/db/models/product.model'
import mongoose from 'mongoose'

export async function POST(req: NextRequest) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const stripeSignature = req.headers.get('stripe-signature')

    if (!stripeSecretKey || !stripeWebhookSecret) {
        return new NextResponse('Stripe webhook is not configured', { status: 500 })
    }
    if (!stripeSignature) {
        return new NextResponse('Missing stripe-signature header', { status: 400 })
    }

    const stripe = new Stripe(stripeSecretKey)
    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(
            await req.text(),
            stripeSignature,
            stripeWebhookSecret
        )
    } catch {
        return new NextResponse('Invalid Stripe webhook signature', { status: 400 })
    }

    await connectToDatabase()

    if (event.type === 'charge.succeeded') {
        const charge = event.data.object
        const orderId = charge.metadata.orderId
        const email = charge.billing_details.email
        const pricePaidInCents = charge.amount
        const order = await Order.findById(orderId).populate('user', 'email')
        if (order == null) {
            return new NextResponse('Bad Request', { status: 400 })
        }
        if (order.isPaid) {
            return NextResponse.json({
                message: 'Order was already marked as paid',
            })
        }

        order.isPaid = true
        order.paidAt = new Date()
        order.paymentResult = {
            id: event.id,
            status: 'COMPLETED',
            email_address: email!,
            pricePaid: (pricePaidInCents / 100).toFixed(2),
        }
        await order.save()
        if (!process.env.MONGODB_URI?.startsWith('mongodb://localhost')) {
          await applyStockAdjustmentIfNeeded(order._id.toString())
        }
        try {
            await sendPurchaseReceipt({ order })
        } catch (err) {
            console.log('email error', err)
        }
        return NextResponse.json({
            message: 'updateOrderToPaid was successful',
        })
    }
    return new NextResponse()
}

const applyStockAdjustmentIfNeeded = async (orderId: string) => {
  const session = await mongoose.connection.startSession()

  try {
    session.startTransaction()
    const order = await Order.findOneAndUpdate(
      { _id: orderId, isStockAdjusted: { $ne: true } },
      { $set: { isStockAdjusted: true } },
      { new: true, session }
    )

    if (!order) {
      await session.commitTransaction()
      session.endSession()
      return false
    }

    for (const item of order.items) {
      const stockUpdate = await Product.updateOne(
        { _id: item.product, countInStock: { $gte: item.quantity } },
        { $inc: { countInStock: -item.quantity } },
        { session }
      )
      if (stockUpdate.modifiedCount !== 1) {
        throw new Error(`Not enough stock for product: ${item.name}`)
      }
    }

    await session.commitTransaction()
    session.endSession()
    return true
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

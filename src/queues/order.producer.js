import { orderQueue } from './order.queue.js'

export const addOrderConfirmationJob = async (order, userEmail) => {
  await orderQueue.add(
    'order-confirmation',  // job name
    { order, userEmail },  // job data
    { priority: 1 }        // high priority
  )
  console.log(` Order confirmation job added for ${userEmail}`)
}

export const addOrderStatusUpdateJob = async (order, userEmail) => {
  await orderQueue.add(
    'order-status-update',
    { order, userEmail },
    { priority: 2 }
  )
  console.log(`Order status update job added for ${userEmail}`)
}
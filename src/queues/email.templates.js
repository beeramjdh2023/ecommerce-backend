export const orderConfirmationTemplate = (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.price_at_purchase}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.total_price}</td>
    </tr>
  `).join('')

  return {
    subject: `Order Confirmed #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmed! 🎉</h2>
        <p>Hi ${order.user_name},</p>
        <p>Your order has been placed successfully.</p>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p>Order ID: <strong>#${order.id.slice(0, 8).toUpperCase()}</strong></p>
          <p>Date: <strong>${new Date(order.created_at).toLocaleDateString()}</strong></p>
          <p>Status: <strong>${order.status}</strong></p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #333; color: white;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Qty</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <h3>Total: ₹${order.final_amount}</h3>
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Delivery Address</h3>
          <p>${order.full_name}</p>
          <p>${order.street}, ${order.city}</p>
          <p>${order.state} - ${order.pincode}</p>
          <p>Phone: ${order.phone}</p>
        </div>

        <p style="color: #666; font-size: 12px;">
          Thank you for shopping with us!
        </p>
      </div>
    `
  }
}

export const orderStatusUpdateTemplate = (order) => {
  const statusMessages = {
    CONFIRMED: 'Your order has been confirmed and is being prepared.',
    PROCESSING: 'Your order is being packed.',
    SHIPPED: 'Your order has been shipped and is on its way!',
    DELIVERED: 'Your order has been delivered. Enjoy your purchase!',
    CANCELLED: 'Your order has been cancelled.',
    RETURNED: 'Your return has been processed.'
  }

  return {
    subject: `Order Update #${order.id.slice(0, 8).toUpperCase()} — ${order.status}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Status Update</h2>
        <p>Hi ${order.user_name},</p>
        <p>${statusMessages[order.status] || 'Your order status has been updated.'}</p>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>Order ID: <strong>#${order.id.slice(0, 8).toUpperCase()}</strong></p>
          <p>New Status: <strong style="color: #4CAF50;">${order.status}</strong></p>
        </div>

        <p style="color: #666; font-size: 12px;">Thank you for shopping with us!</p>
      </div>
    `
  }
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Test if tables exist
    const orders = await prisma.order.findMany({ take: 1 });
    console.log('Orders table exists, count:', orders.length);
    
    // Try creating an order
    const order = await prisma.order.create({
      data: {
        orderNumber: 'TEST-001',
        customerName: 'Test User',
        phone: '01012345678',
        email: 'test@example.com',
        address: '123 Test Street',
        city: 'Cairo',
        paymentMethod: 'CASH_ON_DELIVERY',
        status: 'NEW',
        subtotal: 100,
        discountAmount: 0,
        total: 100,
        items: {
          create: [{
            productId: 'test-id',
            productName: 'Test Product',
            size: 'L',
            color: 'Black',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          }]
        }
      },
      include: { items: true }
    });
    console.log('Order created:', order.id, order.orderNumber);
  } catch (e) {
    console.error('Error:', e.message);
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
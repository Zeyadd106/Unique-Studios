const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOrderCreation() {
  try {
    console.log('Testing order creation...');
    
    const items = [{
      productId: 'prod-round-neck',
      productName: 'Heavyweight Crewneck',
      size: 'L',
      color: 'Black',
      quantity: 1,
      unitPrice: 849,
      totalPrice: 849,
    }];
    
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal;
    const orderNumber = 'US-TEST-' + Date.now();
    
    console.log('Creating order with transaction...');
    
    const order = await prisma.$transaction(async (tx) => {
      console.log('Transaction started');
      
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: 'Test User',
          phone: '01012345678',
          email: 'test@example.com',
          address: '123 Test Street',
          city: 'Cairo',
          paymentMethod: 'CASH_ON_DELIVERY',
          status: 'NEW',
          subtotal,
          discountAmount: 0,
          total,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });
      
      console.log('Order created:', newOrder.id, newOrder.orderNumber);
      
      // Test voucher update
      console.log('Testing voucher update...');
      const voucher = await tx.voucher.findFirst({ where: { code: 'WELCOME10' } });
      if (voucher) {
        await tx.voucher.update({
          where: { code: voucher.code },
          data: { usedCount: { increment: 1 } },
        });
        console.log('Voucher updated:', voucher.code);
      } else {
        console.log('No WELCOME10 voucher found');
      }
      
      return newOrder;
    });
    
    console.log('Transaction completed successfully!');
    console.log('Order:', order.id, order.orderNumber);
    
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderCreation();
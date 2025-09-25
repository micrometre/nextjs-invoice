import { PrismaClient } from '../app/generated/prisma';

import { formatCurrency } from './utils';



const prisma = new PrismaClient();

export async function fetchRevenue() {
  try {
    //console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await prisma.revenue.findMany();

    //console.log('Data fetch completed after 3 seconds.' + ' Data:', data);

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}


export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      take: 6,
      orderBy: { date: 'desc' },
      include: { customer: true },
    });
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch latest invoices.');
  }
}



export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = prisma.invoice.aggregate({
      _count: { id: true },
    });
    const customerCountPromise = prisma.customer.aggregate({
      _count: { id: true },
    });
    const invoiceStatusPromise = prisma.invoice.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);
    console.log('Card Data:', data);

    const numberOfInvoices = Number(data[0]._count.id ?? '0');
    const numberOfCustomers = Number(data[1]._count.id ?? '0');
    const totalPaidInvoices = formatCurrency(
      Number(data[2].find((item) => item.status === 'paid')?._count.status ?? '0'),
    );
    const totalPendingInvoices = formatCurrency(
      Number(data[2].find((item) => item.status === 'pending')?._count.status ?? '0'),
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}
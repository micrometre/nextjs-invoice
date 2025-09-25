import { customers, invoices, revenue, users } from '../../lib/placeholder-data';
import prisma from '../../lib/prisma';

async function seedUsers() {
  const insertedUsers = await Promise.all(
    users.map(
      (user) => prisma.user.create({
        data: user,
      }),
    ),
  );
  return insertedUsers;
}

async function seedRevenues() {
  const insertedRevenues = await Promise.all(
    revenue.map(
      (rev) => prisma.revenue.create({
        data: rev,
      }),
    ),
  );
  return insertedRevenues;
}


async function seedCustomers() {
  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => prisma.customer.create({
        data: customer,
      }),
    ),
  );
  return insertedCustomers;
}

async function seedInvoices() {
  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => prisma.invoice.create({
        data: {
          customerId: invoice.customerId,
          amount: invoice.amount,
          status: invoice.status,
          date: invoice.date,
        },
      }),
    ),
  );
  return insertedInvoices;
}

export async function GET() {
  try {
    // First seed users
    await seedUsers();
    // First seed customers
    await seedCustomers();
    
    // Then seed invoices
    await seedInvoices();

    // Then seed revenues
    await seedRevenues();

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seeding error:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

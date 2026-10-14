
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import puppeteer from 'puppeteer';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders(userId: string, page = 1, limit = 6) {
    page = Math.max(1, Math.floor(Number(page) || 1));
    limit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 6)));

    const buyerId = BigInt(userId);

    const [total, orders] = await this.prisma.$transaction([
      this.prisma.orders.count({
        where: { buyer_id: buyerId },
      }),
      this.prisma.orders.findMany({
        where: { buyer_id: buyerId },
        select: {
          invoice_id: true,
          payment_method: true,
          payable_currency: true,
          paid_amount: true,
          payment_status: true,
          status: true,
        },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    if (orders.length === 0) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }

    const lastPage = Math.ceil(total / limit);

    return {
      status: 'success',
      data: orders,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        last_page: lastPage,
        links: {
          first: `?page=1&limit=${limit}`,
          prev: page > 1 ? `?page=${page - 1}&limit=${limit}` : null,
          next: page < lastPage ? `?page=${page + 1}&limit=${limit}` : null,
          last: `?page=${lastPage}&limit=${limit}`,
        },
      },
    };
  }

  async getOrderDetails(userId: string, invoiceId: string) {
    const order = await this.prisma.orders.findFirst({
      where: {
        invoice_id: invoiceId,
        buyer_id: BigInt(userId),
      },
        include: {
        order_items: {
            select: {
            id: true,
            order_id: true,
            course_id: true,
            price: true,
            course: {
                select: {
                id: true,
                instructor_id: true,
                title: true,
                instructor: {
                    select: {
                    id: true,
                    name: true,
                    },
                },
                },
            },
            },
        },
        buyer: {
            select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            },
        },
        },
    });

    if (!order) {
      throw new NotFoundException({
        status: 'error',
        message: 'Not Found!',
      });
    }

    return {
      status: 'success',
      data: order,
    };
  }

  async downloadInvoice(userId: string, invoiceId: string): Promise<Buffer> {
  const order = await this.prisma.orders.findFirst({
    where: {
      invoice_id: invoiceId,
      buyer_id: BigInt(userId),
    },
    include: {
      buyer: {
        select: {
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      order_items: {
        select: {
          id: true,
          course_id: true,
          price: true,
          course: {
            select: {
              title: true,
              instructor: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundException({
      status: 'error',
      message: 'Not Found!',
    });
  }

  const escapeHtml = (value: unknown): string =>
    String(value ?? '-').replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entities[char];
    });

  const currency = escapeHtml(order.payable_currency || '');
  const conversionRate = Number(order.conversion_rate) || 1;
  const gatewayCharge = Number(order.gateway_charge) || 0;
  const discount = Number(order.coupon_discount_amount) || 0;

  const subtotal = order.order_items.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0,
  );

  const convertedSubtotal = subtotal * conversionRate;
  const total = convertedSubtotal - discount + gatewayCharge;

  const formatAmount = (amount: number) =>
    amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const itemsHtml = order.order_items
    .map((item, index) => {
      const instructor = item.course?.instructor;

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.course?.title || 'Study Material')}</td>
          <td>
            ${escapeHtml(instructor?.name || 'Study Material')}
            ${
              instructor?.email
                ? `<br><small>${escapeHtml(instructor.email)}</small>`
                : ''
            }
          </td>
          <td>
            ${formatAmount(Number(item.price || 0) * conversionRate)}
            ${currency}
          </td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: Arial, sans-serif;
          color: #05092b;
          margin: 0;
          font-size: 12px;
        }
        .header {
          background: #f3f2f2;
          padding: 24px;
          display: flex;
          justify-content: space-between;
        }
        h1 { font-size: 26px; text-transform: uppercase; }
        h3 { margin-bottom: 8px; }
        .details {
          display: flex;
          justify-content: space-between;
          padding: 24px;
          gap: 30px;
        }
        .details > div { width: 50%; }
        p { margin: 6px 0; color: #545353; }
        table {
          width: calc(100% - 48px);
          margin: 0 24px;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #eee;
          padding: 10px;
          text-align: left;
          overflow-wrap: anywhere;
        }
        th { background: #f3f2f2; }
        .totals {
          width: 48%;
          margin: 24px 24px 0 auto;
        }
        .totals p {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .total {
          border-top: 1px solid #ccc;
          padding-top: 10px;
          font-weight: bold;
          color: #05092b;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h3>Fukey Education</h3>
          <p>Invoice</p>
        </div>
        <div style="text-align:right">
          <h1>Invoice</h1>
          <p>Order ID: ${escapeHtml(order.invoice_id)}</p>
          <p>Date: ${escapeHtml(
            order.created_at?.toISOString().slice(0, 10) || '-',
          )}</p>
        </div>
      </div>

      <div class="details">
        <div>
          <h3>Billed To</h3>
          <p>${escapeHtml(order.buyer?.name)}</p>
          <p>${escapeHtml(order.buyer?.phone)}</p>
          <p>${escapeHtml(order.buyer?.email)}</p>
          <p>${escapeHtml(order.buyer?.address)}</p>
        </div>
        <div>
          <h3>Payment Details</h3>
          <p>Method: ${escapeHtml(order.payment_method)}</p>
          <p>Status: ${escapeHtml(order.payment_status)}</p>
          <p>Order Status: ${escapeHtml(order.status)}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Item</th>
            <th>Instructor / By</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || '<tr><td colspan="4">No order items</td></tr>'}
        </tbody>
      </table>

      <div class="totals">
        <p><span>Subtotal</span>
          <span>${formatAmount(convertedSubtotal)} ${currency}</span>
        </p>
        <p><span>Discount</span>
          <span>${formatAmount(discount)} ${currency}</span>
        </p>
        <p><span>Gateway Charge</span>
          <span>${formatAmount(gatewayCharge)} ${currency}</span>
        </p>
        <p class="total"><span>Total</span>
          <span>${formatAmount(total)} ${currency}</span>
        </p>
      </div>
    </body>
    </html>
  `;

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } catch (error) {
    throw new InternalServerErrorException(
      'Unable to generate invoice PDF',
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
}

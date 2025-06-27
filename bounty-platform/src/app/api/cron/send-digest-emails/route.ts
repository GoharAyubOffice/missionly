import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { Resend } from 'resend';
import { serverConfig } from '@/config/server';

const prisma = new PrismaClient();
const resend = serverConfig.RESEND_API_KEY ? new Resend(serverConfig.RESEND_API_KEY) : null;

export async function GET(request: NextRequest) {
  try {
    // Check if email service is configured
    if (!resend || !serverConfig.RESEND_FROM_EMAIL) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email service not configured' 
      }, { status: 503 });
    }

    // Verify this is a cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get users who should receive weekly digest
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        // Add condition for users who opted in to weekly emails
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const emailsSent = [];

    for (const user of users) {
      try {
        let digestContent;

        if (user.role === 'CLIENT') {
          // Get business metrics for the week
          const bountyStats = await prisma.bounty.groupBy({
            by: ['status'],
            where: {
              clientId: user.id,
              createdAt: {
                gte: oneWeekAgo,
              },
            },
            _count: {
              id: true,
            },
          });

          const applicationCount = await prisma.application.count({
            where: {
              bounty: {
                clientId: user.id,
              },
              createdAt: {
                gte: oneWeekAgo,
              },
            },
          });

          digestContent = {
            type: 'business_digest',
            bountyStats,
            applicationCount,
            weekRange: {
              start: oneWeekAgo.toISOString(),
              end: new Date().toISOString(),
            },
          };
        } else if (user.role === 'FREELANCER') {
          // Get freelancer metrics for the week
          const applicationStats = await prisma.application.groupBy({
            by: ['status'],
            where: {
              applicantId: user.id,
              createdAt: {
                gte: oneWeekAgo,
              },
            },
            _count: {
              id: true,
            },
          });

          const newBounties = await prisma.bounty.count({
            where: {
              status: 'OPEN',
              createdAt: {
                gte: oneWeekAgo,
              },
              // Add skill matching logic here
            },
          });

          digestContent = {
            type: 'freelancer_digest',
            applicationStats,
            newBounties,
            weekRange: {
              start: oneWeekAgo.toISOString(),
              end: new Date().toISOString(),
            },
          };
        }

        if (digestContent) {
          await resend.emails.send({
            from: serverConfig.RESEND_FROM_EMAIL,
            to: user.email,
            subject: `Your Weekly Bounty Platform Digest`,
            html: generateDigestEmail(user, digestContent),
          });

          emailsSent.push(user.email);
        }
      } catch (emailError) {
        console.error(`Failed to send digest to ${user.email}:`, emailError);
      }
    }

    const result = {
      success: true,
      emails_sent: emailsSent.length,
      recipients: emailsSent,
      timestamp: new Date().toISOString(),
    };

    console.log('Weekly digest sent:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Weekly digest cron job failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Digest sending failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function generateDigestEmail(user: any, content: any): string {
  const { name, role } = user;
  const greeting = name ? `Hi ${name}` : `Hi there`;

  if (content.type === 'business_digest') {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1B4F72;">${greeting}!</h1>
          
          <p>Here's your weekly business summary from Bounty Platform:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1B4F72; margin-top: 0;">This Week's Activity</h2>
            
            <p><strong>New Applications:</strong> ${content.applicationCount}</p>
            
            <h3>Your Bounties:</h3>
            <ul>
              ${content.bountyStats.map((stat: any) => `
                <li>${stat.status}: ${stat._count.id} bounties</li>
              `).join('')}
            </ul>
          </div>
          
          <p>
            <a href="${serverConfig.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background: #1B4F72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Dashboard
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Don't want these emails? 
            <a href="${serverConfig.NEXT_PUBLIC_APP_URL}/settings">Update your preferences</a>
          </p>
        </body>
      </html>
    `;
  } else if (content.type === 'freelancer_digest') {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1B4F72;">${greeting}!</h1>
          
          <p>Here's your weekly freelancer summary from Bounty Platform:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1B4F72; margin-top: 0;">This Week's Activity</h2>
            
            <p><strong>New Bounties Available:</strong> ${content.newBounties}</p>
            
            <h3>Your Applications:</h3>
            <ul>
              ${content.applicationStats.map((stat: any) => `
                <li>${stat.status}: ${stat._count.id} applications</li>
              `).join('')}
            </ul>
          </div>
          
          <p>
            <a href="${serverConfig.NEXT_PUBLIC_APP_URL}/bounties" 
               style="background: #1B4F72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Browse Bounties
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Don't want these emails? 
            <a href="${serverConfig.NEXT_PUBLIC_APP_URL}/settings">Update your preferences</a>
          </p>
        </body>
      </html>
    `;
  }

  return '';
}
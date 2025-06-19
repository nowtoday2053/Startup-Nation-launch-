import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        email: 'john@example.com',
        name: 'John Doe',
        username: 'johndoe',
        bio: 'Passionate entrepreneur building the next big thing. Love sharing resources and learning from the community.',
        password: await bcrypt.hash('password123', 12),
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah@example.com' },
      update: {},
      create: {
        email: 'sarah@example.com',
        name: 'Sarah Wilson',
        username: 'sarahw',
        bio: 'Growth marketer with 5+ years experience. Sharing strategies that actually work.',
        password: await bcrypt.hash('password123', 12),
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike@example.com' },
      update: {},
      create: {
        email: 'mike@example.com',
        name: 'Mike Chen',
        username: 'mikechen',
        bio: 'Failed founder turned advisor. Here to share the hard lessons I learned.',
        password: await bcrypt.hash('password123', 12),
      },
    })
  ])

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Amazing Tool for Customer Support',
        content: 'Just discovered this incredible customer support tool that has transformed how we handle tickets. The AI-powered responses are surprisingly good and it integrates seamlessly with Slack.',
        url: 'https://intercom.com',
        type: 'RESOURCE',
        tags: ['customer-support', 'ai', 'productivity'],
        slug: 'amazing-customer-support-tool-' + Date.now(),
        authorId: users[0].id,
        voteCount: 23,
        commentCount: 5,
      },
    }),
    prisma.post.create({
      data: {
        title: 'How I Grew from 0 to 10K Users in 3 Months',
        content: 'Here\'s the exact strategy I used to grow my SaaS from zero to 10,000 users in just 3 months. The key was focusing on product-led growth and community building.',
        type: 'STRATEGY',
        tags: ['growth', 'saas', 'product-led-growth'],
        slug: 'grew-0-to-10k-users-strategy-' + Date.now(),
        authorId: users[1].id,
        voteCount: 47,
        commentCount: 12,
      },
    }),
    prisma.post.create({
      data: {
        title: 'My Biggest Startup Failure and What I Learned',
        content: 'Two years ago, I shut down my startup after burning through $500K in funding. Here are the 5 critical mistakes I made and how you can avoid them.',
        type: 'STORY',
        tags: ['failure', 'lessons-learned', 'startup'],
        slug: 'biggest-startup-failure-lessons-' + Date.now(),
        authorId: users[2].id,
        voteCount: 89,
        commentCount: 23,
      },
    }),
    prisma.post.create({
      data: {
        title: 'Free Template: SaaS Pricing Page That Converts',
        content: 'I analyzed 100+ SaaS pricing pages and created this template based on the highest converting designs. Includes Figma file and conversion tips.',
        url: 'https://figma.com/template/pricing',
        type: 'RESOURCE',
        tags: ['template', 'pricing', 'conversion'],
        slug: 'saas-pricing-page-template-' + Date.now(),
        authorId: users[1].id,
        voteCount: 34,
        commentCount: 8,
      },
    }),
    prisma.post.create({
      data: {
        title: 'The Cold Email Strategy That Got Me 50 Customers',
        content: 'Cold email isn\'t dead. Here\'s the exact framework I used to land 50 paying customers through cold outreach, including templates and follow-up sequences.',
        type: 'STRATEGY',
        tags: ['cold-email', 'sales', 'customer-acquisition'],
        slug: 'cold-email-strategy-50-customers-' + Date.now(),
        authorId: users[0].id,
        voteCount: 67,
        commentCount: 15,
      },
    })
  ])

  // Create sample comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'This is exactly what I was looking for! Thanks for sharing.',
        postId: posts[0].id,
        authorId: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Great insights! I tried a similar approach and got similar results.',
        postId: posts[1].id,
        authorId: users[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Thank you for being so transparent about your failure. This will help so many founders.',
        postId: posts[2].id,
        authorId: users[0].id,
      },
    })
  ])

  // Create sample votes
  await Promise.all([
    prisma.vote.create({
      data: {
        type: 'UP',
        postId: posts[0].id,
        userId: users[1].id,
      },
    }),
    prisma.vote.create({
      data: {
        type: 'UP',
        postId: posts[1].id,
        userId: users[0].id,
      },
    }),
    prisma.vote.create({
      data: {
        type: 'UP',
        postId: posts[2].id,
        userId: users[1].id,
      },
    })
  ])

  // Create sample follows
  await Promise.all([
    prisma.follow.create({
      data: {
        followerId: users[0].id,
        followingId: users[1].id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: users[1].id,
        followingId: users[2].id,
      },
    })
  ])

  // Create sample chat room
  const chatRoom = await prisma.chatRoom.create({
    data: {
      type: 'DIRECT',
      users: {
        connect: [{ id: users[0].id }, { id: users[1].id }],
      },
    },
  })

  // Create sample messages
  await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hey! Loved your post about growth strategies.',
        chatRoomId: chatRoom.id,
        senderId: users[0].id,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Thanks! I\'m glad you found it helpful. How\'s your startup going?',
        chatRoomId: chatRoom.id,
        senderId: users[1].id,
      },
    })
  ])

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
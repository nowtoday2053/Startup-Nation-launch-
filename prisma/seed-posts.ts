import { PrismaClient, PostType } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding sample posts...")

  // First, check if we have any users
  const users = await prisma.user.findMany()
  if (users.length === 0) {
    console.log("No users found. Please create a user account first.")
    return
  }

  const sampleUser = users[0] // Use the first user as the author

  const samplePosts = [
    {
      title: "The Ultimate SaaS Growth Playbook",
      content: `Complete guide to scaling your SaaS from 0 to $1M ARR with proven strategies and tactics.

## Introduction

Building a successful SaaS company requires more than just a great product. You need a systematic approach to growth that combines product development, marketing, sales, and customer success.

## Key Growth Strategies

**1. Product-Led Growth**
Focus on creating an exceptional product experience that drives organic growth through word-of-mouth and viral mechanics.

**2. Content Marketing**
Create valuable content that educates your target audience and establishes your company as a thought leader in your space.

**3. Customer Success**
Invest heavily in ensuring your customers achieve their desired outcomes with your product.`,
      type: PostType.RESOURCE,
      tags: ["growth", "saas", "strategy", "marketing"],
      slug: "ultimate-saas-growth-playbook-" + Date.now(),
      authorId: sampleUser.id,
      published: true,
      voteCount: 89,
      commentCount: 23
    },
    {
      title: "How I Failed 3 Startups Before My Big Success",
      content: `The brutal truth about my entrepreneurial journey and the lessons that finally led to a $50M exit.

## The Context

I started my first company at 22, fresh out of college and full of naive optimism. I thought having a great idea was enough. I was wrong.

## Failure #1: The Social Network for Pets

Yes, you read that right. I spent 18 months building a social network for pet owners. The idea seemed brilliant at the time, but I never talked to actual pet owners about what they wanted.

**Lesson:** Ideas are worthless without validation.

## Failure #2: The Uber for Laundry

This was 2014, and everything was "Uber for X". I raised $200K and burned through it in 8 months without finding product-market fit.

**Lesson:** Trends don't guarantee success.

## Failure #3: The AI-Powered Email Assistant

Ahead of my time but way behind on execution. I spent too much time perfecting the technology and not enough time understanding the market.

**Lesson:** Perfect is the enemy of done.

## The Success

Company #4 was different. I spent 3 months just talking to potential customers before writing a single line of code. I built the minimum viable product and got paying customers within 6 weeks.`,
      type: PostType.STORY,
      tags: ["failure", "lessons", "startup", "entrepreneurship"],
      slug: "failed-startups-before-success-" + Date.now(),
      authorId: sampleUser.id,
      published: true,
      voteCount: 156,
      commentCount: 42
    },
    {
      title: "10 Growth Hacks That Actually Work in 2024",
      content: `Forget the outdated growth tactics. Here are the strategies that are actually driving results today.

## 1. Community-Led Growth

Building a community around your product is one of the most sustainable growth strategies. Focus on creating value for your community members first.

## 2. Product Hunt Launch Strategy

A well-executed Product Hunt launch can drive thousands of users to your product. Here's how to do it right...

## 3. Partnership Marketing

Strategic partnerships can unlock new distribution channels and customer segments that would be expensive to reach through paid advertising.`,
      type: PostType.STRATEGY, 
      tags: ["growth", "marketing", "strategy", "2024"],
      slug: "growth-hacks-that-work-2024-" + Date.now(),
      authorId: sampleUser.id,
      published: true,
      voteCount: 234,
      commentCount: 67
    }
  ]

  for (const postData of samplePosts) {
    const existingPost = await prisma.post.findFirst({
      where: { title: postData.title }
    })

    if (!existingPost) {
      await prisma.post.create({
        data: postData
      })
      console.log(`Created post: ${postData.title}`)
    } else {
      console.log(`Post already exists: ${postData.title}`)
    }
  }

  console.log("Sample posts seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
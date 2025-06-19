import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Sparkles, Users, TrendingUp, MessageSquare, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="transition-opacity hover:opacity-70">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Startup Nation</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-left max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              The future of startup knowledge sharing
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight text-gray-900">
              Where Founders{" "}
              <span className="text-blue-500">Learn, Build & Grow Together.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
              Discover the resources, playbooks, and behind-the-scenes advice successful Startup founders actually use.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-20">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" asChild>
                <Link href="/register">
                  Sign Up  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" className="text-gray-700 border-gray-200 hover:bg-gray-50 text-lg px-8 py-4 rounded-xl transition-all duration-200" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative mt-16">
            <Card className="bg-white/60 backdrop-blur-sm border border-gray-100 shadow-xl rounded-3xl max-w-5xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors duration-200">
                      <TrendingUp className="h-8 w-8 text-blue-500 stroke-1" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Trending Resources</h3>
                    <p className="text-gray-600 leading-relaxed">Discover what's hot in startups</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors duration-200">
                      <Users className="h-8 w-8 text-blue-500 stroke-1" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Expert Community</h3>
                    <p className="text-gray-600 leading-relaxed">Learn from successful founders</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors duration-200">
                      <MessageSquare className="h-8 w-8 text-blue-500 stroke-1" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Rich Discussions</h3>
                    <p className="text-gray-600 leading-relaxed">Engage in meaningful conversations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
              Everything You Need To{" "}
              <span className="text-blue-500">Accelerate Growth</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A premium community built for founders who want to share progress, learn from others, and grow—without the noise or distractions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white border border-gray-100 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <CardHeader className="p-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors duration-200">
                    <feature.icon className="h-8 w-8 text-blue-500 stroke-1" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Card className="bg-white border border-gray-100 rounded-3xl shadow-xl">
            <CardContent className="p-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
                Ready To Join Other Builders?
              </h2>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Get exclusive access to the strategies and resources that are shaping 
                the future of startups. Join thousands of successful founders.
              </p>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" asChild>
                <Link href="/register">
                  Join Other Builders <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">Startup Nation</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                The premier knowledge market for startup founders and entrepreneurs.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-6">Platform</h3>
              <ul className="space-y-4">
                <li><Link href="/explore" className="text-gray-600 hover:text-blue-500 transition-colors">Explore</Link></li>
                <li><Link href="/submit" className="text-gray-600 hover:text-blue-500 transition-colors">Submit</Link></li>
                <li><Link href="/chat" className="text-gray-600 hover:text-blue-500 transition-colors">Chat</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-6">Company</h3>
              <ul className="space-y-4">
                <li><Link href="/about" className="text-gray-600 hover:text-blue-500 transition-colors">About</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-blue-500 transition-colors">Pricing</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-blue-500 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-6">Legal</h3>
              <ul className="space-y-4">
                <li><Link href="/privacy" className="text-gray-600 hover:text-blue-500 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-blue-500 transition-colors">Terms</Link></li>
                <li><Link href="/guidelines" className="text-gray-600 hover:text-blue-500 transition-colors">Guidelines</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-500">&copy; 2024 Startup Nation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: TrendingUp,
    title: "Top Startup Resources",
    description: "Find the best tools, guides, and tips—picked and upvoted by the community."
  },
  {
    icon: Users,
    title: "Talk to Founders",
    description: "Network with experienced founders, builders, and industry pros."
  },
  {
    icon: MessageSquare,
    title: "Instant Chat",
    description: "Message other builders right away with built-in chat."
  },
  {
    icon: Shield,
    title: "Insightful Threads",
    description: "Moderated content ensures only high-quality, actionable insights make it through."
  },
  {
    icon: Zap,
    title: "Exposure To New Startups Daily",
    description: "Get a daily dose of new startups and their stories."
  },
  {
    icon: Sparkles,
    title: "Personalized Feed",
    description: "AI-powered recommendations based on your interests and engagement patterns."
  }
] 
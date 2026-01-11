import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-indigo-100 text-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-indigo-700">
            Endpoint Monitor
          </h1>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition rounded-md"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Monitor Your APIs with{" "}
            <span className="bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Confidence
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Track uptime, analyze performance, and receive instant alerts.
            Simple, reliable, and built for developers who care about stability.
          </p>

          <div className="flex gap-5 justify-center">
            <Link
              href="/register"
              className="relative overflow-hidden px-8 py-4 bg-indigo-600 text-white rounded-xl shadow-lg transition text-lg font-semibold
             before:absolute before:inset-0 before:bg-indigo-700 before:scale-x-0 before:origin-center
             before:transition-transform before:duration-300 hover:before:scale-x-100"
            >
              <span className="relative z-10">Start Monitoring Free</span>
            </Link>

            <Link
              href="/login?demo=true"
              className="relative overflow-hidden px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-xl text-lg font-semibold
             transition-all duration-300 ease-out
             before:absolute before:inset-0 before:bg-indigo-600
             before:scale-x-0 before:origin-center
             before:transition-transform before:duration-300
             hover:before:scale-x-100 hover:text-white"
            >
              <span className="relative z-10">Try Demo Account</span>
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:shadow-md transition text-lg font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-10 mt-20">
          {[
            {
              icon: "📊",
              title: "Real-Time Monitoring",
              desc: "Track endpoint response times and uptime with live analytics.",
            },
            {
              icon: "🚨",
              title: "Instant Alerts",
              desc: "Get notified immediately when your API behaves unexpectedly.",
            },
            {
              icon: "📈",
              title: "Performance Insights",
              desc: "Analyze trends and optimize your API with rich visual reports.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition border border-gray-100"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-28 text-center">
          <h2 className="text-4xl font-extrabold mb-14">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: 1,
                title: "Add Your Endpoints",
                desc: "Enter your API URLs and set monitoring intervals.",
              },
              {
                step: 2,
                title: "We Monitor 24/7",
                desc: "Automated checks run continuously in the background.",
              },
              {
                step: 3,
                title: "Get Insights",
                desc: "View charts, receive alerts, and track performance.",
              },
            ].map((item) => (
              <div key={item.step}>
                <div className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md">
                  {item.step}
                </div>
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600">
          <p className="text-sm">
            Built with <span className="font-medium">Next.js</span>,{" "}
            <span className="font-medium">Express.js</span>, and{" "}
            <span className="font-medium">PostgreSQL</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

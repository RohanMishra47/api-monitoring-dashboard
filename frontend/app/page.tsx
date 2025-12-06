import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Endpoint Monitor</h1>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Monitor Your APIs with Confidence
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track endpoint uptime, response times, and get instant alerts when
            something goes wrong. Simple, powerful, and built for developers.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
            >
              Start Monitoring Free
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-lg font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Real-Time Monitoring</h3>
            <p className="text-gray-600">
              Continuously check your endpoints and track response times with
              detailed charts and analytics.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-4">🚨</div>
            <h3 className="text-xl font-bold mb-2">Instant Alerts</h3>
            <p className="text-gray-600">
              Get notified immediately when your endpoints go down or response
              times exceed thresholds.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2">Performance Insights</h3>
            <p className="text-gray-600">
              Visualize trends, identify patterns, and optimize your API
              performance over time.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold mb-2">Add Your Endpoints</h3>
              <p className="text-gray-600">
                Enter your API URLs and set monitoring intervals
              </p>
            </div>

            <div>
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold mb-2">We Monitor 24/7</h3>
              <p className="text-gray-600">
                Automated checks run continuously in the background
              </p>
            </div>

            <div>
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold mb-2">Get Insights</h3>
              <p className="text-gray-600">
                View charts, receive alerts, and track performance
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>Built with Next.js, Express.js, and PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}

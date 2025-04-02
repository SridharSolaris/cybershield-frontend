import React from "react";

const HomePage = () => {
  return (
    <div className="container mx-auto my-8 px-6 py-12 max-w-5xl space-y-16 bg-gray-900">
      {/* Hero Section */}
      <header className="text-center mb-12 animate-fadeInDown">
        <h1 className="text-5xl font-extrabold text-green-400 mb-4 leading-tight">
          Real-Time XAI-Powered IP Threat Detection &amp; Prevention
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
          Experience unparalleled security for your web applications with our
          advanced firewall that leverages Explainable AI (XAI) to deliver real-time threat detection and automated
          responses. Safeguard your digital assets with a solution that not only protects but also explains every decision.
        </p>
      </header>

      {/* How It Works Section */}
      <section className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-xl shadow-lg animate-fadeInUp">
        <h2 className="text-4xl font-semibold text-gray-100 mb-6 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong className="text-green-400">Continuous Monitoring:</strong> Our system constantly scans your network traffic, instantly detecting anomalies and suspicious behavior.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong className="text-green-400">AI-Powered Analysis:</strong> Advanced XAI algorithms analyze threats and provide transparent, actionable insights.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong className="text-green-400">Automated Response:</strong> Automatically block malicious IPs in real-time to prevent potential attacks.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              <strong className="text-green-400">Actionable Reports:</strong> Receive detailed reports and visual insights to continuously improve your security posture.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="mt-12 animate-fadeInUp">
        <h2 className="text-4xl font-semibold text-gray-100 mb-8 text-center">
          Key Features
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-lg text-gray-300">
          <li className="flex items-start space-x-4 transition transform hover:scale-105 duration-300">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 11-10 10A10 10 0 0112 2z" />
              </svg>
            </div>
            <div>
              <strong className="text-green-400">Real-Time Detection:</strong>
              <p className="mt-1">
                Instantly identifies malicious IPs to secure your network.
              </p>
            </div>
          </li>
          <li className="flex items-start space-x-4 transition transform hover:scale-105 duration-300">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 11-10 10A10 10 0 0112 2z" />
              </svg>
            </div>
            <div>
              <strong className="text-green-400">Explainable AI:</strong>
              <p className="mt-1">
                Gain clear insights into threat decisions with cutting-edge XAI.
              </p>
            </div>
          </li>
          <li className="flex items-start space-x-4 transition transform hover:scale-105 duration-300">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 11-10 10A10 10 0 0112 2z" />
              </svg>
            </div>
            <div>
              <strong className="text-green-400">Application level Firewall:</strong>
              <p className="mt-1">
                Automatically blocks harmful IP addresses, keeping your apps safe.
              </p>
            </div>
          </li>
          <li className="flex items-start space-x-4 transition transform hover:scale-105 duration-300">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 11-10 10A10 10 0 0112 2z" />
              </svg>
            </div>
            <div>
              <strong className="text-green-400">Easy Integration:</strong>
              <p className="mt-1">
                Seamlessly add our SDK to your app for immediate protection.
              </p>
            </div>
          </li>
        </ul>
      </section>

      {/* Call-to-Action Section */}
      <section className="mt-12 text-center animate-bounce">
        <a
          href="/sdk-setup"
          className="inline-block bg-green-600 text-white text-xl font-semibold py-3 px-8 rounded-full hover:bg-green-700 transition-all duration-300 shadow-lg"
        >
          Integrate Now &amp; Secure Your App
        </a>
      </section>
    </div>
  );
};

export default HomePage;

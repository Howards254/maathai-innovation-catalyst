import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using the Maathai Innovation Catalyst platform, you accept and agree 
                to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Purpose</h2>
              <p className="text-gray-700 mb-4">
                Our platform is designed to facilitate environmental conservation through:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Tree planting campaign organization and participation</li>
                <li>Innovation project submissions and funding connections</li>
                <li>Environmental education and community building</li>
                <li>Impact tracking and gamification</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <p className="text-gray-700 mb-4">As a platform user, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and truthful information</li>
                <li>Respect other users and maintain civil discourse</li>
                <li>Submit genuine tree planting evidence and project proposals</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in fraudulent or misleading activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Participation</h2>
              <p className="text-gray-700 mb-4">
                When participating in tree planting campaigns:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Photo submissions must be authentic and unaltered</li>
                <li>Tree planting claims are subject to verification</li>
                <li>False reporting may result in account suspension</li>
                <li>Impact points are awarded based on verified activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Innovation Hub</h2>
              <p className="text-gray-700 mb-4">
                For innovation project submissions:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Projects must focus on environmental sustainability</li>
                <li>All submissions are subject to admin review and approval</li>
                <li>Intellectual property rights remain with the creator</li>
                <li>We facilitate connections but do not guarantee funding</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">Users may not:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Submit false or misleading information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate intellectual property rights</li>
                <li>Attempt to manipulate the point or badge system</li>
                <li>Use the platform for commercial spam or solicitation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Termination</h2>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate accounts that violate these terms 
                or engage in activities harmful to the platform or its community.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700">
                The platform is provided "as is" without warranties. We are not liable for 
                any damages arising from platform use, campaign participation, or innovation 
                project outcomes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, contact us at{' '}
                <a href="mailto:legal@maathai-catalyst.org" className="text-primary-600 hover:underline">
                  legal@maathai-catalyst.org
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
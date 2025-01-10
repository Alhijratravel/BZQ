import React from 'react';
import { Shield, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-3xl font-bold">Privacy Policy</h1>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">1.1. Personal Information</h3>
                    <ul className="list-disc pl-6 text-gray-600">
                      <li>Name and contact information</li>
                      <li>Date of birth</li>
                      <li>Payment information</li>
                      <li>Family member details</li>
                    </ul>

                    <h3 className="text-lg font-medium">1.2. Usage Information</h3>
                    <ul className="list-disc pl-6 text-gray-600">
                      <li>Log data and device information</li>
                      <li>Subscription usage patterns</li>
                      <li>Communication preferences</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">We use your information to:</p>
                    <ul className="list-disc pl-6 text-gray-600">
                      <li>Provide and maintain our services</li>
                      <li>Process payments and subscriptions</li>
                      <li>Send important notifications</li>
                      <li>Improve our services</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">3. Data Protection</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      We implement appropriate technical and organizational measures to protect your
                      personal data against unauthorized or unlawful processing, accidental loss,
                      destruction, or damage.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Security Measures Include:</h3>
                      <ul className="list-disc pl-6 text-gray-600">
                        <li>Encryption of personal data</li>
                        <li>Regular security assessments</li>
                        <li>Access controls and authentication</li>
                        <li>Secure data backups</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">4. Your Rights</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">You have the right to:</p>
                    <ul className="list-disc pl-6 text-gray-600">
                      <li>Access your personal data</li>
                      <li>Correct inaccurate data</li>
                      <li>Request deletion of your data</li>
                      <li>Object to data processing</li>
                      <li>Data portability</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">5. Data Retention</h2>
                  <p className="text-gray-600">
                    We retain your personal data only for as long as necessary to fulfill the purposes
                    for which it was collected, including legal, accounting, or reporting requirements.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">6. Cookies and Tracking</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      We use cookies and similar tracking technologies to track activity on our service
                      and hold certain information. You can instruct your browser to refuse all cookies
                      or to indicate when a cookie is being sent.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Types of Cookies We Use:</h3>
                      <ul className="list-disc pl-6 text-gray-600">
                        <li>Essential cookies for service operation</li>
                        <li>Analytics cookies to improve our service</li>
                        <li>Preference cookies to remember your settings</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
                  <p className="text-gray-600">
                    If you have any questions about this Privacy Policy, please{' '}
                    <Link to="/contact" className="text-indigo-600 hover:text-indigo-800">
                      contact us
                    </Link>
                    .
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
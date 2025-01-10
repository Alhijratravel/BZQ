import React from 'react';
import { Shield, Lock, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Scale className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-3xl font-bold">Terms of Service</h1>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">
                  Last updated: {new Date().toLocaleDateString()}
                </p>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-600">
                    By accessing and using our services, you agree to be bound by these Terms of Service
                    and all applicable laws and regulations. If you do not agree with any of these terms,
                    you are prohibited from using or accessing our service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">2. Subscription Terms</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      2.1. Subscription periods begin on the date that you activate your subscription.
                    </p>
                    <p className="text-gray-600">
                      2.2. Family members must be added according to our family member policies.
                    </p>
                    <p className="text-gray-600">
                      2.3. Family members over 18 may be subject to additional fees as addon members.
                    </p>
                    <p className="text-gray-600">
                      2.4. At age 23, family members must transition to their own individual accounts.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">3. Payment Terms</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      3.1. We accept payments via SEPA Direct Debit and iDEAL.
                    </p>
                    <p className="text-gray-600">
                      3.2. Subscriptions are automatically renewed unless cancelled.
                    </p>
                    <p className="text-gray-600">
                      3.3. Refunds are processed according to our refund policy.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">4. Cancellation Policy</h2>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      4.1. You may cancel your subscription at any time through your account dashboard.
                    </p>
                    <p className="text-gray-600">
                      4.2. Cancellations take effect at the end of the current billing period.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">5. Changes to Terms</h2>
                  <p className="text-gray-600">
                    We reserve the right to modify these terms at any time. We will notify users of any
                    material changes via email or through our platform.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">6. Contact Information</h2>
                  <p className="text-gray-600">
                    For questions about these Terms of Service, please contact us at{' '}
                    <Link to="/contact" className="text-indigo-600 hover:text-indigo-800">
                      our contact page
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
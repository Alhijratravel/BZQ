import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "How do family plans work?",
    answer: "Our family plans allow you to add multiple family members under one subscription. Each member gets their own access while you manage everything from a single account. As your family grows, you can easily add or remove members."
  },
  {
    question: "What happens when a family member turns 18?",
    answer: "When a family member turns 18, they can remain on the family plan as an addon member. This may involve a small additional fee. They'll receive a notification about their options and can choose to stay on the family plan or create their own account."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept SEPA Direct Debit for automatic recurring payments and iDEAL for manual payments. Both methods are secure and widely used in Europe."
  },
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
  },
  {
    question: "How do I add or remove family members?",
    answer: "You can easily manage family members from your dashboard. Simply go to the 'Family Members' section to add new members or update existing ones."
  },
  {
    question: "What happens at age 23?",
    answer: "At age 23, family members will need to transition to their own individual account. We'll help make this transition smooth by automatically creating a new account and transferring their data."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h1>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between focus:outline-none"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Still have questions? Contact our support team.
            </p>
            <a
              href="/contact"
              className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
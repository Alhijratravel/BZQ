import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Shield, CreditCard, Clock, Star, Check } from 'lucide-react';
import TopNav from '../components/layout/TopNav';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-dark-900 dark:to-dark-800">
      <TopNav />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Family Subscription Plans Made Simple
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Join thousands of families who trust us with their subscription needs.
              Simple, flexible, and affordable plans designed for modern families.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/plans"
                className="px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
              >
                View Plans
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors border border-gray-200 dark:border-dark-600"
              >
                Contact Sales
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-8">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Shield className="h-5 w-5 mr-2" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Users className="h-5 w-5 mr-2" />
                <span>10k+ Families</span>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Star className="h-5 w-5 mr-2" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-dark-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose FamilyPlans?</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide the best subscription management experience for families of all sizes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Users,
                title: 'Family-First Design',
                description: 'Tailored for families with easy member management and flexible plans that grow with you.'
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                description: 'Bank-grade security with SEPA Direct Debit and iDEAL payment options for peace of mind.'
              },
              {
                icon: Clock,
                title: 'Smart Transitions',
                description: 'Seamless age-based transitions and family member management as your family evolves.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-dark-700 p-8 rounded-2xl hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-dark-900 dark:to-dark-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the perfect plan for your family. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 29.99,
                features: ['Up to 4 family members', 'Basic features', '24/7 support']
              },
              {
                name: 'Premium',
                price: 49.99,
                features: ['Up to 8 family members', 'Premium features', 'Priority support', 'Advanced analytics']
              },
              {
                name: 'Enterprise',
                price: 99.99,
                features: ['Unlimited family members', 'Custom features', 'Dedicated support', 'Custom analytics']
              }
            ].map((plan, index) => (
              <div key={index} className={`
                bg-white dark:bg-dark-700 rounded-2xl p-8 
                ${index === 1 ? 'border-2 border-indigo-500 shadow-xl relative' : 'border border-gray-200 dark:border-dark-600'}
              `}>
                {index === 1 && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold dark:text-white">${plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600 dark:text-gray-300">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/plans"
                  className={`
                    block w-full py-3 rounded-lg text-center font-semibold transition-colors
                    ${index === 1 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-50 dark:bg-dark-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-500'}
                  `}
                >
                  Choose Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 dark:bg-indigo-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join our community of happy families and experience the difference today.
          </p>
          <Link
            to="/plans"
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
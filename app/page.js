import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative isolate overflow-hidden">
      {/* Hero section */}
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Dine with Confidence
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Instantly scan restaurant menus to identify allergens and ingredients. 
            Stay safe and informed about what you eat.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {session ? (
              <Link
                href="/scan"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Scan Menu
              </Link>
            ) : (
              <Link
                href="/auth/signup"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started
              </Link>
            )}
            <Link
              href="/about"
              className="text-lg font-semibold leading-6 text-gray-900"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              Safe Dining Experience
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to scan menus for allergens
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  Quick Scanning
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Upload a menu photo and get instant analysis of ingredients and potential allergens.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  Personalized Alerts
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Set your allergen preferences and receive customized warnings based on your needs.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  Scan History
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Keep track of your previous scans and build a history of safe menu items.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

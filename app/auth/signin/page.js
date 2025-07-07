import AuthForm from '../components/AuthForm';

export const metadata = {
  title: 'Sign In - SafePlate',
  description: 'Sign in to your SafePlate account',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to SafePlate
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your allergen preferences and scan history
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthForm mode="signin" />
        </div>
      </div>
    </div>
  );
}
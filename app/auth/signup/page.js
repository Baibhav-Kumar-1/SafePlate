import AuthForm from '../components/AuthForm';

export const metadata = {
  title: 'Sign Up - SafePlate',
  description: 'Create your SafePlate account',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Start managing your food allergen preferences with SafePlate
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
}
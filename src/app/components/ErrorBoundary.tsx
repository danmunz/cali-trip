import { useRouteError, isRouteErrorResponse, Link } from 'react-router';

export default function ErrorBoundary() {
  const error = useRouteError();
  
  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || 'An error occurred';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = 'Unknown error';
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          {errorStatus && (
            <h1 className="text-8xl font-bold text-gray-300 mb-4">{errorStatus}</h1>
          )}
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            {errorStatus === 404 ? 'Page Not Found' : 'Something Went Wrong'}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {errorStatus === 404
              ? "The page you're looking for doesn't exist."
              : errorMessage}
          </p>
        </div>
        
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-[#b8956d] text-white rounded-md hover:bg-[#a07f5d] transition-colors font-medium"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}

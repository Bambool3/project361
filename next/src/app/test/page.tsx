// MyPage.tsx
import React from 'react';

const MyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-purple-600 mb-4">Hello from TSX!</h1>
      <p className="text-gray-700">
        This is a simple page written in TypeScript using React and Tailwind CSS.
      </p>
      <button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
        Click Me
      </button>
    </div>
  );
};

export default MyPage;

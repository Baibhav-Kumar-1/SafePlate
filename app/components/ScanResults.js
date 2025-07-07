'use client';

const ConfidenceIndicator = ({ value }) => {
  const percentage = Math.round(value * 100);
  let color = 'bg-red-500';
  if (percentage >= 80) color = 'bg-green-500';
  else if (percentage >= 50) color = 'bg-yellow-500';

  return (
    <div className="relative w-full h-2 bg-gray-200 rounded">
      <div
        className={`absolute left-0 top-0 h-full ${color} rounded`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default function ScanResults({ results }) {
  if (!results?.data) return null;
  
  const { menuItems, warnings, confidence, text } = results.data;

  return (
    <div className="space-y-6">
      {/* Overall Scan Confidence */}
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Scan Accuracy
        </h3>
        <ConfidenceIndicator value={confidence} />
        <p className="mt-1 text-xs text-gray-500">
          {Math.round(confidence * 100)}% confidence in text recognition
        </p>
      </div>

      {/* Allergen Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Allergen Warnings Found
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index} className="space-y-1">
                      <div className="font-medium">
                        {warning.allergen.charAt(0).toUpperCase() + warning.allergen.slice(1)}
                        {warning.severity !== 'unknown' && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 rounded-full">
                            {warning.severity} severity
                          </span>
                        )}
                      </div>
                      {warning.mentions.map((mention, idx) => (
                        <div key={idx} className="text-xs ml-4">
                          Found "{mention.term}" in: "{mention.context}"
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      {menuItems && menuItems.length > 0 && (
        <div className="bg-white rounded-lg border divide-y">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">
              Detected Menu Items
            </h3>
          </div>
          {/* Group items by category */}
          {Object.entries(
            menuItems.reduce((acc, item) => {
              if (!acc[item.category]) acc[item.category] = [];
              acc[item.category].push(item);
              return acc;
            }, {})
          ).map(([category, items]) => (
            <div key={category} className="divide-y">
              {/* Category Header */}
              <div className="p-4 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900">
                  {category}
                </h3>
              </div>
              {/* Category Items */}
              {items.map((item, index) => (
                <div key={index} className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.name}
                    </h4>
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {item.price}
                    </span>
                  </div>
                  {item.ingredients && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Ingredients: </span>
                      {item.ingredients}
                    </div>
                  )}
                  {item.allergens?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.allergens.map((allergen, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Extracted Text */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-900">
            Extracted Text
          </h3>
          <button
            onClick={() => {
              navigator.clipboard.writeText(text);
            }}
            className="text-xs text-blue-600 hover:text-blue-500"
          >
            Copy text
          </button>
        </div>
        <div className="bg-white rounded border p-3 max-h-96 overflow-auto">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
            {text || 'No text extracted'}
          </pre>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-8 max-w-4xl">
        <h1 className="text-5xl font-bold mb-8 text-red-500 tracking-wider">
          MARVEL RECOGNITION
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="block w-full p-4 border-2 border-dashed border-gray-600 rounded-lg
                    hover:border-red-500 transition-colors cursor-pointer text-center"
                >
                  {preview ? 'Change Image' : 'Upload Image'}
                </label>
              </div>
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3 bg-red-600 text-white rounded-lg
                  hover:bg-red-700 transition-all transform hover:scale-[1.02]
                  disabled:bg-gray-700 disabled:cursor-not-allowed
                  font-medium tracking-wide"
              >
                {loading ? 'ANALYZING...' : 'IDENTIFY CHARACTER'}
              </button>
            </form>

            {preview && (
              <div className="rounded-lg overflow-hidden border-2 border-gray-800">
                <img src={preview} alt="Preview" className="w-full h-auto" />
              </div>
            )}
          </div>

          {result && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 self-start">
              <h2 className="text-2xl font-bold mb-6 text-red-500">ANALYSIS RESULTS</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">ACTOR</p>
                  <p className="text-xl font-medium">{result.actor}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">CHARACTER</p>
                  <p className="text-xl font-medium">{result.character}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">CONFIDENCE</p>
                  <p className="text-xl font-medium">{(result.confidence * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
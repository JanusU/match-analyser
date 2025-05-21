import React, { useState } from "react";

const MatchUploader = ({onUploadComplete}) => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAnalysis(null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    setLoading(true);

    const formData = new FormData();
    formData.append("matchFile", file);

    try {
      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setAnalysis(data.message);
	  onUploadComplete();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Something went wrong during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 shadow-xl rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Upload CS Match Log (.txt)</h2>

      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="mb-4 block w-full"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={!file || loading}
      >
        {loading ? "Uploading..." : "Analyze Match"}
      </button>

      {analysis && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Match Analysis</h3>
          <pre className="text-sm p-3 rounded max-h-96">
            {analysis}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MatchUploader;

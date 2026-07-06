import { useState } from "react";
import Layout from "../components/Layout";
import { uploadDocument } from "../api";

function Upload() {
  const [file, setFile] = useState(null);

  async function handleUpload() {
    if (!file) {
      alert("Select a file first");
      return;
    }

    const result = await uploadDocument(file);

    alert(result.message);
  }

  return (
    <Layout>
      <h1>Upload Document</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={handleUpload}>
        Upload
      </button>
    </Layout>
  );
}

export default Upload;
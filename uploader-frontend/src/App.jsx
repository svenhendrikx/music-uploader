import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseBlob } from 'music-metadata';

function App() {
  const [files, setFiles] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const baseUrl = `${window.location.protocol}//${window.location.hostname}:8000`;


  const onDrop = async (acceptedFiles) => {
    setFiles(acceptedFiles);
    const metadataArray = await Promise.all(
      acceptedFiles.map(async (file) => {
        const metadata = await parseBlob(file);
        console.log(metadata)
        return { file, metadata: metadata.common };
      })
    );
    setMetadata(metadataArray);
  };

  const handleTagChange = (index, key, value) => {
    const newMetadata = [...metadata];
    newMetadata[index].metadata[key] = value;
    setMetadata(newMetadata);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    metadata.forEach(({ file, metadata }) => {
      formData.append('files', file);
      formData.append('metadata', JSON.stringify(metadata));
    });

    await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps({ style: { border: '2px dashed gray', padding: '20px' } })}>
        <input {...getInputProps()} />
        Drag & drop music files here or click to select files
      </div>
      <div>
        {metadata.map((item, index) => (
          <div key={index}>
            <h4>{item.file.name}</h4>
            {Object.keys(item.metadata).map((key) => (
              <div key={key}>
                <label>{key}:</label>
                <input
                  type="text"
                  value={item.metadata[key] || ''}
                  onChange={(e) => handleTagChange(index, key, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}

export default App;



import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileLoad: (content: string, fileName: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    // Block binary .evtx files explicitly
    if (extension === '.evtx') {
      setError(
        '❌ .evtx files are binary Windows Event Logs and cannot be parsed in-browser. ' +
        'Please export from Event Viewer as CSV, XML, or TXT format.'
      );
      return false;
    }

    // Check file type
    const validTypes = ['text/plain', 'text/csv', 'text/xml', 'application/xml', 'application/json', 'application/octet-stream'];
    const validExtensions = ['.log', '.txt', '.csv', '.xml', '.json'];

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      setError('Invalid file type. Please upload .log, .txt, .csv, .xml, or .json files.');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 10MB limit. Current file: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please export filtered logs if needed.`);
      return false;
    }

    return true;
  };

  const readFile = (file: File) => {
    if (!validateFile(file)) return;

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    // Show warning for Windows log exports
    if (extension === '.csv' || extension === '.xml') {
      setWarning(
        '⚠️ Windows event logs can be large. For performance and privacy, this tool supports up to 10MB per file. ' +
        'Export filtered logs from Event Viewer if needed.'
      );
    } else {
      setWarning('');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setFileName(file.name);
        setFileSize(file.size);
        setError('');
        onFileLoad(content, file.name);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsText(file);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      readFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div className="file-upload-container">
      <form
        className={`file-upload ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-input"
          type="file"
          accept=".log,.txt,.csv,.xml,.json"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <p>Drag & drop your log file here</p>
          <p className="upload-subtext">or</p>
          <button
            type="button"
            onClick={onButtonClick}
            className="browse-button"
          >
            Browse Files
          </button>
          <p className="file-info">
            Supported: .log, .txt, .csv, .xml, .json (Max 10MB)
          </p>
          <p className="file-note">
            ⚠️ Windows .evtx files must be exported as CSV/XML from Event Viewer
          </p>
        </div>
      </form>

      {warning && (
        <div className="warning-message">
          {warning}
        </div>
      )}

      {fileName && (
        <div className="file-info-display">
          <p>Loaded: {fileName} ({(fileSize / 1024).toFixed(2)} KB)</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
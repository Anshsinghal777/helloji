import axiosInstance from '../utils/axios.js';
import { useParams } from 'react-router';
import { useState, useRef } from "react";

function VideoUpload() {
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [videoDimensions, setVideoDimensions] = useState(null);
  const fileInputRef = useRef(null);
  const { problemId } = useParams();

  // Actual validation constants
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
  const ALLOWED_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime']; // MOV uses quicktime mime
  const ALLOWED_EXTENSIONS = ['.mp4', '.webm', '.mov'];
  const RECOMMENDED_ASPECT_RATIO = 16/9;
  const ASPECT_RATIO_TOLERANCE = 0.1; // 10% tolerance

  // Validate file before processing
  const validateFile = (file) => {
    // Reset error
    setError('');

    // Check if file exists
    if (!file) {
      setError('No file selected');
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 100MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }

    // Check file type by MIME
    if (!ALLOWED_FORMATS.includes(file.type)) {
      // Also check by extension as fallback
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        setError(`Invalid file format. Allowed: MP4, WebM, MOV. Received: ${file.type || fileExtension}`);
        return false;
      }
    }

    return true;
  };

  // Get video dimensions and aspect ratio
  const getVideoDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function() {
        URL.revokeObjectURL(video.src);
        const width = this.videoWidth;
        const height = this.videoHeight;
        const aspectRatio = width / height;
        resolve({ width, height, aspectRatio });
      };

      video.onerror = function() {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // Process the selected file with validation
  const processFile = async (file) => {
    // Validate basic file properties
    if (!validateFile(file)) {
      return false;
    }

    try {
      setLoading(true);
      
      // Get video dimensions
      const dimensions = await getVideoDimensions(file);
      setVideoDimensions(dimensions);
      
      // Check aspect ratio (optional - warning only, not blocking)
      const ratioDiff = Math.abs(dimensions.aspectRatio - RECOMMENDED_ASPECT_RATIO);
      if (ratioDiff > ASPECT_RATIO_TOLERANCE) {
        setError(`Warning: Recommended aspect ratio is 16:9. Your video is ${dimensions.width}:${dimensions.height} (${dimensions.aspectRatio.toFixed(2)}:1)`);
        // We don't return false here because it's just a warning
      }

      // Set the video
      setVideo(file);
      
      // Create video preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      
      // Reset progress
      setUploadProgress(0);
      
      return true;
      
    } catch (err) {
      setError('Failed to process video: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processFile(file);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  // Clear selected video
  const clearVideo = () => {
    setVideo(null);
    setVideoDimensions(null);
    setError('');
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get signature from backend
  const getSignature = async () => {
    const res = await axiosInstance.get(`/video/create/${problemId}`);
    return res.data;
  };

  // Upload to Cloudinary with progress tracking
  const uploadToCloudinary = async () => {
    const data = await getSignature();

    const formData = new FormData();
    formData.append("file", video);
    formData.append("api_key", data.api_key);
    formData.append("timestamp", data.timestamp);
    formData.append("signature", data.signature);
    formData.append("public_id", data.public_id);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', data.upload_url);
      xhr.send(formData);
    });
  };

  // Save metadata in backend
  const saveVideoData = async (cloudinaryData) => {
    await axiosInstance.post("/video/save", {
      problemId,
      cloudinaryPublicId: cloudinaryData.public_id,
      secureUrl: cloudinaryData.secure_url,
      duration: cloudinaryData.duration,
      width: videoDimensions?.width,
      height: videoDimensions?.height,
      fileSize: video?.size,
      format: video?.type
    });
  };

  // Upload function
  const handleUpload = async () => {
    if (!video) {
      setError("Please select a video first");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      setError('');

      const cloudinaryData = await uploadToCloudinary();
      await saveVideoData(cloudinaryData);

      // Success - you might want to use a toast here
      alert("Video uploaded successfully!");
      clearVideo();
      setUploadProgress(100);

    } catch (err) {
      console.error(err);
      setError("Upload failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Delete function
  const handleDelete = async () => {
    const modal = document.getElementById('delete_modal');
    if (modal) {
      modal.showModal();
    }
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.delete(`/video/delete/${problemId}`);
      console.log("Delete success:", res.data);
      
      // Close modal
      document.getElementById('delete_modal').close();
      
      alert("Video deleted successfully!");
      clearVideo();
    } catch (err) {
      console.log("FULL ERROR:", err.response);
      setError(err.response?.data?.error || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
      {/* Main Card */}
      <div className="max-w-4xl mx-auto">
        <div className="card bg-gray-800/90 backdrop-blur-sm shadow-2xl border border-gray-700">
          
          {/* Card Header */}
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                upload your solution video
              </h2>
            
            </div>

            {/* Error Display */}
            {error && (
              <div className={`alert ${error.includes('Warning') ? 'alert-warning' : 'alert-error'} mb-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Upload Area */}
            <div className="mt-6">
              {!video ? (
                // Dropzone
                <div
                  className={`
                    border-2 border-dashed rounded-2xl p-8 md:p-12
                    transition-all duration-300 cursor-pointer
                    ${dragActive 
                      ? 'border-purple-400 bg-purple-400/10 scale-105' 
                      : 'border-gray-600 hover:border-purple-400 hover:bg-gray-700/50'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 mb-4 text-gray-400">
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                        />
                      </svg>
                    </div>
                    
                    <p className="text-xl font-semibold text-gray-300">
                      <span className="text-purple-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      MP4, WebM, or MOV (max. 100MB)
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Recommended: 16:9 aspect ratio
                    </p>
                  </div>
                </div>
              ) : (
                // Video Preview
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">{video.name}</p>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>{(video.size / (1024 * 1024)).toFixed(2)} MB</span>
                          {videoDimensions && (
                            <>
                              <span>•</span>
                              <span>{videoDimensions.width} x {videoDimensions.height}</span>
                              <span>•</span>
                              <span>{videoDimensions.aspectRatio.toFixed(2)}:1</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="btn btn-circle btn-sm btn-ghost text-red-400 hover:bg-red-400/10"
                      onClick={clearVideo}
                      disabled={loading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </button>
                  </div>

                  <video 
                    src={videoPreview} 
                    controls 
                    className="w-full rounded-lg shadow-2xl"
                  />

                  {/* Progress Bar */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Uploading...</span>
                        <span className="text-purple-400">{uploadProgress}%</span>
                      </div>
                      <progress 
                        className="progress progress-primary w-full" 
                        value={uploadProgress} 
                        max="100"
                      ></progress>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <button
                className={`
                  btn flex-1 gap-2
                  ${!video || loading ? 'btn-disabled' : 'btn-primary'}
                `}
                onClick={handleUpload}
                disabled={!video || loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" 
                      />
                    </svg>
                    Upload Video
                  </>
                )}
              </button>

              <button
                className="btn flex-1 gap-2 btn-outline btn-error"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                    Delete Video
                  </>
                )}
              </button>
            </div>

            {/* Live Validation Info */}
            <div className="mt-8 p-4 bg-gray-700/30 rounded-lg">
              <h3 className="font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                Video Guidelines (Live Checked ✓)
              </h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full ${!video || (video?.size <= MAX_FILE_SIZE) ? 'bg-green-500/20 text-green-400' : 'bg-gray-600'}`}>
                    ✓
                  </span>
                  <span className="text-gray-400">
                    Maximum file size: 100MB 
                    {video && ` (${(video.size / (1024 * 1024)).toFixed(2)}MB)`}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full ${!video || ALLOWED_FORMATS.includes(video?.type) || ALLOWED_EXTENSIONS.includes('.' + video?.name?.split('.').pop()) ? 'bg-green-500/20 text-green-400' : 'bg-gray-600'}`}>
                    ✓
                  </span>
                  <span className="text-gray-400">
                    Supported formats: MP4, WebM, MOV
                    {video && ` (${video.type || video.name.split('.').pop()})`}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full ${!videoDimensions || Math.abs(videoDimensions.aspectRatio - RECOMMENDED_ASPECT_RATIO) <= ASPECT_RATIO_TOLERANCE ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {!videoDimensions || Math.abs(videoDimensions.aspectRatio - RECOMMENDED_ASPECT_RATIO) <= ASPECT_RATIO_TOLERANCE ? '✓' : '⚠'}
                  </span>
                  <span className="text-gray-400">
                    Recommended aspect ratio: 16:9
                    {videoDimensions && ` (${videoDimensions.width}:${videoDimensions.height})`}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <dialog id="delete_modal" className="modal">
        <div className="modal-box bg-gray-800">
          <h3 className="font-bold text-lg text-error flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            Confirm Delete
          </h3>
          
          <p className="py-4 text-gray-300">
            Are you sure you want to delete this video? This action cannot be undone.
          </p>
          
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">Cancel</button>
              <button className="btn btn-error" onClick={confirmDelete}>
                Delete
              </button>
            </form>
          </div>
        </div>
        
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

export default VideoUpload;
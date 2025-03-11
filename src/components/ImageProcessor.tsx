import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Eraser, Wand2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/auth';
import { uploadImage, removeBackground, smartInpaint } from '../lib/api';

type ProcessingType = 'rmbg' | 'inpaint' | null;

export function ImageProcessor() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingType>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  const processImage = async (type: ProcessingType) => {
    if (!image || !originalFile || !user) return;
    
    try {
      setProcessing(type);
      
      const imageUrl = await uploadImage(originalFile, user.id);
      
      let processedImageUrl;
      if (type === 'rmbg') {
        processedImageUrl = await removeBackground(imageUrl);
      } else if (type === 'inpaint') {
        processedImageUrl = await smartInpaint(imageUrl, '');
      }
      
      if (processedImageUrl) {
        setProcessedImage(processedImageUrl);
        toast.success(`Image ${type === 'rmbg' ? 'background removed' : 'inpainted'} successfully!`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the image';
      toast.error(errorMessage);
      console.error('Image processing error:', error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Image Processor</h1>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* 左侧：原始图像（带有拖放功能） */}
          <div className='space-y-4'>  
            <h2 className="text-xl font-semibold">Original Image</h2>
            <div 
              {...getRootProps()}
              className={
                `relative aspect-video rounded-lg overflow-hidden cursor-pointer 
                ${image ? 'bg-gray-800' : 'border-2 border-dashed transition-colors'}
                ${!image && isDragActive ? 'border-blue-500 bg-blue-500/10' : !image ? 'border-gray-600 hover:border-gray-500' : ''}
                `}>
              <input {...getInputProps()} />

              {image ? (
                <>
                  {/*图片已上传 - 显示图片并添加覆盖层指示可更改 */}
                  <img src={image} alt="Original" className='w-full h-full object-contain'/>
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity text-white text-center p-4">
                  <RefreshCw className="mx-auto mb-2 w-10 h-10" />
                  <p>Drop new image or click to change</p>
                  </div>
                  </div>
                  </>
              ) : (
                //未上传图片 - 显示上传指示
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Upload className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                  <p className="text-lg mb-2">Drag & drop an image here, or click to select</p>
                  <p className="text-sm text-gray-400">Supports PNG, JPG</p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：处理后的图像 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Processed Image</h2>
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              {processedImage ? (
                <img src={processedImage} alt="Processed" className="w-full h-full object-contain" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  {image ? "Process your image to see results" : "Upload an image first"}
                </div>
              )}
            </div>
          </div>

          
          {/* 底部：处理按钮 */}
          <div className="md:col-span-2 flex gap-4 justify-center mt-4">
            <button
              onClick={() => processImage('rmbg')}
              disabled={processing !== null || !image}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              <Eraser className="w-5 h-5" />
              {processing === 'rmbg' ? 'Removing Background...' : 'Remove Background'}
            </button>
            <button
              onClick={() => processImage('inpaint')}
              disabled={processing !== null || !image}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              <Wand2 className="w-5 h-5" />
              {processing === 'inpaint' ? 'Inpainting...' : 'Smart Inpaint'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
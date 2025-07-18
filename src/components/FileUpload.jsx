import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileUpload, isLoading }) => {
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.csv')) {
        onFileUpload(file);
      } else {
        alert('Поддерживаются только CSV файлы с разделителем ";"');
      }
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.name.endsWith('.csv')) {
        onFileUpload(file);
      } else {
        alert('Поддерживаются только CSV файлы с разделителем ";"');
      }
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Загрузка данных</h2>
        <p className="text-gray-300">Выберите CSV файл для анализа транзакций</p>
      </div>

      <div 
        className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition-colors duration-200"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Перетащите файл сюда или нажмите для выбора
            </h3>
            <p className="text-gray-300 text-sm">
              Поддерживаются только CSV файлы с разделителем ";"
            </p>
          </div>

          <label className="inline-block">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer disabled:opacity-50">
              <FileText className="w-5 h-5 mr-2" />
              {isLoading ? 'Обработка...' : 'Выбрать файл'}
            </span>
          </label>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-200">
            <p className="font-medium mb-1">Формат файла:</p>
            <p>CSV файл с разделителем ";" и заголовками:</p>
            <code className="text-xs bg-black/20 px-2 py-1 rounded mt-1 block">
              Reference ID;Client Operation id;Method;Operation State;Status;Initial Amount;Initial Currency;Charged Amount;Charged Currency
            </code>
            <p className="mt-2 text-xs text-yellow-300">
              Если у вас Excel файл, сохраните его как CSV с разделителем ";"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 
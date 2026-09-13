import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Terminal, Server, Sparkles } from 'lucide-react';
import { BackendConfig } from '../types';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BackendConfig;
  onSaveConfig: (updated: BackendConfig) => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [sourceType, setSourceType] = useState<'integrated' | 'custom'>(config.sourceType);
  const [customUrl, setCustomUrl] = useState(config.customUrl || 'http://127.0.0.1:8000');
  const [customPath, setCustomPath] = useState(config.customPath || '/api/gifts');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    statusCode?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-external-backend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customUrl, path: customPath }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message,
        statusCode: data.statusCode,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error attempting to reach local server',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      sourceType,
      customUrl,
      customPath,
      status: testResult?.success ? 'online' : testResult ? 'offline' : config.status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        id="backend-config-modal"
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-stone-700" />
            <h2 className="text-base font-semibold text-stone-900">Data Source & Backend Settings</h2>
          </div>
          <button
            id="close-backend-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p className="text-xs text-stone-600">
            Select where to fetch gift ideas from. You can use the built-in Gemini engine or connect your custom local server (e.g., <code className="px-1 py-0.5 bg-stone-100 rounded text-stone-800 font-mono">http://127.0.0.1:8000</code>).
          </p>

          {/* Option 1: Integrated Engine */}
          <label
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              sourceType === 'integrated'
                ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <input
              type="radio"
              name="sourceType"
              value="integrated"
              checked={sourceType === 'integrated'}
              onChange={() => setSourceType('integrated')}
              className="mt-1 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <div className="flex items-center gap-1.5 font-medium text-sm text-stone-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Integrated AI Engine (Flipkart & Amazon Verified)
              </div>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Uses Google Gemini + real Amazon and Flipkart verified products with automated deduplication tracking. Works instantly with zero setup.
              </p>
            </div>
          </label>

          {/* Option 2: Custom Backend */}
          <label
            className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
              sourceType === 'custom'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <input
              type="radio"
              name="sourceType"
              value="custom"
              checked={sourceType === 'custom'}
              onChange={() => setSourceType('custom')}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div className="w-full">
              <div className="flex items-center gap-1.5 font-medium text-sm text-stone-900">
                <Terminal className="w-4 h-4 text-blue-600" />
                Custom Local Backend (<code className="text-xs font-mono text-blue-700">http://127.0.0.1:8000</code>)
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Point to your own local Python (FastAPI/Django) or Node server running on port 8000.
              </p>

              {sourceType === 'custom' && (
                <div className="mt-3 space-y-2.5 pt-2 border-t border-blue-200/60">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Base Host URL</label>
                    <input
                      id="custom-backend-url-input"
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="http://127.0.0.1:8000"
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Gifts Endpoint Path</label>
                    <input
                      id="custom-backend-path-input"
                      type="text"
                      value={customPath}
                      onChange={(e) => setCustomPath(e.target.value)}
                      placeholder="/api/gifts or /gifts"
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-stone-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      id="test-connection-button"
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
                    >
                      {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                      Test Connection
                    </button>

                    {testResult && (
                      <div className="flex items-center gap-1.5 text-xs">
                        {testResult.success ? (
                          <span className="text-emerald-700 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Connected!
                          </span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                            {testResult.message?.slice(0, 35)}...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
          <button
            id="cancel-backend-modal"
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            id="save-backend-modal"
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

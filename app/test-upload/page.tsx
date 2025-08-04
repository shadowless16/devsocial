import { TestUploadDebug } from "@/components/test-upload-debug";

export default function TestUploadPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">UploadThing Test Page</h1>
      <TestUploadDebug />
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Instructions:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Open the browser developer console (F12)</li>
          <li>Try uploading an image using the button above</li>
          <li>Check the console for debug messages</li>
          <li>The status should update as the upload progresses</li>
        </ol>
      </div>
    </div>
  );
}

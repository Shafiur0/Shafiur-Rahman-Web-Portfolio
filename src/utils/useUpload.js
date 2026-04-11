import * as React from 'react';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function shouldFallbackToDataUrl(status) {
  return status === 404 || status === 405 || status === 500 || status === 502 || status === 503;
}

function useUpload() {
  const [loading, setLoading] = React.useState(false);
  const upload = React.useCallback(async (input) => {
    try {
      setLoading(true);
      let response;
      let requestMode = "buffer";

      if ("file" in input && input.file) {
        requestMode = "file";
        const formData = new FormData();
        formData.append("file", input.file);
        response = await fetch("/_create/api/upload/", {
          method: "POST",
          body: formData
        });
      } else if ("url" in input) {
        requestMode = "url";
        response = await fetch("/_create/api/upload/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: input.url })
        });
      } else if ("base64" in input) {
        requestMode = "base64";
        response = await fetch("/_create/api/upload/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ base64: input.base64 })
        });
      } else {
        response = await fetch("/_create/api/upload/", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream"
          },
          body: input.buffer
        });
      }

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("Upload failed: File too large.");
        }

        if (requestMode === "file" && input.file && shouldFallbackToDataUrl(response.status)) {
          const dataUrl = await fileToDataUrl(input.file);
          return {
            url: dataUrl,
            mimeType: input.file.type || null,
          };
        }

        if (requestMode === "url" && input.url) {
          return { url: input.url, mimeType: null };
        }

        if (requestMode === "base64" && input.base64) {
          return { url: input.base64, mimeType: null };
        }

        throw new Error("Upload failed");
      }

      const data = await response.json();

      if (!data?.url) {
        if (requestMode === "file" && input.file) {
          const dataUrl = await fileToDataUrl(input.file);
          return {
            url: dataUrl,
            mimeType: input.file.type || null,
          };
        }

        throw new Error("Upload failed: no URL returned");
      }

      return { url: data.url, mimeType: data.mimeType || null };
    } catch (uploadError) {
      if (uploadError instanceof Error) {
        return { error: uploadError.message };
      }
      if (typeof uploadError === "string") {
        return { error: uploadError };
      }
      return { error: "Upload failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  return [upload, { loading }];
}

export { useUpload };
export default useUpload;
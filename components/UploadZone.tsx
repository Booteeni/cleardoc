// Upload UI component: drag-and-drop + click-to-browse zone (no upload logic yet).

"use client";

import * as React from "react";

type UploadZoneProps = {
  file: File | null;
  onFileSelected: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
};

export function UploadZone({ file, onFileSelected, accept, disabled }: UploadZoneProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  function openFileDialog() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function setFirstFile(files: FileList | null) {
    const f = files?.item(0) ?? null;
    onFileSelected(f);
  }

  return (
    <section className="w-full">
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        disabled={disabled}
        onChange={(e) => setFirstFile(e.currentTarget.files)}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={openFileDialog}
        onDragEnter={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          setFirstFile(e.dataTransfer.files);
        }}
        className={[
          "group relative w-full min-h-[220px] rounded-2xl border border-dashed p-10 text-left transition sm:p-12",
          "border-[#4A90D9]/40 bg-[#4A90D9]/[0.04] hover:bg-[#4A90D9]/[0.06]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1f36] focus-visible:ring-offset-2",
          disabled ? "cursor-not-allowed opacity-60 hover:bg-[#4A90D9]/[0.04]" : "",
          isDragging
            ? "border-[#4A90D9] bg-[#4A90D9]/[0.08] shadow-[0_0_0_4px_rgba(74,144,217,0.10)]"
            : "hover:shadow-[0_0_0_4px_rgba(74,144,217,0.08)]"
        ].join(" ")}
        aria-label="Upload document"
      >
        <div className="flex flex-col items-center justify-center gap-5">
          <div
            className={[
              "flex h-16 w-16 items-center justify-center rounded-2xl border transition sm:h-[76px] sm:w-[76px]",
              "border-[#4A90D9]/20 bg-white shadow-sm",
              isDragging ? "shadow-[0_18px_40px_-28px_rgba(26,31,54,0.55)]" : ""
            ].join(" ")}
            aria-hidden="true"
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#4A90D9] transition group-hover:text-[#357bbd]"
            >
              <path
                d="M12 16V4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M7 9L12 4L17 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16.5C4 18.433 5.567 20 7.5 20H16.5C18.433 20 20 18.433 20 16.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-base font-semibold text-slate-900 sm:text-lg">
              Drag your document here or{" "}
              <span className="text-[#4A90D9]">click to browse</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">Accepts PDF, JPG, or PNG</p>
          </div>

          {!file ? null : (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800">
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"
                aria-hidden="true"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="max-w-[28ch] truncate font-medium sm:max-w-[40ch]">
                {file.name}
              </span>
            </div>
          )}
        </div>
      </button>
    </section>
  );
}

